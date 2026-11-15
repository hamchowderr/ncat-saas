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

interface MediaMetadataRequest {
  media_url: string;
  source_file_id?: string; // NEW: File ID from user's file picker
  id?: string;
}

Deno.serve(async (req) => {
  try {
    console.log("📨 Media metadata request received");

    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("❌ No authorization header");
      return new Response("Authorization required", { status: 401 });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("❌ Invalid authentication:", authError);
      return new Response("Invalid authentication", { status: 401 });
    }

    console.log(`✅ User authenticated: ${user.id}`);

    const body: MediaMetadataRequest = await req.json();

    // Validate required parameters
    if (!body.media_url || typeof body.media_url !== "string") {
      console.error("❌ Missing or invalid media_url");
      return new Response("media_url is required and must be a string", { status: 400 });
    }

    // Replace localhost/127.0.0.1 URLs with host.docker.internal for NCAT API (running in Docker)
    const processedMediaUrl = replaceLocalhostUrl(body.media_url);

    const ncatPayload = {
      media_url: processedMediaUrl,
      webhook_url: replaceLocalhostUrl(`${WEBHOOK_URL}/functions/v1/ncat-webhook`),
      ...(body.id && { id: body.id })
    };

    console.log("📤 Sending request to NCAT API:", {
      endpoint: `${NCAT_API_URL}/v1/media/metadata`,
      payload: ncatPayload
    });

    const ncatResponse = await fetch(`${NCAT_API_URL}/v1/media/metadata`, {
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
    console.log("✅ NCAT API response:", ncatResult);

    // Determine if the job completed immediately (metadata endpoint returns results instantly)
    const isCompleted = ncatResult.code === 200 && ncatResult.message === "success";
    const status = isCompleted ? "completed" : "processing";

    // Create job record with full data
    if (ncatResult.job_id) {
      console.log(
        `📝 Creating job record with nca_job_id: ${ncatResult.job_id}, status: ${status}`
      );

      const jobData = {
        user_id: user.id,
        nca_job_id: ncatResult.job_id,
        nca_endpoint: "/v1/media/metadata",
        custom_id: body.id || null,
        processing_status: status,
        nca_build_number: ncatResult.build_number?.toString(),
        nca_queue_length: ncatResult.queue_length,
        nca_queue_id: ncatResult.queue_id?.toString(),
        nca_total_time: ncatResult.total_time,
        nca_queue_time: ncatResult.queue_time,
        nca_run_time: ncatResult.run_time,
        nca_pid: ncatResult.pid,
        nca_code: ncatResult.code?.toString(),
        nca_message: ncatResult.response ? JSON.stringify(ncatResult.response) : ncatResult.message,
        error_message: ncatResult.code >= 400 ? ncatResult.message : null
      };

      const { data: jobRecord, error: insertError } = await supabase
        .from("jobs")
        .insert(jobData)
        .select("id")
        .single();

      if (insertError) {
        console.error("❌ Failed to create job record:", insertError);
      } else if (jobRecord) {
        console.log("✅ Job record created successfully with full metadata");

        // NEW: Create job_files relationship if source file ID was provided
        if (body.source_file_id) {
          const { error: jobFileError } = await supabase.from("job_files").insert({
            job_id: jobRecord.id,
            file_id: body.source_file_id,
            file_role: "input",
            sequence_number: 1
          });

          if (jobFileError) {
            console.warn("⚠️ Could not create job_files record:", jobFileError.message);
          } else {
            console.log(`✅ Linked source file ${body.source_file_id} to job ${jobRecord.id}`);
          }
        }
      }
    }

    return buildSuccessResponse({
        success: true,
        job_id: ncatResult.job_id,
        message: "Metadata extraction started successfully",
        custom_id: body.id || null
      });
  } catch (error) {
    console.error("💥 Media metadata error:", error);
    return buildErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "An unexpected error occurred",
      500
    );
  }
});
