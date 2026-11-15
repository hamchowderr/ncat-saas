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

interface MediaTranscribeRequest {
  media_url: string;
  source_file_id?: string;
  task?: string;
  response_type?: string;
  include_text?: boolean;
  include_srt?: boolean;
  include_segments?: boolean;
  custom_id?: string;
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
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
      return new Response("Invalid authentication", { status: 401 });
    }

    const body: MediaTranscribeRequest = await req.json();

    if (!body.media_url || typeof body.media_url !== "string") {
      return new Response("media_url is required", { status: 400 });
    }

    // Replace localhost/127.0.0.1 URLs with host.docker.internal for NCAT API (running in Docker)
    const processedMediaUrl = replaceLocalhostUrl(body.media_url);

    const ncatPayload = {
      media_url: processedMediaUrl,
      task: body.task,
      response_type: body.response_type,
      include_text: body.include_text,
      include_srt: body.include_srt,
      include_segments: body.include_segments,
      webhook_url: replaceLocalhostUrl(`${WEBHOOK_URL}/functions/v1/ncat-webhook`),
      id: body.custom_id || `media-transcribe-${Date.now()}`
    };

    const ncatResponse = await fetch(`${NCAT_API_URL}/v1/media/transcribe`, {
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

    if (ncatResult.job_id) {
      const { data: jobRecord, error: insertError } = await supabase
        .from("jobs")
        .insert({
          user_id: user.id,
          nca_job_id: ncatResult.job_id,
          nca_endpoint: "/v1/media/transcribe",
          custom_id: body.custom_id || `media-transcribe-${Date.now()}`,
          processing_status: "processing"
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("❌ Failed to create job record:", insertError);
      } else if (jobRecord && body.source_file_id) {
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

    return buildSuccessResponse({
        success: true,
        job_id: ncatResult.job_id,
        message: "Media transcription started successfully"
      });
  } catch (error) {
    console.error("Media transcribe error:", error);
    return buildErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "An unexpected error occurred",
      500
    );
  }
});
