// @ts-nocheck - This is a Deno Edge Function, Deno types are available at runtime
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

// Type definitions for NCAT API responses
interface FileResponse {
  file_url: string;
  [key: string]: any;
}

interface ResultFile {
  url: string;
  filename: string;
  mime_type: string;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321"; // Public URL for browser access
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

console.log("NCA Toolkit Webhook Handler started!");

// ============================================================================
// ENDPOINT-SPECIFIC DATA STORAGE FUNCTION
// ============================================================================
async function storeEndpointSpecificData(
  supabase: any,
  endpoint: string,
  jobId: string,
  response: any,
  fullPayload: any
): Promise<{ transcriptionFiles?: { textUrl?: string; srtUrl?: string; segmentsUrl?: string } }> {
  try {
    let parsedResponse = response;

    // Try to parse response if it's a JSON string
    if (typeof response === "string") {
      try {
        parsedResponse = JSON.parse(response);
      } catch {
        // Keep as string if not valid JSON
        parsedResponse = response;
      }
    }

    console.log(`📝 Storing endpoint-specific data for ${endpoint}`);

    switch (endpoint) {
      // ============================================================================
      // MEDIA ENDPOINTS
      // ============================================================================
      case "/v1/transcribe/media": {
        const data = typeof parsedResponse === "object" ? parsedResponse : {};

        // Save transcription outputs as files in Supabase Storage for scalability
        let textUrl = data.text_url || null;
        let srtUrl = data.srt_url || null;
        let segmentsUrl = data.segments_url || null;

        // Generate unique filename prefix from job ID
        const jobPrefix = jobId.split("-")[0];
        const timestamp = Date.now();

        // Save text transcription as .txt file
        if (data.text && !textUrl) {
          try {
            const textFilename = `transcriptions/${jobPrefix}-${timestamp}.txt`;
            const { data: textUpload, error: textError } = await supabase.storage
              .from("files")
              .upload(textFilename, data.text, {
                contentType: "text/plain",
                cacheControl: "3600",
                upsert: false
              });

            if (!textError && textUpload) {
              const { data: urlData } = supabase.storage.from("files").getPublicUrl(textFilename);
              // Replace internal kong URL with public URL for browser access
              textUrl = urlData?.publicUrl?.replace("http://kong:8000", PUBLIC_SUPABASE_URL) || null;
              console.log(`📄 Saved text transcription: ${textFilename} -> ${textUrl}`);
            }
          } catch (error) {
            console.warn(`⚠️ Could not save text file: ${error}`);
          }
        }

        // Save SRT subtitles as .srt file
        if (data.srt && !srtUrl) {
          try {
            const srtFilename = `transcriptions/${jobPrefix}-${timestamp}.srt`;
            const { data: srtUpload, error: srtError } = await supabase.storage
              .from("files")
              .upload(srtFilename, data.srt, {
                contentType: "text/plain; charset=utf-8", // Use text/plain so browsers display instead of download
                cacheControl: "3600",
                upsert: false
              });

            if (!srtError && srtUpload) {
              const { data: urlData } = supabase.storage.from("files").getPublicUrl(srtFilename);
              // Replace internal kong URL with public URL for browser access
              srtUrl = urlData?.publicUrl?.replace("http://kong:8000", PUBLIC_SUPABASE_URL) || null;
              console.log(`📄 Saved SRT subtitles: ${srtFilename} -> ${srtUrl}`);
            }
          } catch (error) {
            console.warn(`⚠️ Could not save SRT file: ${error}`);
          }
        }

        // Save segments as .json file
        if (data.segments && !segmentsUrl) {
          try {
            const segmentsFilename = `transcriptions/${jobPrefix}-${timestamp}-segments.json`;
            const segmentsJson = JSON.stringify(data.segments, null, 2);
            const { data: segmentsUpload, error: segmentsError } = await supabase.storage
              .from("files")
              .upload(segmentsFilename, segmentsJson, {
                contentType: "application/json",
                cacheControl: "3600",
                upsert: false
              });

            if (!segmentsError && segmentsUpload) {
              const { data: urlData } = supabase.storage.from("files").getPublicUrl(segmentsFilename);
              // Replace internal kong URL with public URL for browser access
              segmentsUrl = urlData?.publicUrl?.replace("http://kong:8000", PUBLIC_SUPABASE_URL) || null;
              console.log(`📄 Saved segments JSON: ${segmentsFilename} -> ${segmentsUrl}`);
            }
          } catch (error) {
            console.warn(`⚠️ Could not save segments file: ${error}`);
          }
        }

        // Store URLs in database (not the content for scalability)
        await supabase.from("media_transcribe").insert({
          job_id: jobId,
          text: null, // Don't store large text in database
          srt: null, // Don't store large SRT in database
          text_url: textUrl,
          srt_url: srtUrl,
          segments_url: segmentsUrl,
          segments: null, // Don't store large JSON in database
          language: data.language || null,
          task: data.task || null
        });
        console.log("✅ Stored media_transcribe data with file URLs");

        // Return file URLs to display as links in logs
        return { transcriptionFiles: { textUrl, srtUrl, segmentsUrl } };
      }

      case "/v1/media/metadata": {
        const data = typeof parsedResponse === "object" ? parsedResponse : {};
        await supabase.from("media_metadata").insert({
          job_id: jobId,
          filesize: data.filesize || null,
          filesize_mb: data.filesize_mb || null,
          format: data.format || null,
          overall_bitrate: data.overall_bitrate || null,
          overall_bitrate_mbps: data.overall_bitrate_mbps || null,
          duration: data.duration || null,
          duration_formatted: data.duration_formatted || null,
          has_video: data.has_video ?? null,
          video_codec: data.video_codec || null,
          video_codec_long: data.video_codec_long || null,
          width: data.width || null,
          height: data.height || null,
          resolution: data.resolution || null,
          fps: data.fps || null,
          video_bitrate: data.video_bitrate || null,
          video_bitrate_mbps: data.video_bitrate_mbps || null,
          pixel_format: data.pixel_format || null,
          has_audio: data.has_audio ?? null,
          audio_codec: data.audio_codec || null,
          audio_codec_long: data.audio_codec_long || null,
          audio_channels: data.audio_channels || null,
          audio_sample_rate: data.audio_sample_rate || null,
          audio_sample_rate_khz: data.audio_sample_rate_khz || null,
          audio_bitrate: data.audio_bitrate || null,
          audio_bitrate_kbps: data.audio_bitrate_kbps || null
        });
        console.log("✅ Stored media_metadata data");
        break;
      }

      case "/v1/media/silence": {
        // Response is an array of silence segments
        const segments = Array.isArray(parsedResponse) ? parsedResponse : [];

        // Insert main record
        const { data: silenceRecord, error: silenceError } = await supabase
          .from("media_silence")
          .insert({
            job_id: jobId,
            media_url: fullPayload.media_url || null
          })
          .select("id")
          .single();

        if (silenceError || !silenceRecord) {
          console.error("❌ Failed to create media_silence record:", silenceError);
          break;
        }

        // Insert segments
        if (segments.length > 0) {
          const segmentRecords = segments.map((seg: any, index: number) => ({
            media_silence_id: silenceRecord.id,
            start_time: seg.start || 0,
            end_time: seg.end || 0,
            sequence_number: index + 1
          }));

          await supabase.from("silence_segments").insert(segmentRecords);
          console.log(`✅ Stored media_silence with ${segments.length} segments`);
        }
        break;
      }

      case "/v1/media/convert": {
        await supabase.from("media_convert").insert({
          job_id: jobId,
          output_url:
            typeof parsedResponse === "string" ? parsedResponse : parsedResponse?.file_url || null,
          output_format: fullPayload.format || null,
          video_codec: fullPayload.video_codec || null,
          audio_codec: fullPayload.audio_codec || null,
          filesize: null,
          duration: null,
          mime_type: null
        });
        console.log("✅ Stored media_convert data");
        break;
      }

      case "/v1/media/convert/mp3":
      case "/v1/media/transform/mp3": {
        await supabase.from("media_convert_mp3").insert({
          job_id: jobId,
          output_url:
            typeof parsedResponse === "string" ? parsedResponse : parsedResponse?.file_url || null,
          filesize: null,
          duration: null,
          mime_type: "audio/mpeg"
        });
        console.log("✅ Stored media_convert_mp3 data");
        break;
      }

      case "/v1/media/download": {
        const data = typeof parsedResponse === "object" ? parsedResponse.media || {} : {};
        await supabase.from("media_download").insert({
          job_id: jobId,
          // Response metadata (from NCAT API response)
          media_url: data.media_url || null,
          title: data.title || null,
          format_id: data.format_id || null,
          ext: data.ext || null,
          resolution: data.resolution || null,
          filesize: data.filesize || null,
          width: data.width || null,
          height: data.height || null,
          fps: data.fps || null,
          video_codec: data.video_codec || null,
          audio_codec: data.audio_codec || null,
          upload_date: data.upload_date || null,
          duration: data.duration || null,
          view_count: data.view_count || null,
          uploader: data.uploader || null,
          uploader_id: data.uploader_id || null,
          description: data.description || null,
          thumbnails: parsedResponse.thumbnails || null,
          // Request parameters (from original request payload)
          quality: fullPayload.format?.quality || null,
          video_codec_requested: fullPayload.format?.video_codec || null,
          audio_codec_requested: fullPayload.format?.audio_codec || null,
          extract_audio: fullPayload.audio?.extract ?? null,
          audio_format: fullPayload.audio?.format || null,
          audio_quality: fullPayload.audio?.quality || null,
          download_thumbnails: fullPayload.thumbnails?.download ?? null,
          download_all_thumbnails: fullPayload.thumbnails?.download_all ?? null,
          thumbnail_formats: fullPayload.thumbnails?.formats || null,
          embed_thumbnail_in_audio: fullPayload.thumbnails?.embed_in_audio ?? null,
          download_subtitles: fullPayload.subtitles?.download ?? null,
          subtitle_languages: fullPayload.subtitles?.languages || null,
          subtitle_format: fullPayload.subtitles?.format || null,
          max_filesize: fullPayload.max_filesize || null,
          rate_limit: fullPayload.rate_limit || null,
          retries: fullPayload.retries || null,
          cloud_upload: fullPayload.cloud_upload ?? null,
          cookie_used: fullPayload.cookie ? true : false
        });
        console.log("✅ Stored media_download data with request parameters");
        break;
      }

      // ============================================================================
      // VIDEO ENDPOINTS
      // ============================================================================
      case "/v1/video/caption": {
        await supabase.from("video_caption").insert({
          job_id: jobId,
          output_url:
            typeof parsedResponse === "string" ? parsedResponse : parsedResponse?.file_url || null,
          subtitle_url: fullPayload.subtitle_url || null,
          font_size: fullPayload.font_size || null,
          font_color: fullPayload.font_color || null,
          position: fullPayload.position || null,
          filesize: null,
          duration: null,
          mime_type: null
        });
        console.log("✅ Stored video_caption data");
        break;
      }

      case "/v1/video/concatenate": {
        await supabase.from("video_concatenate").insert({
          job_id: jobId,
          output_url:
            typeof parsedResponse === "string" ? parsedResponse : parsedResponse?.file_url || null,
          filesize: null,
          duration: null,
          mime_type: null
        });
        console.log("✅ Stored video_concatenate data");
        break;
      }

      case "/v1/video/cut": {
        await supabase.from("video_cut").insert({
          job_id: jobId,
          output_url:
            typeof parsedResponse === "string" ? parsedResponse : parsedResponse?.file_url || null,
          filesize: null,
          duration: null,
          mime_type: null
        });
        console.log("✅ Stored video_cut data");
        break;
      }

      case "/v1/video/split": {
        // Response is an array of split video segments
        const segments = Array.isArray(parsedResponse) ? parsedResponse : [];

        // Insert main record
        const { data: splitRecord, error: splitError } = await supabase
          .from("video_split")
          .insert({
            job_id: jobId,
            segment_count: segments.length,
            split_interval: null
          })
          .select("id")
          .single();

        if (splitError || !splitRecord) {
          console.error("❌ Failed to create video_split record:", splitError);
          break;
        }

        // Insert segments
        if (segments.length > 0) {
          const segmentRecords = segments.map((seg: any, index: number) => ({
            video_split_id: splitRecord.id,
            segment_number: index + 1,
            file_url: seg.file_url || seg,
            filename:
              typeof seg === "string"
                ? seg.split("/").pop()
                : seg.file_url?.split("/").pop() || `segment-${index + 1}`,
            duration: null,
            filesize: null
          }));

          await supabase.from("video_split_segments").insert(segmentRecords);
          console.log(`✅ Stored video_split with ${segments.length} segments`);
        }
        break;
      }

      case "/v1/video/thumbnail": {
        await supabase.from("video_thumbnail").insert({
          job_id: jobId,
          output_url:
            typeof parsedResponse === "string" ? parsedResponse : parsedResponse?.file_url || null,
          thumbnail_time: fullPayload.time || null,
          width: null,
          height: null,
          filesize: null,
          mime_type: null
        });
        console.log("✅ Stored video_thumbnail data");
        break;
      }

      case "/v1/video/trim": {
        await supabase.from("video_trim").insert({
          job_id: jobId,
          output_url:
            typeof parsedResponse === "string" ? parsedResponse : parsedResponse?.file_url || null,
          start_time: fullPayload.start_time || null,
          end_time: fullPayload.end_time || null,
          filesize: null,
          duration: null,
          mime_type: null
        });
        console.log("✅ Stored video_trim data");
        break;
      }

      // ============================================================================
      // AUDIO ENDPOINTS
      // ============================================================================
      case "/v1/audio/concatenate": {
        await supabase.from("audio_concatenate").insert({
          job_id: jobId,
          output_url:
            typeof parsedResponse === "string" ? parsedResponse : parsedResponse?.file_url || null,
          filesize: null,
          duration: null,
          mime_type: null
        });
        console.log("✅ Stored audio_concatenate data");
        break;
      }

      // ============================================================================
      // IMAGE ENDPOINTS
      // ============================================================================
      case "/v1/image/convert/video": {
        await supabase.from("image_to_video").insert({
          job_id: jobId,
          output_url:
            typeof parsedResponse === "string" ? parsedResponse : parsedResponse?.file_url || null,
          filesize: null,
          duration: null,
          mime_type: null
        });
        console.log("✅ Stored image_to_video data");
        break;
      }

      // ============================================================================
      // CODE ENDPOINTS
      // ============================================================================
      case "/v1/code/execute/python": {
        const data = typeof parsedResponse === "object" ? parsedResponse : {};
        await supabase.from("code_execution").insert({
          job_id: jobId,
          result: data.result ? String(data.result) : null,
          stdout: data.stdout || null,
          stderr: data.stderr || null,
          exit_code: data.exit_code ?? null,
          code_snippet: fullPayload.code || null,
          timeout_seconds: fullPayload.timeout || null
        });
        console.log("✅ Stored code_execution data");
        break;
      }

      // ============================================================================
      // FFMPEG ENDPOINTS
      // ============================================================================
      case "/v1/ffmpeg/compose": {
        const data = Array.isArray(parsedResponse) ? parsedResponse[0] || {} : parsedResponse;
        await supabase.from("ffmpeg_compose").insert({
          job_id: jobId,
          output_url: data.file_url || null,
          thumbnail_url: data.thumbnail_url || null,
          filesize: data.filesize || null,
          duration: data.duration || null,
          bitrate: data.bitrate || null,
          encoder: data.encoder || null,
          script: fullPayload.script || null
        });
        console.log("✅ Stored ffmpeg_compose data");
        break;
      }

      // ============================================================================
      // S3 ENDPOINTS
      // ============================================================================
      case "/v1/s3/upload": {
        const data = typeof parsedResponse === "object" ? parsedResponse : {};
        await supabase.from("s3_upload").insert({
          job_id: jobId,
          url: data.url || null,
          filename: data.filename || null,
          bucket: data.bucket || null,
          public: data.public ?? null,
          region: data.region || null,
          provider: data.provider || "aws"
        });
        console.log("✅ Stored s3_upload data");
        break;
      }

      default:
        console.log(`⚠️ No specific table handler for endpoint: ${endpoint}`);
    }

    return {};
  } catch (error) {
    console.error(`❌ Error storing endpoint-specific data for ${endpoint}:`, error);
    // Don't throw - we still want the webhook to return success even if specific data storage fails
    return {};
  }
}

Deno.serve(async (request) => {
  try {
    // Log incoming request for debugging
    console.log(`📨 Received ${request.method} request`);

    // Only accept POST requests for webhooks
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Parse the incoming webhook payload from NCA Toolkit
    let payload;
    try {
      const body = await request.text();
      console.log("📋 Raw request body:", body);

      if (!body || body.trim() === "") {
        console.log("⚠️ Empty request body received");
        payload = {};
      } else {
        payload = JSON.parse(body);
        console.log("📋 NCA Webhook payload:", JSON.stringify(payload, null, 2));
      }
    } catch (parseError) {
      console.error("❌ JSON parsing error:", parseError.message);
      console.log("📋 Raw body that failed to parse:", await request.text());
      return new Response("Invalid JSON payload", { status: 400 });
    }

    // Extract NCA Toolkit job information
    const {
      job_id,
      code,
      message,
      response,
      endpoint,
      pid,
      queue_id,
      run_time,
      queue_time,
      total_time,
      queue_length,
      build_number
    } = payload;

    if (!job_id) {
      console.error("❌ Missing job_id in NCA Toolkit webhook payload");
      return new Response("Missing job_id", { status: 400 });
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Determine job status based on code and message
    let processing_status = "processing";
    let error_message: string | null = null;
    let signedUrl: string | null = response; // Default to original response
    let resultFiles: ResultFile[] = []; // Array to store multiple file results

    if (code === 200 && message === "success") {
      console.log(`✅ Job ${job_id} completed successfully`);
      console.log(`📄 Result: ${response}`);
      console.log(`🎯 Endpoint: ${endpoint}`);
      console.log(`⏱️ Processing time: ${run_time}s`);
      processing_status = "completed";

      // Endpoints that return data instead of file URLs - skip file processing
      const dataOnlyEndpoints = [
        "/v1/media/silence",
        "/v1/media/metadata",
        "/v1/transcribe/media",
        "/v1/code/execute/python"
      ];

      const shouldSkipFileProcessing = dataOnlyEndpoints.includes(endpoint);

      if (shouldSkipFileProcessing) {
        console.log(`📊 Data-only endpoint detected: ${endpoint} - skipping file processing`);

        // Set user-friendly messages for data-only endpoints
        switch (endpoint) {
          case "/v1/media/silence":
            if (Array.isArray(response)) {
              signedUrl =
                response.length === 0
                  ? "No silence detected - audio is continuous"
                  : `${response.length} silent segment${response.length > 1 ? "s" : ""} found`;
            } else {
              signedUrl = "Silence analysis completed";
            }
            break;

          case "/v1/media/metadata":
            signedUrl = "Media metadata extracted successfully";
            break;

          case "/v1/transcribe/media":
            signedUrl = "Transcription completed - check files in database";
            break;

          case "/v1/code/execute/python":
            signedUrl = "Code execution completed";
            break;

          default:
            signedUrl = Array.isArray(response)
              ? `${response.length} items returned`
              : "Data processed successfully";
        }
      } else {
        // Detect if response is an array of files (for endpoints like video-split)
        let responsePaths: Array<string | FileResponse> = [];

        // Special handling for /v1/media/download endpoint
        // Response format: { media: { media_url: "...", title: "...", ... } }
        if (endpoint === "/v1/media/download" && typeof response === "object" && response !== null) {
          const mediaData = (response as any).media;
          if (mediaData?.media_url) {
            console.log(`📦 Media download response detected with URL: ${mediaData.media_url}`);
            responsePaths = [mediaData.media_url];
          } else {
            console.warn(`⚠️ Media download response missing media.media_url`);
            responsePaths = [];
          }
        } else if (Array.isArray(response)) {
          responsePaths = response;
          console.log(`📦 Multiple files detected: ${responsePaths.length} files`);
        } else if (typeof response === "object" && response !== null) {
          // Single object response (e.g., {file_url: "..."})
          responsePaths = [response];
          console.log(`📦 Single file object detected`);
        } else if (typeof response === "string") {
          // Try parsing string as JSON
          try {
            const parsed = JSON.parse(response);
            if (Array.isArray(parsed)) {
              responsePaths = parsed;
              console.log(
                `📦 Multiple files detected (parsed from string): ${responsePaths.length} files`
              );
            } else {
              responsePaths = [response];
            }
          } catch {
            // Not JSON, treat as single file path or URL
            responsePaths = [response];
            console.log(`📦 Single file path detected: ${response}`);
          }
        } else {
          // Fallback for unexpected types
          console.warn(`⚠️ Unexpected response type: ${typeof response}`);
          responsePaths = [response];
        }

        // Process each file path
        for (const filePath of responsePaths) {
          if (!filePath) continue;

          // Extract file_url if response is an object (e.g., {file_url: "..."})
          let processedFilePath: string | null =
            typeof filePath === "object" && (filePath as FileResponse).file_url
              ? (filePath as FileResponse).file_url
              : (filePath as string);

          // Skip if processedFilePath is null or empty
          if (!processedFilePath) {
            console.warn(`⚠️ Skipping null or empty file path in response`);
            continue;
          }

          // If response is an S3 protocol URL, extract the file path
          // Example: http://host.docker.internal:54321/storage/v1/s3/files/filename.jpg -> filename.jpg
          // Example: https://project.supabase.co/storage/v1/s3/files/filename.jpg -> filename.jpg
          // The "files" in the URL is the bucket name, not a folder
          if (processedFilePath.includes("/storage/v1/s3/files/")) {
            const pathMatch = processedFilePath.match(/\/storage\/v1\/s3\/files\/(.+)$/);
            if (pathMatch && pathMatch[1]) {
              processedFilePath = pathMatch[1]; // Just the filename, bucket name already removed
              console.log(`📎 Extracted file path from S3 URL: ${processedFilePath}`);
            }
          } else if (processedFilePath.includes("/storage/v1/s3/")) {
            // Generic S3 URL pattern (other buckets)
            const pathMatch = processedFilePath.match(/\/storage\/v1\/s3\/(.+)$/);
            if (pathMatch && pathMatch[1]) {
              // Extract bucket and path from "bucket/path"
              const parts = pathMatch[1].split("/");
              if (parts.length > 1 && parts[0] === "files") {
                // If bucket is "files", remove it from the path
                processedFilePath = parts.slice(1).join("/");
                console.log(`📎 Extracted file path from generic S3 URL: ${processedFilePath}`);
              } else {
                processedFilePath = pathMatch[1];
                console.log(`📎 Extracted file path: ${processedFilePath}`);
              }
            }
          } else if (processedFilePath && processedFilePath.startsWith("http")) {
            // If it's some other HTTP URL (non-Supabase), keep it as is
            console.log(`🔗 External URL detected: ${processedFilePath}`);
            processedFilePath = null;
          }

          // Define content type mapping and file extension outside the block so they're available later
          const fileExt = processedFilePath?.split(".").pop()?.toLowerCase();
          const contentTypeMap: Record<string, string> = {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            gif: "image/gif",
            webp: "image/webp",
            mp4: "video/mp4",
            webm: "video/webm",
            mp3: "audio/mpeg",
            wav: "audio/wav",
            pdf: "application/pdf",
            txt: "text/plain"
          };

          let filePublicUrl: string | null = null;

          // Create public URL from file path (files bucket is public)
          if (processedFilePath && !processedFilePath.startsWith("http")) {
            try {
              // Update file content type based on extension for proper browser display

              // Update Content-Type metadata for proper browser display using streaming
              if (fileExt && contentTypeMap[fileExt]) {
                try {
                  // ✅ STREAMING APPROACH (avoids loading large files into memory)
                  console.log(
                    `🌊 Streaming upload with correct Content-Type: ${processedFilePath}`
                  );

                  // Step 1: Fetch file as stream from current S3 location
                  const sourceUrl = `${SUPABASE_URL}/storage/v1/object/files/${processedFilePath}`;
                  const streamResponse = await fetch(sourceUrl, {
                    headers: {
                      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
                    }
                  });

                  if (!streamResponse.ok) {
                    console.error(
                      `❌ Failed to fetch file stream: ${streamResponse.status} ${streamResponse.statusText}`
                    );
                  } else if (streamResponse.body) {
                    // Step 2: Stream directly to new upload with correct Content-Type
                    // Using upsert to overwrite the existing file
                    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/files/${processedFilePath}`;
                    const uploadResponse = await fetch(uploadUrl, {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                        "content-type": contentTypeMap[fileExt], // Lowercase for file's Content-Type
                        "cache-control": "max-age=3600",
                        "x-upsert": "true" // Overwrite existing file
                      },
                      body: streamResponse.body // ✅ Stream directly without loading into memory
                    });

                    if (!uploadResponse.ok) {
                      const errorText = await uploadResponse.text();
                      console.error(
                        `❌ Streamed upload error: ${uploadResponse.status} - ${errorText}`
                      );
                    } else {
                      console.log(
                        `✅ Successfully streamed upload with Content-Type: ${contentTypeMap[fileExt]}`
                      );
                    }
                  } else {
                    console.error(`❌ No body in stream response`);
                  }
                } catch (updateError) {
                  console.warn(`⚠️ Could not update content type: ${updateError}`);
                }
              }

              // Since 'files' bucket is public, use public URL format
              // Replace internal kong:8000 URL with public URL for browser access
              const { data: urlData } = supabase.storage
                .from("files")
                .getPublicUrl(processedFilePath);

              if (urlData?.publicUrl) {
                // Add cache-busting parameter to prevent old Content-Type from being cached
                filePublicUrl =
                  urlData.publicUrl.replace("http://kong:8000", PUBLIC_SUPABASE_URL) +
                  `?t=${Date.now()}`;
                console.log(`🔗 Created public URL for: ${processedFilePath} -> ${filePublicUrl}`);

                // Set signedUrl for backward compatibility (first file)
                if (!signedUrl || signedUrl === response) {
                  signedUrl = filePublicUrl;
                }
              }
            } catch (publicUrlError) {
              console.error("❌ Error creating public URL:", publicUrlError);
            }
          }

          // Create file record in database for user's file manager
          // This allows users to see their processed files in the Files section
          if (processedFilePath && !processedFilePath.startsWith("http")) {
            // Get the job data to find the user_id
            const { data: jobRecord } = await supabase
              .from("jobs")
              .select("user_id")
              .eq("nca_job_id", job_id)
              .single();

            if (jobRecord?.user_id) {
              const fileName = processedFilePath.split("/").pop() || processedFilePath;

              // Determine file type category from extension
              const fileTypeCategories: Record<string, string> = {
                mp4: "video",
                webm: "video",
                avi: "video",
                mov: "video",
                mp3: "audio",
                wav: "audio",
                m4a: "audio",
                jpg: "image",
                jpeg: "image",
                png: "image",
                gif: "image",
                webp: "image",
                pdf: "document",
                txt: "document"
              };

              const fileType =
                fileExt && fileTypeCategories[fileExt] ? fileTypeCategories[fileExt] : "other";

              const { error: fileRecordError } = await supabase.from("files").insert({
                user_id: jobRecord.user_id,
                file_name: fileName,
                original_name: fileName,
                file_path: processedFilePath,
                url: filePublicUrl, // NEW: Public viewing URL
                is_generated: true, // NEW: Mark as API-generated file
                file_type: fileType, // NEW: Category (video, audio, image, etc.)
                mime_type:
                  fileExt && contentTypeMap[fileExt]
                    ? contentTypeMap[fileExt]
                    : "application/octet-stream",
                bucket: "files"
              });

              if (fileRecordError) {
                console.warn(`⚠️ Could not create file record: ${fileRecordError.message}`);
              } else {
                console.log(`✅ File record created for user ${jobRecord.user_id}: ${fileName}`);
              }
            } else {
              console.warn(`⚠️ No user_id found for job ${job_id}, skipping file record creation`);
            }

            // Add to result files array
            if (filePublicUrl) {
              resultFiles.push({
                url: filePublicUrl,
                filename: processedFilePath.split("/").pop() || processedFilePath,
                mime_type:
                  fileExt && contentTypeMap[fileExt]
                    ? contentTypeMap[fileExt]
                    : "application/octet-stream"
              });
            }
          }
        }

        // Update nca_message for multiple files
        if (resultFiles.length > 1) {
          signedUrl = `${resultFiles.length} files generated`;
        }
      } // Close else block for shouldSkipFileProcessing
    } else if (code >= 400) {
      console.log(`❌ Job ${job_id} failed with code ${code}: ${message}`);
      processing_status = "failed";
      error_message = message || `Error code ${code}`;
    } else {
      console.log(`⏳ Job ${job_id} status update: ${message}`);
      processing_status = "processing";
    }

    // Update job record in database
    const { data: jobData, error: updateError } = await supabase
      .from("jobs")
      .update({
        nca_endpoint: endpoint,
        nca_build_number: build_number?.toString(),
        nca_queue_length: queue_length,
        nca_queue_id: queue_id?.toString(),
        nca_total_time: total_time,
        nca_queue_time: queue_time,
        nca_run_time: run_time,
        nca_pid: pid,
        nca_code: code?.toString(),
        processing_status: processing_status,
        nca_message: signedUrl || response || message,
        nca_result_files: resultFiles.length > 0 ? resultFiles : null,
        error_message: error_message,
        updated_at: new Date().toISOString()
      })
      .eq("nca_job_id", job_id)
      .select("id, user_id, custom_id")
      .single();

    if (updateError) {
      console.error("❌ Failed to update job record:", updateError);
    } else {
      console.log(`✅ Job ${job_id} updated in database with status: ${processing_status}`);
      if (processing_status === "completed" && signedUrl) {
        console.log(`📎 Public URL available in jobs table: ${signedUrl}`);
      }
    }

    // Store endpoint-specific response data in dedicated tables
    if (processing_status === "completed" && jobData?.id && endpoint) {
      const endpointResult = await storeEndpointSpecificData(supabase, endpoint, jobData.id, response, payload);

      // For transcription endpoint, add files to nca_result_files array
      if (endpoint === "/v1/transcribe/media" && endpointResult.transcriptionFiles) {
        const files = endpointResult.transcriptionFiles;

        // Build result files array for transcription outputs
        const transcriptionResultFiles: ResultFile[] = [];

        if (files.textUrl) {
          transcriptionResultFiles.push({
            url: files.textUrl,
            filename: "transcription.txt",
            mime_type: "text/plain"
          });
        }

        if (files.srtUrl) {
          transcriptionResultFiles.push({
            url: files.srtUrl,
            filename: "subtitles.srt",
            mime_type: "text/plain" // Use text/plain so browsers display instead of download
          });
        }

        if (files.segmentsUrl) {
          transcriptionResultFiles.push({
            url: files.segmentsUrl,
            filename: "segments.json",
            mime_type: "application/json"
          });
        }

        if (transcriptionResultFiles.length > 0) {
          // Add to existing resultFiles array (may already have files from other processing)
          resultFiles.push(...transcriptionResultFiles);

          // Update signedUrl message
          signedUrl = `Transcription completed - ${transcriptionResultFiles.length} files available`;
          console.log(`📄 Added ${transcriptionResultFiles.length} transcription files to result`);

          // Update job record with transcription file links in nca_result_files
          await supabase
            .from("jobs")
            .update({
              nca_message: signedUrl,
              nca_result_files: resultFiles, // Use standard result files array
              updated_at: new Date().toISOString()
            })
            .eq("id", jobData.id);
        }
      }

      // ============================================================================
      // CREATE FILE RELATIONSHIP TRACKING
      // ============================================================================
      // Link jobs to input/output files and analysis data for complete traceability

      // Data-only endpoints that don't produce file outputs
      const dataOnlyEndpoints = [
        "/v1/media/silence",
        "/v1/media/metadata",
        "/v1/transcribe/media",
        "/v1/code/execute/python"
      ];

      const analysisTableMap: Record<string, string> = {
        "/v1/media/silence": "media_silence",
        "/v1/media/metadata": "media_metadata",
        "/v1/transcribe/media": "media_transcribe",
        "/v1/code/execute/python": "code_execution"
      };

      if (dataOnlyEndpoints.includes(endpoint)) {
        // For data-only endpoints: Link input files to analysis results
        console.log(`🔗 Creating file_analyses records for ${endpoint}`);

        // Get input files for this job
        const { data: inputFiles } = await supabase
          .from("job_files")
          .select("file_id")
          .eq("job_id", jobData.id)
          .eq("file_role", "input");

        if (inputFiles && inputFiles.length > 0) {
          const analysisTable = analysisTableMap[endpoint];

          // Get the analysis record ID from the endpoint-specific table
          const { data: analysisRecord } = await supabase
            .from(analysisTable)
            .select("id")
            .eq("job_id", jobData.id)
            .single();

          if (analysisRecord) {
            // Create file_analyses records linking each input file to the analysis data
            const fileAnalysesRecords = inputFiles.map((inputFile) => ({
              file_id: inputFile.file_id,
              job_id: jobData.id,
              analysis_type: endpoint.split("/").pop(), // 'silence', 'metadata', etc.
              analysis_table: analysisTable,
              analysis_id: analysisRecord.id
            }));

            const { error: analysesError } = await supabase
              .from("file_analyses")
              .insert(fileAnalysesRecords);

            if (analysesError) {
              console.warn(`⚠️ Could not create file_analyses records: ${analysesError.message}`);
            } else {
              console.log(`✅ Created ${fileAnalysesRecords.length} file_analyses records`);
            }
          }
        }
      } else if (resultFiles.length > 0) {
        // For file-producing endpoints: Link job to output files
        console.log(`🔗 Creating job_files records for ${resultFiles.length} output files`);

        // Get the file IDs for the output files we just created
        const fileNames = resultFiles.map((rf) => rf.filename);
        const { data: createdFiles } = await supabase
          .from("files")
          .select("id, file_name")
          .eq("user_id", jobData.user_id)
          .in("file_name", fileNames)
          .order("created_at", { ascending: false })
          .limit(resultFiles.length);

        if (createdFiles && createdFiles.length > 0) {
          // Create job_files records for output files with sequence numbers
          const jobFilesRecords = createdFiles.map((file, index) => ({
            job_id: jobData.id,
            file_id: file.id,
            file_role: "output",
            sequence_number: index + 1
          }));

          const { error: jobFilesError } = await supabase.from("job_files").insert(jobFilesRecords);

          if (jobFilesError) {
            console.warn(`⚠️ Could not create job_files records: ${jobFilesError.message}`);
          } else {
            console.log(`✅ Created ${jobFilesRecords.length} job_files records (output)`);
          }
        }
      }
    }

    // Log processing metrics if available
    if (run_time !== undefined) {
      console.log(`📊 Job ${job_id} metrics:`, {
        endpoint,
        run_time: `${run_time}s`,
        queue_time: `${queue_time}s`,
        total_time: `${total_time}s`,
        queue_length,
        build_number
      });
    }

    // Respond to NCA Toolkit that webhook was received
    return new Response(
      JSON.stringify({
        received: true,
        job_id: job_id,
        processed_at: new Date().toISOString(),
        database_updated: !updateError
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("💥 Webhook processing error:", error);
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
