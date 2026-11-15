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
// Use WEBHOOK_URL for external callbacks (ngrok/production)
// Supabase auto-sets SUPABASE_URL to internal kong:8000, which NCAT can't reach
const WEBHOOK_URL = Deno.env.get("WEBHOOK_URL") || Deno.env.get("SUPABASE_URL");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface ImageToVideoRequest {
  image_url: string;
  source_file_id?: string; // Optional UUID of the source file in the files table
  length?: number;
  frame_rate?: number;
  zoom_speed?: number;
  custom_id?: string;
  user_id?: string; // For internal webhook calls
}

Deno.serve(async (req) => {
  try {
    console.log("📨 Image to video request received");

    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("❌ No authorization header");
      return new Response("Authorization required", { status: 401 });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Parse request body first
    const body: ImageToVideoRequest = await req.json();

    // Get user from token OR use provided user_id (for internal webhook calls)
    let userId: string;
    if (body.user_id) {
      // Internal webhook call with service role key
      console.log(`✅ Using provided user_id: ${body.user_id}`);
      userId = body.user_id;
    } else {
      // External call with user JWT token
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
      userId = user.id;
    }

    if (!body.image_url || typeof body.image_url !== "string") {
      return new Response("image_url is required", { status: 400 });
    }

    if (
      body.length !== undefined &&
      (typeof body.length !== "number" || body.length < 1 || body.length > 60)
    ) {
      return new Response("length must be between 1 and 60 seconds", { status: 400 });
    }

    if (
      body.frame_rate !== undefined &&
      (typeof body.frame_rate !== "number" || body.frame_rate < 15 || body.frame_rate > 60)
    ) {
      return new Response("frame_rate must be between 15 and 60 fps", { status: 400 });
    }

    if (
      body.zoom_speed !== undefined &&
      (typeof body.zoom_speed !== "number" || body.zoom_speed < 0 || body.zoom_speed > 100)
    ) {
      return new Response("zoom_speed must be between 0 and 100", { status: 400 });
    }

    // Rewrite localhost URLs to use Docker host.docker.internal
    // NCAT API runs in Docker and cannot reach 127.0.0.1 (container's own network)
    let rewrittenImageUrl = body.image_url;
    if (
      rewrittenImageUrl.includes("127.0.0.1:54321") ||
      rewrittenImageUrl.includes("localhost:54321")
    ) {
      rewrittenImageUrl = rewrittenImageUrl.replace(
        /https?:\/\/(127\.0\.0\.1|localhost):54321/,
        "http://host.docker.internal:54321"
      );
      console.log(`🔄 Rewrote URL for Docker networking: ${body.image_url} → ${rewrittenImageUrl}`);
    }

    const ncatPayload = {
      image_url: rewrittenImageUrl,
      length: body.length,
      frame_rate: body.frame_rate,
      zoom_speed: body.zoom_speed,
      webhook_url: replaceLocalhostUrl(`${WEBHOOK_URL}/functions/v1/ncat-webhook`),
      ...(body.custom_id && { id: body.custom_id })
    };

    console.log("📤 Sending request to NCAT API:", {
      endpoint: `${NCAT_API_URL}/v1/image/convert/video`,
      payload: ncatPayload
    });

    const ncatResponse = await fetch(`${NCAT_API_URL}/v1/image/convert/video`, {
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

    // Image-to-video is a slow endpoint - will complete via webhook
    if (ncatResult.job_id) {
      console.log(`📝 Creating job record with nca_job_id: ${ncatResult.job_id}`);

      const { data: jobRecord, error: insertError } = await supabase
        .from("jobs")
        .insert({
          user_id: userId,
          nca_job_id: ncatResult.job_id,
          nca_endpoint: "/v1/image/convert-video",
          custom_id: body.custom_id || null,
          processing_status: "processing"
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("❌ Failed to create job record:", insertError);
      } else if (jobRecord) {
        console.log("✅ Job record created successfully");

        // Link source file to job as input (if provided)
        // Two approaches supported:
        // 1. Direct file ID (preferred): body.source_file_id
        // 2. Extract from URL: parse image_url to find file path

        let sourceFileId: string | null = body.source_file_id || null;

        // If no direct file ID, try to extract from image_url
        if (!sourceFileId) {
          let sourceFilePath: string | null = null;
          if (body.image_url.includes("/storage/v1/object/public/files/")) {
            const pathMatch = body.image_url.match(/\/storage\/v1\/object\/public\/files\/(.+)$/);
            if (pathMatch && pathMatch[1]) {
              sourceFilePath = decodeURIComponent(pathMatch[1]);
            }
          } else if (body.image_url.includes("/storage/v1/s3/files/")) {
            const pathMatch = body.image_url.match(/\/storage\/v1\/s3\/files\/(.+)$/);
            if (pathMatch && pathMatch[1]) {
              sourceFilePath = decodeURIComponent(pathMatch[1]);
            }
          }

          if (sourceFilePath) {
            // Look up file record by path
            const { data: sourceFile } = await supabase
              .from("files")
              .select("id")
              .eq("user_id", userId)
              .eq("file_path", sourceFilePath)
              .single();

            if (sourceFile) {
              sourceFileId = sourceFile.id;
              console.log(`📎 Found source file via URL: ${sourceFilePath} -> ${sourceFileId}`);
            } else {
              console.warn(`⚠️ Source file not found in database: ${sourceFilePath}`);
            }
          } else {
            console.warn(`⚠️ Could not extract file path from image_url: ${body.image_url}`);
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
        nca_job_id: ncatResult.job_id,
        message: "Image to video conversion started successfully"
      });
  } catch (error) {
    console.error("Image to video error:", error);
    return buildErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "An unexpected error occurred",
      500
    );
  }
});
