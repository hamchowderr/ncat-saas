import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import {
  validateRequiredString,
  validateSimpleTimeFormat,
  validateCrf,
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

interface VideoTrimRequest {
  video_url: string;
  source_file_id?: string;
  start?: string;
  end?: string;
  video_codec?: string;
  video_preset?: string;
  video_crf?: number;
  audio_codec?: string;
  audio_bitrate?: string;
  webhook_url?: string;
  id?: string;
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

    const body: VideoTrimRequest = await req.json();

    // Validate required parameters
    const urlError = validateRequiredString(body.video_url, "video_url");
    if (urlError) {
      return buildErrorResponse("Validation error", urlError);
    }

    // Validate time formats
    if (body.start && !validateSimpleTimeFormat(body.start)) {
      return buildErrorResponse(
        "Validation error",
        "start time must be in format hh:mm:ss or mm:ss (e.g., 00:01:30 or 01:30)"
      );
    }

    if (body.end && !validateSimpleTimeFormat(body.end)) {
      return buildErrorResponse(
        "Validation error",
        "end time must be in format hh:mm:ss or mm:ss (e.g., 00:05:00 or 05:00)"
      );
    }

    // Ensure at least one of start or end is provided
    if (!body.start && !body.end) {
      return buildErrorResponse(
        "Validation error",
        "At least one of 'start' or 'end' must be provided to trim the video"
      );
    }

    // Validate CRF if provided
    if (body.video_crf !== undefined && !validateCrf(body.video_crf)) {
      return buildErrorResponse(
        "Validation error",
        "video_crf must be a number between 0 and 51"
      );
    }

    // Replace localhost URLs for Docker compatibility
    const processedVideoUrl = replaceLocalhostUrl(body.video_url);

    const ncatPayload = {
      video_url: processedVideoUrl,
      start: body.start,
      end: body.end,
      video_codec: body.video_codec || "libx264",
      video_preset: body.video_preset || "medium",
      video_crf: body.video_crf || 23,
      audio_codec: body.audio_codec || "aac",
      audio_bitrate: body.audio_bitrate || "128k",
      webhook_url: replaceLocalhostUrl(
        body.webhook_url || `${WEBHOOK_URL}/functions/v1/ncat-webhook`
      ),
      id: body.id || `video-trim-${Date.now()}`
    };

    const ncatResponse = await fetch(`${NCAT_API_URL}/v1/video/trim`, {
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
      const { data: jobRecord, error: insertError } = await supabase
        .from("jobs")
        .insert({
          user_id: user.id,
          nca_job_id: ncatResult.job_id,
          nca_endpoint: "/v1/video/trim",
          custom_id: body.id || `video-trim-${Date.now()}`,
          processing_status: "processing"
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("❌ Failed to create job record:", insertError);
      } else if (jobRecord) {
        // Link source file to job as input (if provided)
        // Two approaches supported:
        // 1. Direct file ID (preferred): body.source_file_id
        // 2. Extract from URL: parse video_url to find file path

        let sourceFileId: string | null = body.source_file_id || null;

        // If no direct file ID, try to extract from video_url
        if (!sourceFileId) {
          let sourceFilePath: string | null = null;
          if (body.video_url.includes("/storage/v1/object/public/files/")) {
            const pathMatch = body.video_url.match(/\/storage\/v1\/object\/public\/files\/(.+)$/);
            if (pathMatch && pathMatch[1]) {
              sourceFilePath = decodeURIComponent(pathMatch[1]);
            }
          } else if (body.video_url.includes("/storage/v1/s3/files/")) {
            const pathMatch = body.video_url.match(/\/storage\/v1\/s3\/files\/(.+)$/);
            if (pathMatch && pathMatch[1]) {
              sourceFilePath = decodeURIComponent(pathMatch[1]);
            }
          }

          if (sourceFilePath) {
            // Look up file record by path
            const { data: sourceFile } = await supabase
              .from("files")
              .select("id")
              .eq("user_id", user.id)
              .eq("file_path", sourceFilePath)
              .single();

            if (sourceFile) {
              sourceFileId = sourceFile.id;
              console.log(`📎 Found source file via URL: ${sourceFilePath} -> ${sourceFileId}`);
            } else {
              console.warn(`⚠️ Source file not found in database: ${sourceFilePath}`);
            }
          } else {
            console.warn(`⚠️ Could not extract file path from video_url: ${body.video_url}`);
          }
        }

        // Create job_files link if we have a source file ID
        if (sourceFileId) {
          const { error: jobFileError } = await supabase.from("job_files").insert({
            job_id: jobRecord.id,
            file_id: sourceFileId,
            file_role: "input",
            sequence_number: 1
          });

          if (jobFileError) {
            console.warn("⚠️ Could not create job_files record:", jobFileError.message);
          } else {
            console.log(`✅ Linked source file ${sourceFileId} to job ${jobRecord.id}`);
          }
        } else {
          console.warn(`⚠️ No source file ID available for job ${jobRecord.id}`);
        }
      }
    }

    return buildSuccessResponse({
      success: true,
      job_id: ncatResult.job_id,
      message: "Video trimming started successfully",
      response: ncatResult.response
    });
  } catch (error) {
    console.error("Video trim error:", error);
    return buildErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "An unexpected error occurred",
      500
    );
  }
});
