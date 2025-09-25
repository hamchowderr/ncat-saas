import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const NCAT_API_URL = Deno.env.get("NCAT_API_URL");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface FFmpegOption {
  option: string;
  argument: string | number;
}

interface FFmpegInput {
  file_url: string;
  options?: FFmpegOption[];
}

interface FFmpegOutput {
  options: FFmpegOption[];
}

interface FFmpegComposeRequest {
  inputs: FFmpegInput[];
  outputs: FFmpegOutput[];
  custom_id?: string;
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Get user from auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Authorization required", { status: 401 });
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get user from JWT token
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response("Invalid authentication", { status: 401 });
    }

    // Parse request body
    const body: FFmpegComposeRequest = await req.json();

    // Validate required fields
    if (!body.inputs || !Array.isArray(body.inputs) || body.inputs.length === 0) {
      return new Response("inputs array is required and cannot be empty", { status: 400 });
    }

    if (!body.outputs || !Array.isArray(body.outputs) || body.outputs.length === 0) {
      return new Response("outputs array is required and cannot be empty", { status: 400 });
    }

    // Validate input structure
    for (const input of body.inputs) {
      if (!input.file_url || typeof input.file_url !== "string") {
        return new Response("Each input must have a valid file_url string", { status: 400 });
      }
    }

    // Validate output structure
    for (const output of body.outputs) {
      if (!output.options || !Array.isArray(output.options)) {
        return new Response("Each output must have an options array", { status: 400 });
      }
    }

    // Prepare NCAT API request
    const ncatPayload = {
      inputs: body.inputs,
      outputs: body.outputs,
      webhook_url: `${SUPABASE_URL}/functions/v1/ncat-webhook`,
      id: body.custom_id || `ffmpeg-compose-${Date.now()}`
    };

    // Call NCAT API
    const ncatResponse = await fetch(`${NCAT_API_URL}/v1/ffmpeg/compose`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(ncatPayload)
    });

    if (!ncatResponse.ok) {
      const errorText = await ncatResponse.text();
      console.error("NCAT API error:", errorText);
      return new Response("Failed to process FFmpeg composition", { status: 500 });
    }

    const ncatResult = await ncatResponse.json();

    // Create job record with NCAT job ID for tracking
    if (ncatResult.job_id) {
      await supabase.from("jobs").insert({
        user_id: user.id,
        nca_job_id: ncatResult.job_id,
        custom_id: body.custom_id || `ffmpeg-compose-${Date.now()}`,
        processing_status: "processing"
      });
    }

    // Return response to client
    return new Response(
      JSON.stringify({
        success: true,
        nca_job_id: ncatResult.job_id,
        message: "FFmpeg composition started successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("FFmpeg compose error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
