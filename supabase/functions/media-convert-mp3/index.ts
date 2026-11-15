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

interface MediaToMp3Request {
  media_url: string;
  source_file_id?: string;
  bitrate?: string;
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

    const body: MediaToMp3Request = await req.json();

    if (!body.media_url || typeof body.media_url !== "string") {
      return new Response("media_url is required", { status: 400 });
    }

    // Replace localhost/127.0.0.1 URLs with host.docker.internal for NCAT API (running in Docker)
    const processedMediaUrl = replaceLocalhostUrl(body.media_url);

    const ncatPayload = {
      media_url: processedMediaUrl,
      bitrate: body.bitrate,
      webhook_url: replaceLocalhostUrl(`${WEBHOOK_URL}/functions/v1/ncat-webhook`),
      id: body.custom_id || `media-to-mp3-${Date.now()}`
    };

    const ncatResponse = await fetch(`${NCAT_API_URL}/v1/media/transform/mp3`, {
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
          nca_endpoint: "/v1/media/convert-mp3",
          custom_id: body.custom_id || `media-to-mp3-${Date.now()}`,
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
        // 2. Extract from URL: parse media_url to find file path

        let sourceFileId: string | null = body.source_file_id || null;

        // If no direct file ID, try to extract from media_url
        if (!sourceFileId) {
          let sourceFilePath: string | null = null;
          if (body.media_url.includes("/storage/v1/object/public/files/")) {
            const pathMatch = body.media_url.match(/\/storage\/v1\/object\/public\/files\/(.+)$/);
            if (pathMatch && pathMatch[1]) {
              sourceFilePath = decodeURIComponent(pathMatch[1]);
            }
          } else if (body.media_url.includes("/storage/v1/s3/files/")) {
            const pathMatch = body.media_url.match(/\/storage\/v1\/s3\/files\/(.+)$/);
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
            console.warn(`⚠️ Could not extract file path from media_url: ${body.media_url}`);
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
        message: "Media to MP3 conversion started successfully"
      });
  } catch (error) {
    console.error("Media to MP3 error:", error);
    return buildErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "An unexpected error occurred",
      500
    );
  }
});
