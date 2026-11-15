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

interface AudioConcatenateRequest {
  audio_urls: { audio_url: string; file_id?: string }[]; // NEW: Add optional file_id for each audio
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

    // Validate and process audio URLs (replace localhost with Docker host for NCAT API)
    const processedAudioUrls = body.audio_urls.map((audio) => {
      if (!audio.audio_url || typeof audio.audio_url !== "string") {
        throw new Error("Each audio object must have a valid audio_url string");
      }

      let processedUrl = audio.audio_url;
      if (processedUrl.includes("127.0.0.1:54321") || processedUrl.includes("localhost:54321")) {
        processedUrl = processedUrl
          .replace("http://127.0.0.1:54321", "http://host.docker.internal:54321")
          .replace("http://localhost:54321", "http://host.docker.internal:54321");
        console.log(`🔄 Replaced localhost URL with Docker host URL: ${processedUrl}`);
      }

      return { audio_url: processedUrl };
    });

    // Prepare NCAT API request
    const ncatPayload = {
      audio_urls: processedAudioUrls,
      webhook_url: replaceLocalhostUrl(`${WEBHOOK_URL}/functions/v1/ncat-webhook`),
      id: body.custom_id || `audio-concat-${Date.now()}` // Optional custom ID
    };

    // Call NCAT API
    const ncatResponse = await fetch(`${NCAT_API_URL}/v1/audio/concatenate`, {
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
          nca_endpoint: "/v1/audio/concatenate",
          custom_id: body.custom_id || `audio-concat-${Date.now()}`,
          processing_status: "processing"
        })
        .select("id")
        .single();

      if (jobError) {
        console.error("Failed to create job record:", jobError);
      } else if (jobData?.id) {
        // Link input audio files to the job
        // Extract file paths from audio URLs to find corresponding file records
        const inputFilePaths = body.audio_urls
          .map((audio) => {
            const url = audio.audio_url;
            // Extract file path from URL like:
            // http://127.0.0.1:54321/storage/v1/object/public/files/uploads/user-id/filename.mp3
            // -> uploads/user-id/filename.mp3
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
            // Match files by their position in the inputFilePaths array to preserve sequence
            const jobFilesRecords = inputFilePaths
              .map((filePath, index) => {
                const file = inputFiles.find((f) => f.file_path === filePath);
                if (file) {
                  return {
                    job_id: jobData.id,
                    file_id: file.id,
                    file_role: "input",
                    sequence_number: index + 1 // Order matters for concatenation
                  };
                }
                return null;
              })
              .filter(Boolean);

            if (jobFilesRecords.length > 0) {
              const { error: jobFilesError } = await supabase
                .from("job_files")
                .insert(jobFilesRecords);

              if (jobFilesError) {
                console.error("Failed to link input files to job:", jobFilesError);
              } else {
                console.log(`✅ Linked ${inputFiles.length} input files to job ${jobData.id}`);
              }
            }
          } else {
            console.warn(
              `⚠️ No input files found in database for paths: ${inputFilePaths.join(", ")}`
            );
          }
        }
      }
    }

    // Return response to client
    return buildSuccessResponse({
      success: true,
      job_id: ncatResult.job_id, // Return NCAT job ID for frontend tracking
      message: "Audio concatenation job started successfully"
    });
  } catch (error) {
    console.error("Audio concatenate error:", error);
    return buildErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "An unexpected error occurred",
      500
    );
  }
});
