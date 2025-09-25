import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const NCAT_API_URL = Deno.env.get("NCAT_API_URL");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface PythonExecuteRequest {
  code: string;
  timeout?: number;
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
    const body: PythonExecuteRequest = await req.json();

    // Validate required fields
    if (!body.code || typeof body.code !== "string" || body.code.trim() === "") {
      return new Response("code field is required and cannot be empty", { status: 400 });
    }

    // Validate timeout if provided
    if (
      body.timeout !== undefined &&
      (typeof body.timeout !== "number" || body.timeout < 1 || body.timeout > 300)
    ) {
      return new Response("timeout must be a number between 1 and 300 seconds", { status: 400 });
    }

    // Prepare NCAT API request
    const ncatPayload = {
      code: body.code,
      timeout: body.timeout || 30,
      webhook_url: `${SUPABASE_URL}/functions/v1/ncat-webhook`,
      id: body.custom_id || `python-exec-${Date.now()}`
    };

    // Call NCAT API
    const ncatResponse = await fetch(`${NCAT_API_URL}/v1/code/execute/python`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(ncatPayload)
    });

    if (!ncatResponse.ok) {
      const errorText = await ncatResponse.text();
      console.error("NCAT API error:", errorText);
      return new Response("Failed to execute Python code", { status: 500 });
    }

    const ncatResult = await ncatResponse.json();

    // Create job record with NCAT job ID for tracking
    if (ncatResult.job_id) {
      await supabase.from("jobs").insert({
        user_id: user.id,
        nca_job_id: ncatResult.job_id,
        custom_id: body.custom_id || `python-exec-${Date.now()}`,
        processing_status: "processing"
      });
    }

    // Return response to client
    return new Response(
      JSON.stringify({
        success: true,
        nca_job_id: ncatResult.job_id,
        message: "Python code execution started successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Python execute error:", error);
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
