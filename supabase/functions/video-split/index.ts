import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import {
  validateRequiredString,
  validateTimeFormat,
  validateNonEmptyArray,
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

interface SplitSegment {
  start: string; // Format: hh:mm:ss.ms
  end: string; // Format: hh:mm:ss.ms
}

interface VideoSplitRequest {
  video_url: string;
  source_file_id?: string; // Optional: Direct file ID for linking to job
  splits: SplitSegment[];
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

    const body: VideoSplitRequest = await req.json();

    // Validate required parameters
    if (!body.video_url || typeof body.video_url !== "string") {
      return new Response("video_url is required", { status: 400 });
    }

    if (!body.splits || !Array.isArray(body.splits) || body.splits.length === 0) {
      return new Response("splits array is required and cannot be empty", { status: 400 });
    }

    // Validate split segments (format: hh:mm:ss or hh:mm:ss.ms or hh:mm:ss.mmm)
    const timeRegex = /^\d{2}:\d{2}:\d{2}(\.\d{1,3})?$/;
    for (const split of body.splits) {
      if (!split.start || !split.end) {
        return new Response("Each split must have start and end times", { status: 400 });
      }
      if (!timeRegex.test(split.start) || !timeRegex.test(split.end)) {
        return new Response(
          "Split times must be in format hh:mm:ss or hh:mm:ss.ms (e.g., 00:00:10 or 00:00:10.500)",
          { status: 400 }
        );
      }
    }

    // Validate optional parameters
    if (
      body.video_crf !== undefined &&
      (typeof body.video_crf !== "number" || body.video_crf < 0 || body.video_crf > 51)
    ) {
      return new Response("video_crf must be a number between 0 and 51", { status: 400 });
    }

    // Replace localhost/127.0.0.1 URLs with host.docker.internal for NCAT API (running in Docker)
    let processedVideoUrl = body.video_url;
    if (
      processedVideoUrl.includes("127.0.0.1:54321") ||
      processedVideoUrl.includes("localhost:54321")
    ) {
      processedVideoUrl = processedVideoUrl
        .replace("http://127.0.0.1:54321", "http://host.docker.internal:54321")
        .replace("http://localhost:54321", "http://host.docker.internal:54321");
      console.log(`🔄 Replaced localhost URL with Docker host URL: ${processedVideoUrl}`);
    }

    const ncatPayload = {
      video_url: processedVideoUrl,
      splits: body.splits,
      video_codec: body.video_codec || "libx264",
      video_preset: body.video_preset || "medium",
      video_crf: body.video_crf || 23,
      audio_codec: body.audio_codec || "aac",
      audio_bitrate: body.audio_bitrate || "128k",
      webhook_url: replaceLocalhostUrl(
        body.webhook_url || `${WEBHOOK_URL}/functions/v1/ncat-webhook`
      ),
      id: body.id || `video-split-${Date.now()}`
    };

    const ncatResponse = await fetch(`${NCAT_API_URL}/v1/video/split`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": NCAT_API_KEY!
      },
      body: JSON.stringify(ncatPayload)
    });

    if (!ncatResponse.ok) {
      const errorText = await ncatResponse.text();
      console.error("NCAT API error:", errorText);
      return new Response("Failed to split video", { status: 500 });
    }

    // Try to parse response as JSON, handle plain text errors
    let ncatResult;
    const responseText = await ncatResponse.text();

    try {
      ncatResult = JSON.parse(responseText);
    } catch (parseError) {
      // NCAT API returned plain text error instead of JSON
      console.error("NCAT API returned non-JSON response:", responseText);
      return new Response(
        JSON.stringify({
          error: "Video split failed",
          message: responseText
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Create job record with NCAT job ID for tracking
    if (ncatResult.job_id) {
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .insert({
          user_id: user.id,
          nca_job_id: ncatResult.job_id,
          nca_endpoint: "/v1/video/split",
          custom_id: body.id || `video-split-${Date.now()}`,
          processing_status: "processing"
        })
        .select("id")
        .single();

      if (jobError) {
        console.error("❌ Failed to create job record:", jobError);
      } else if (jobData) {
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
          const { error: linkError } = await supabase.from("job_files").insert({
            job_id: jobData.id,
            file_id: sourceFileId,
            file_role: "input",
            sequence_number: 1
          });

          if (linkError) {
            console.warn("⚠️ Could not create job_files record:", linkError.message);
          } else {
            console.log(`✅ Linked source file ${sourceFileId} to job ${jobData.id}`);
          }
        } else {
          console.warn(`⚠️ No source file ID available for job ${jobData.id}`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        job_id: ncatResult.job_id,
        message: "Video splitting started successfully",
        response: ncatResult.response
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Video split error:", error);
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
