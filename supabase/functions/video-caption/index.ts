import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import {
  validateRequiredString,
  validateRange,
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

interface CaptionSettings {
  line_color?: string;
  word_color?: string;
  outline_color?: string;
  all_caps?: boolean;
  max_words_per_line?: number;
  x?: number;
  y?: number;
  position?: string;
  alignment?: string;
  font_family?: string;
  font_size?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikeout?: boolean;
  style?: string;
  outline_width?: number;
  spacing?: number;
  angle?: number;
  shadow_offset?: number;
}

interface TextReplacement {
  find: string;
  replace: string;
}

interface TimeRange {
  start: string;
  end: string;
}

interface VideoCaptionRequest {
  video_url: string;
  source_file_id?: string;
  captions?: string;
  settings?: CaptionSettings;
  replace?: TextReplacement[];
  exclude_time_ranges?: TimeRange[];
  language?: string;
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

    const body: VideoCaptionRequest = await req.json();

    // Validate required parameters
    const urlError = validateRequiredString(body.video_url, "video_url");
    if (urlError) {
      return buildErrorResponse("Validation error", urlError);
    }

    // Validate position if provided in settings
    const validPositions = [
      "bottom_left",
      "bottom_center",
      "bottom_right",
      "middle_left",
      "middle_center",
      "middle_right",
      "top_left",
      "top_center",
      "top_right"
    ];
    if (
      body.settings?.position !== undefined &&
      !validPositions.includes(body.settings.position)
    ) {
      return buildErrorResponse(
        "Validation error",
        `position must be one of: ${validPositions.join(", ")}`
      );
    }

    // Validate style if provided
    const validStyles = ["classic", "karaoke", "highlight", "underline", "word_by_word"];
    if (body.settings?.style !== undefined && !validStyles.includes(body.settings.style)) {
      return buildErrorResponse(
        "Validation error",
        `style must be one of: ${validStyles.join(", ")}`
      );
    }

    // Validate alignment if provided
    const validAlignments = ["left", "center", "right"];
    if (
      body.settings?.alignment !== undefined &&
      !validAlignments.includes(body.settings.alignment)
    ) {
      return buildErrorResponse(
        "Validation error",
        `alignment must be one of: ${validAlignments.join(", ")}`
      );
    }

    // Replace localhost URLs for Docker compatibility
    const processedVideoUrl = replaceLocalhostUrl(body.video_url);

    // Construct NCAT API payload according to documentation
    const ncatPayload: any = {
      video_url: processedVideoUrl,
      webhook_url: replaceLocalhostUrl(`${WEBHOOK_URL}/functions/v1/ncat-webhook`),
      id: body.custom_id || `video-caption-${Date.now()}`
    };

    // Add optional parameters
    if (body.captions) {
      ncatPayload.captions = body.captions;
    }

    if (body.language) {
      ncatPayload.language = body.language;
    }

    if (body.settings) {
      ncatPayload.settings = body.settings;
    }

    if (body.replace && body.replace.length > 0) {
      ncatPayload.replace = body.replace;
    }

    if (body.exclude_time_ranges && body.exclude_time_ranges.length > 0) {
      ncatPayload.exclude_time_ranges = body.exclude_time_ranges;
    }

    const ncatResponse = await fetch(`${NCAT_API_URL}/v1/video/caption`, {
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
          nca_endpoint: "/v1/video/caption",
          custom_id: body.custom_id || `video-caption-${Date.now()}`,
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
      message: "Video captioning started successfully"
    });
  } catch (error) {
    console.error("Video caption error:", error);
    return buildErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "An unexpected error occurred",
      500
    );
  }
});
