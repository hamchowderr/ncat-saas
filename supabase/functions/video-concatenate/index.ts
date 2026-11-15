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

interface VideoConcatenateRequest {
  video_urls: { video_url: string }[];
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

    const body: VideoConcatenateRequest = await req.json();

    if (!body.video_urls || !Array.isArray(body.video_urls) || body.video_urls.length === 0) {
      return new Response("video_urls array is required and cannot be empty", { status: 400 });
    }

    if (body.video_urls.length < 2) {
      return new Response("At least 2 videos are required for concatenation", { status: 400 });
    }

    // Validate and process video URLs (replace localhost with Docker host for NCAT API)
    const processedVideoUrls = body.video_urls.map((video) => {
      if (!video.video_url || typeof video.video_url !== "string") {
        throw new Error("Each video object must have a valid video_url string");
      }

      let processedUrl = video.video_url;
      if (processedUrl.includes("127.0.0.1:54321") || processedUrl.includes("localhost:54321")) {
        processedUrl = processedUrl
          .replace("http://127.0.0.1:54321", "http://host.docker.internal:54321")
          .replace("http://localhost:54321", "http://host.docker.internal:54321");
        console.log(`🔄 Replaced localhost URL with Docker host URL: ${processedUrl}`);
      }

      return { video_url: processedUrl };
    });

    const ncatPayload = {
      video_urls: processedVideoUrls,
      webhook_url: replaceLocalhostUrl(
        body.webhook_url || `${WEBHOOK_URL}/functions/v1/ncat-webhook`
      ),
      id: body.id || `video-concat-${Date.now()}`
    };

    const ncatResponse = await fetch(`${NCAT_API_URL}/v1/video/concatenate`, {
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
      // Insert job record and get the job ID
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .insert({
          user_id: user.id,
          nca_job_id: ncatResult.job_id,
          nca_endpoint: "/v1/video/concatenate",
          custom_id: body.id || `video-concat-${Date.now()}`,
          processing_status: "processing"
        })
        .select("id")
        .single();

      if (jobError) {
        console.error("Failed to create job record:", jobError);
      } else if (jobData?.id) {
        // Link input video files to the job
        // Extract file paths from video URLs to find corresponding file records
        const inputFilePaths = body.video_urls
          .map((video) => {
            const url = video.video_url;
            // Extract file path from URL like:
            // http://127.0.0.1:54321/storage/v1/object/public/files/uploads/user-id/filename.mp4
            // -> uploads/user-id/filename.mp4
            const pathMatch = url.match(/\/files\/(.+)$/);
            return pathMatch ? decodeURIComponent(pathMatch[1]) : null;
          })
          .filter(Boolean);

        if (inputFilePaths.length > 0) {
          // Find file records matching these paths
          const { data: inputFiles, error: filesError } = await supabase
            .from("files")
            .select("id, file_path")
            .eq("user_id", user.id)
            .in("file_path", inputFilePaths);

          if (filesError) {
            console.error("Failed to find input files:", filesError);
          } else if (inputFiles && inputFiles.length > 0) {
            // Create job_files records linking input files to the job
            const jobFilesRecords = inputFiles.map((file, index) => ({
              job_id: jobData.id,
              file_id: file.id,
              file_role: "input",
              sequence_number: index + 1 // Order matters for concatenation
            }));

            const { error: jobFilesError } = await supabase
              .from("job_files")
              .insert(jobFilesRecords);

            if (jobFilesError) {
              console.error("Failed to link input files to job:", jobFilesError);
            } else {
              console.log(`✅ Linked ${inputFiles.length} input files to job ${jobData.id}`);
            }
          } else {
            console.warn(
              `⚠️ No input files found in database for paths: ${inputFilePaths.join(", ")}`
            );
          }
        }
      }
    }

    return buildSuccessResponse({
      success: true,
      job_id: ncatResult.job_id, // Return NCAT job ID for frontend tracking
      message: "Video concatenation started successfully",
      response: ncatResult.response
    });
  } catch (error) {
    console.error("Video concatenate error:", error);
    return buildErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "An unexpected error occurred",
      500
    );
  }
});
