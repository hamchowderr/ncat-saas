import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import {
  validateRequiredString,
  buildErrorResponse,
  buildSuccessResponse,
  parseNcatResponse,
  replaceLocalhostUrl
} from "../_shared/validation.ts";

const NCAT_API_URL = Deno.env.get("NCAT_API_URL");
const NCAT_API_KEY = Deno.env.get("NCAT_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const WEBHOOK_URL = Deno.env.get("WEBHOOK_URL");
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
      webhook_url: replaceLocalhostUrl(`${WEBHOOK_URL}/functions/v1/ncat-webhook`),
      id: body.custom_id || `python-exec-${Date.now()}`
    };

    // Call NCAT API
    const ncatResponse = await fetch(`${NCAT_API_URL}/v1/code/execute/python`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": NCAT_API_KEY!
      },
      body: JSON.stringify(ncatPayload)
    });

    // Parse NCAT API response with error handling
    const parseResult = await parseNcatResponse(ncatResponse);
    if (!parseResult.success) {
      return parseResult.error!;
    }

    const ncatResult = parseResult.data;

    // Create job record with NCAT job ID for tracking
    if (ncatResult.job_id) {
      await supabase.from("jobs").insert({
        user_id: user.id,
        nca_job_id: ncatResult.job_id,
        nca_endpoint: "/v1/code/execute/python",
        custom_id: body.custom_id || `python-exec-${Date.now()}`,
        processing_status: "processing"
      });
    }

    // Return response to client
    return buildSuccessResponse({
        success: true,
        job_id: ncatResult.job_id,
        message: "Python code execution started successfully"
      });
  } catch (error) {
    console.error("Python execute error:", error);
    return buildErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "An unexpected error occurred",
      500
    );
  }
});
