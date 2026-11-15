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

interface FFmpegOption {
  option: string;
  argument: string | number;
}

interface FFmpegInput {
  file_url: string;
  options?: FFmpegOption[];
}

interface FFmpegOutput {
  options: FFmpegOption[];
}

interface FFmpegComposeRequest {
  inputs: FFmpegInput[];
  outputs: FFmpegOutput[];
  custom_id?: string;
  user_id?: string; // For internal webhook calls
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

    // Parse request body first
    const body: FFmpegComposeRequest = await req.json();

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
        return new Response("Invalid authentication", { status: 401 });
      }

      console.log(`✅ User authenticated: ${user.id}`);
      userId = user.id;
    }

    // Validate required fields
    if (!body.inputs || !Array.isArray(body.inputs) || body.inputs.length === 0) {
      return new Response("inputs array is required and cannot be empty", { status: 400 });
    }

    if (!body.outputs || !Array.isArray(body.outputs) || body.outputs.length === 0) {
      return new Response("outputs array is required and cannot be empty", { status: 400 });
    }

    // Validate and process input structure (replace localhost with Docker host)
    const processedInputs = body.inputs.map((input) => {
      if (!input.file_url || typeof input.file_url !== "string") {
        throw new Error("Each input must have a valid file_url string");
      }

      let processedUrl = input.file_url;
      if (processedUrl.includes("127.0.0.1:54321") || processedUrl.includes("localhost:54321")) {
        processedUrl = processedUrl
          .replace("http://127.0.0.1:54321", "http://host.docker.internal:54321")
          .replace("http://localhost:54321", "http://host.docker.internal:54321");
        console.log(`🔄 Replaced localhost URL with Docker host URL: ${processedUrl}`);
      }

      return { ...input, file_url: processedUrl };
    });

    // Validate output structure
    for (const output of body.outputs) {
      if (!output.options || !Array.isArray(output.options)) {
        return new Response("Each output must have an options array", { status: 400 });
      }
    }

    // Prepare NCAT API request
    const ncatPayload = {
      inputs: processedInputs,
      outputs: body.outputs,
      webhook_url: replaceLocalhostUrl(`${WEBHOOK_URL}/functions/v1/ncat-webhook`),
      id: body.custom_id || `ffmpeg-compose-${Date.now()}`
    };

    // Call NCAT API
    const ncatResponse = await fetch(`${NCAT_API_URL}/v1/ffmpeg/compose`, {
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
          user_id: userId,
          nca_job_id: ncatResult.job_id,
          nca_endpoint: "/v1/ffmpeg/compose",
          custom_id: body.custom_id || `ffmpeg-compose-${Date.now()}`,
          processing_status: "processing"
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("❌ Failed to create job record:", insertError);
      } else if (jobRecord) {
        // Link all input files to job
        // Extract file paths from all input URLs
        const inputFilePaths: string[] = [];
        for (const input of body.inputs) {
          let sourceFilePath: string | null = null;
          if (input.file_url.includes("/storage/v1/object/public/files/")) {
            const pathMatch = input.file_url.match(/\/storage\/v1\/object\/public\/files\/(.+)$/);
            if (pathMatch && pathMatch[1]) {
              sourceFilePath = decodeURIComponent(pathMatch[1]);
            }
          } else if (input.file_url.includes("/storage/v1/s3/files/")) {
            const pathMatch = input.file_url.match(/\/storage\/v1\/s3\/files\/(.+)$/);
            if (pathMatch && pathMatch[1]) {
              sourceFilePath = decodeURIComponent(pathMatch[1]);
            }
          }

          if (sourceFilePath) {
            inputFilePaths.push(sourceFilePath);
          }
        }

        // Find file records and create job_files records
        if (inputFilePaths.length > 0) {
          const { data: inputFiles } = await supabase
            .from("files")
            .select("id, file_path")
            .eq("user_id", userId)
            .in("file_path", inputFilePaths);

          if (inputFiles && inputFiles.length > 0) {
            const jobFilesRecords = inputFiles.map((file, index) => ({
              job_id: jobRecord.id,
              file_id: file.id,
              file_role: "input",
              sequence_number: index + 1
            }));

            const { error: linkError } = await supabase
              .from("job_files")
              .insert(jobFilesRecords);

            if (linkError) {
              console.warn("⚠️ Could not create job_files records:", linkError.message);
            } else {
              console.log(`✅ Linked ${inputFiles.length} source file(s) to job ${jobRecord.id}`);
            }
          } else {
            console.warn(`⚠️ No source files found in database for job ${jobRecord.id}`);
          }
        } else {
          console.warn(`⚠️ Could not extract file paths from input URLs for job ${jobRecord.id}`);
        }
      }
    }

    // Return response to client
    return buildSuccessResponse({
        success: true,
        job_id: ncatResult.job_id,
        message: "FFmpeg composition started successfully"
      });
  } catch (error) {
    console.error("FFmpeg compose error:", error);
    return buildErrorResponse(
      "Internal server error",
      error instanceof Error ? error.message : "An unexpected error occurred",
      500
    );
  }
});
