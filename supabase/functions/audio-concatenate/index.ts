import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const NCAT_API_URL = Deno.env.get("NCAT_API_URL");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface AudioConcatenateRequest {
  audio_urls: { audio_url: string }[];
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
    const body: AudioConcatenateRequest = await req.json();

    // Validate required fields
    if (!body.audio_urls || !Array.isArray(body.audio_urls) || body.audio_urls.length === 0) {
      return new Response("audio_urls array is required", { status: 400 });
    }

    // Validate audio URLs
    for (const audio of body.audio_urls) {
      if (!audio.audio_url || typeof audio.audio_url !== "string") {
        return new Response("Each audio object must have a valid audio_url string", {
          status: 400
        });
      }
    }

    // Prepare NCAT API request
    const ncatPayload = {
      audio_urls: body.audio_urls,
      webhook_url: `${SUPABASE_URL}/functions/v1/ncat-webhook`,
      id: body.custom_id || `audio-concat-${Date.now()}` // Optional custom ID
    };

    // Call NCAT API
    const ncatResponse = await fetch(`${NCAT_API_URL}/v1/audio/concatenate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "your-api-key" // TODO: Add to env vars
      },
      body: JSON.stringify(ncatPayload)
    });

    if (!ncatResponse.ok) {
      const errorText = await ncatResponse.text();
      console.error("NCAT API error:", errorText);
      return new Response("Failed to process audio concatenation", { status: 500 });
    }

    const ncatResult = await ncatResponse.json();

    // Create job record with NCAT job ID for tracking
    if (ncatResult.job_id) {
      await supabase.from("jobs").insert({
        user_id: user.id,
        nca_job_id: ncatResult.job_id,
        custom_id: body.custom_id || `audio-concat-${Date.now()}`,
        processing_status: "processing",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Return response to client
    return new Response(
      JSON.stringify({
        success: true,
        nca_job_id: ncatResult.job_id,
        message: "Audio concatenation job started successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Audio concatenate error:", error);
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
