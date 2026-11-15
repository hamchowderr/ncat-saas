import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * NCAT API Tools
 * Comprehensive tools for all NCAT API endpoints
 * These tools call actual Supabase Edge Functions that communicate with the NCAT API
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Helper function to call Supabase Edge Functions
 */
async function callEdgeFunction(
  endpoint: string,
  payload: Record<string, any>,
  userToken?: string
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (userToken) {
    headers["Authorization"] = `Bearer ${userToken}`;
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Edge Function ${endpoint} failed: ${error}`);
  }

  return await response.json();
}

// ============================================================================
// MEDIA PROCESSING TOOLS
// ============================================================================

/**
 * Media Convert Tool
 * Converts media files between different formats
 */
export const ncatMediaConvertTool = createTool({
  id: "ncat-media-convert",
  description:
    "Convert media files between different formats (video, audio, images). Supports MP4, AVI, MOV, MP3, WAV, PNG, JPG, WebM, and more. Returns a job ID for tracking.",
  inputSchema: z.object({
    mediaUrl: z.string().describe("URL of the media file to convert"),
    outputFormat: z.string().describe("Desired output format (e.g., mp4, mp3, png, jpg, webm)"),
    customId: z.string().optional().describe("Optional custom ID for job tracking"),
    userToken: z.string().optional().describe("User authentication token")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    ncaJobId: z.string().optional(),
    message: z.string(),
    customId: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      const result = await callEdgeFunction(
        "media-convert",
        {
          media_url: context.mediaUrl,
          output_format: context.outputFormat,
          custom_id: context.customId
        },
        context.userToken
      );

      return {
        success: true,
        ncaJobId: result.nca_job_id,
        message: result.message || "Media conversion started",
        customId: result.custom_id
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to convert media: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});

/**
 * Media Convert to MP3 Tool
 * Specialized tool for converting any media to MP3 audio
 */
export const ncatMediaConvertMp3Tool = createTool({
  id: "ncat-media-convert-mp3",
  description:
    "Convert any media file specifically to MP3 audio format. Optimized for audio extraction from videos or audio format conversion.",
  inputSchema: z.object({
    mediaUrl: z.string().describe("URL of the media file to convert to MP3"),
    customId: z.string().optional().describe("Optional custom ID for job tracking"),
    userToken: z.string().optional().describe("User authentication token")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    ncaJobId: z.string().optional(),
    message: z.string(),
    customId: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      const result = await callEdgeFunction(
        "media-convert-mp3",
        {
          media_url: context.mediaUrl,
          custom_id: context.customId
        },
        context.userToken
      );

      return {
        success: true,
        ncaJobId: result.nca_job_id,
        message: result.message || "MP3 conversion started",
        customId: result.custom_id
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to convert to MP3: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});

/**
 * Media Transcribe Tool
 * Transcribe or translate audio/video content to text
 */
export const ncatMediaTranscribeTool = createTool({
  id: "ncat-media-transcribe",
  description:
    "Transcribe audio or video files to text. Supports multiple languages and can translate content. Great for creating subtitles or extracting spoken content.",
  inputSchema: z.object({
    mediaUrl: z.string().describe("URL of the audio/video file to transcribe"),
    language: z
      .string()
      .optional()
      .describe("Language code (e.g., en, es, fr) or 'auto' for detection"),
    translate: z.boolean().optional().describe("Whether to translate to English"),
    customId: z.string().optional().describe("Optional custom ID for job tracking"),
    userToken: z.string().optional().describe("User authentication token")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    ncaJobId: z.string().optional(),
    message: z.string(),
    transcript: z.string().optional(),
    customId: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      const result = await callEdgeFunction(
        "media-transcribe",
        {
          media_url: context.mediaUrl,
          language: context.language,
          translate: context.translate,
          custom_id: context.customId
        },
        context.userToken
      );

      return {
        success: true,
        ncaJobId: result.nca_job_id,
        message: result.message || "Transcription started",
        transcript: result.transcript,
        customId: result.custom_id
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to transcribe: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});

/**
 * Media Silence Detection Tool
 * Detect silence intervals in audio/video files
 */
export const ncatMediaSilenceTool = createTool({
  id: "ncat-media-silence",
  description:
    "Detect silence intervals in media files. Useful for identifying pauses, editing points, or removing dead air from recordings.",
  inputSchema: z.object({
    mediaUrl: z.string().describe("URL of the media file to analyze for silence"),
    noiseThreshold: z.number().optional().describe("Noise threshold in dB (default: -50dB)"),
    duration: z.number().optional().describe("Minimum silence duration in seconds (default: 2s)"),
    customId: z.string().optional().describe("Optional custom ID for job tracking"),
    userToken: z.string().optional().describe("User authentication token")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    ncaJobId: z.string().optional(),
    message: z.string(),
    silenceIntervals: z.array(z.object({ start: z.number(), end: z.number() })).optional(),
    customId: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      const result = await callEdgeFunction(
        "media-silence",
        {
          media_url: context.mediaUrl,
          noise: context.noiseThreshold, // Edge Function will format with "dB" suffix
          duration: context.duration,
          custom_id: context.customId
        },
        context.userToken
      );

      return {
        success: true,
        ncaJobId: result.nca_job_id,
        message: result.message || "Silence detection started",
        silenceIntervals: result.silence_intervals,
        customId: result.custom_id
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to detect silence: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});

/**
 * Media Metadata Tool
 * Extract comprehensive metadata from media files
 */
export const ncatMediaMetadataTool = createTool({
  id: "ncat-media-metadata",
  description:
    "Extract detailed metadata from media files including duration, resolution, codec, bitrate, frame rate, and other technical information.",
  inputSchema: z.object({
    mediaUrl: z.string().describe("URL of the media file to analyze"),
    customId: z.string().optional().describe("Optional custom ID for job tracking"),
    userToken: z.string().optional().describe("User authentication token")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    ncaJobId: z.string().optional(),
    metadata: z
      .object({
        duration: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        codec: z.string().optional(),
        bitrate: z.string().optional(),
        frameRate: z.number().optional(),
        fileSize: z.number().optional(),
        format: z.string().optional()
      })
      .optional(),
    message: z.string(),
    customId: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      const result = await callEdgeFunction(
        "media-metadata",
        {
          media_url: context.mediaUrl,
          id: context.customId
        },
        context.userToken
      );

      return {
        success: true,
        ncaJobId: result.nca_job_id,
        metadata: result.metadata,
        message: result.message || "Metadata extraction started",
        customId: result.custom_id
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to extract metadata: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});

// ============================================================================
// VIDEO PROCESSING TOOLS
// ============================================================================

/**
 * Video Caption Tool
 * Add customizable captions/subtitles to videos
 */
export const ncatVideoCaptionTool = createTool({
  id: "ncat-video-caption",
  description:
    "Add captions or subtitles to videos with customizable styling. Supports SRT subtitle files or direct text captions.",
  inputSchema: z.object({
    videoUrl: z.string().describe("URL of the video file"),
    subtitleUrl: z.string().optional().describe("URL of SRT subtitle file"),
    fontSize: z.number().optional().describe("Font size (8-72, default: 24)"),
    fontColor: z.string().optional().describe("Font color (e.g., 'white', '#FFFFFF')"),
    position: z.enum(["top", "bottom", "center"]).optional().describe("Caption position on screen"),
    customId: z.string().optional().describe("Optional custom ID for job tracking"),
    userToken: z.string().optional().describe("User authentication token")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    ncaJobId: z.string().optional(),
    message: z.string(),
    customId: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      const result = await callEdgeFunction(
        "video-caption",
        {
          video_url: context.videoUrl,
          subtitle_url: context.subtitleUrl,
          font_size: context.fontSize,
          font_color: context.fontColor,
          position: context.position,
          custom_id: context.customId
        },
        context.userToken
      );

      return {
        success: true,
        ncaJobId: result.nca_job_id,
        message: result.message || "Video captioning started",
        customId: result.custom_id
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to add captions: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});

/**
 * Video Concatenate Tool
 * Combine multiple video files into one
 */
export const ncatVideoConcatenateTool = createTool({
  id: "ncat-video-concatenate",
  description:
    "Combine multiple video files into a single video. Videos are merged in the order provided. Useful for creating final videos from multiple clips.",
  inputSchema: z.object({
    videoUrls: z.array(z.string()).min(2).describe("Array of video URLs to concatenate (in order)"),
    customId: z.string().optional().describe("Optional custom ID for job tracking"),
    userToken: z.string().optional().describe("User authentication token")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    ncaJobId: z.string().optional(),
    message: z.string(),
    customId: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      const result = await callEdgeFunction(
        "video-concatenate",
        {
          video_urls: context.videoUrls,
          custom_id: context.customId
        },
        context.userToken
      );

      return {
        success: true,
        ncaJobId: result.nca_job_id,
        message: result.message || "Video concatenation started",
        customId: result.custom_id
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to concatenate videos: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});

/**
 * Video Cut Tool
 * Extract specific segments from a video
 */
export const ncatVideoCutTool = createTool({
  id: "ncat-video-cut",
  description:
    "Extract one or more segments from a video file. Specify start and end times to cut out specific portions.",
  inputSchema: z.object({
    videoUrl: z.string().describe("URL of the video file to cut"),
    segments: z
      .array(
        z.object({
          startTime: z.number().describe("Start time in seconds"),
          endTime: z.number().describe("End time in seconds")
        })
      )
      .describe("Segments to extract from the video"),
    customId: z.string().optional().describe("Optional custom ID for job tracking"),
    userToken: z.string().optional().describe("User authentication token")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    ncaJobId: z.string().optional(),
    message: z.string(),
    customId: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      const result = await callEdgeFunction(
        "video-cut",
        {
          video_url: context.videoUrl,
          segments: context.segments,
          custom_id: context.customId
        },
        context.userToken
      );

      return {
        success: true,
        ncaJobId: result.nca_job_id,
        message: result.message || "Video cutting started",
        customId: result.custom_id
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to cut video: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});

/**
 * Video Split Tool
 * Split a video into multiple segments of equal duration
 */
export const ncatVideoSplitTool = createTool({
  id: "ncat-video-split",
  description:
    "Split a video into multiple segments of equal duration. Useful for creating video clips or processing long videos in chunks.",
  inputSchema: z.object({
    videoUrl: z.string().describe("URL of the video file to split"),
    segmentDuration: z.number().describe("Duration of each segment in seconds"),
    customId: z.string().optional().describe("Optional custom ID for job tracking"),
    userToken: z.string().optional().describe("User authentication token")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    ncaJobId: z.string().optional(),
    message: z.string(),
    customId: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      const result = await callEdgeFunction(
        "video-split",
        {
          video_url: context.videoUrl,
          segment_duration: context.segmentDuration,
          custom_id: context.customId
        },
        context.userToken
      );

      return {
        success: true,
        ncaJobId: result.nca_job_id,
        message: result.message || "Video splitting started",
        customId: result.custom_id
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to split video: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});

/**
 * Video Trim Tool
 * Trim a video to a specific start and end time
 */
export const ncatVideoTrimTool = createTool({
  id: "ncat-video-trim",
  description:
    "Trim a video to keep only the content between specified start and end times. Removes content before and after the specified range.",
  inputSchema: z.object({
    videoUrl: z.string().describe("URL of the video file to trim"),
    startTime: z.number().describe("Start time in seconds"),
    endTime: z.number().describe("End time in seconds"),
    customId: z.string().optional().describe("Optional custom ID for job tracking"),
    userToken: z.string().optional().describe("User authentication token")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    ncaJobId: z.string().optional(),
    message: z.string(),
    customId: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      const result = await callEdgeFunction(
        "video-trim",
        {
          video_url: context.videoUrl,
          start_time: context.startTime,
          end_time: context.endTime,
          custom_id: context.customId
        },
        context.userToken
      );

      return {
        success: true,
        ncaJobId: result.nca_job_id,
        message: result.message || "Video trimming started",
        customId: result.custom_id
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to trim video: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});

/**
 * Video Thumbnail Tool
 * Extract thumbnail images from video at specific times
 */
export const ncatVideoThumbnailTool = createTool({
  id: "ncat-video-thumbnail",
  description:
    "Extract thumbnail images from a video at specified timestamps. Great for creating video previews or selecting key frames.",
  inputSchema: z.object({
    videoUrl: z.string().describe("URL of the video file"),
    timestamps: z
      .array(z.number())
      .describe("Array of timestamps (in seconds) to extract thumbnails"),
    width: z.number().optional().describe("Thumbnail width in pixels (maintains aspect ratio)"),
    customId: z.string().optional().describe("Optional custom ID for job tracking"),
    userToken: z.string().optional().describe("User authentication token")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    ncaJobId: z.string().optional(),
    message: z.string(),
    customId: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      const result = await callEdgeFunction(
        "video-thumbnail",
        {
          video_url: context.videoUrl,
          timestamps: context.timestamps,
          width: context.width,
          custom_id: context.customId
        },
        context.userToken
      );

      return {
        success: true,
        ncaJobId: result.nca_job_id,
        message: result.message || "Thumbnail extraction started",
        customId: result.custom_id
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to extract thumbnails: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});

/**
 * Image to Video Tool
 * Convert static images into videos with zoom effects
 */
export const ncatImageToVideoTool = createTool({
  id: "ncat-image-to-video",
  description:
    "Transform static images into videos with customizable duration and zoom effects. Perfect for creating Ken Burns style effects or turning images into video clips.",
  inputSchema: z.object({
    imageUrl: z.string().describe("URL of the image file to convert"),
    length: z.number().optional().describe("Video duration in seconds (1-60, default: 5)"),
    frameRate: z.number().optional().describe("Frame rate in fps (15-60, default: 30)"),
    zoomSpeed: z
      .number()
      .optional()
      .describe("Zoom speed/intensity (0-100, default: 10). 0 = no zoom, 100 = maximum zoom"),
    customId: z.string().optional().describe("Optional custom ID for job tracking"),
    userToken: z.string().optional().describe("User authentication token")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    ncaJobId: z.string().optional(),
    message: z.string(),
    customId: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      const result = await callEdgeFunction(
        "image-convert-video",
        {
          image_url: context.imageUrl,
          length: context.length,
          frame_rate: context.frameRate,
          zoom_speed: context.zoomSpeed,
          custom_id: context.customId
        },
        context.userToken
      );

      return {
        success: true,
        ncaJobId: result.nca_job_id,
        message: result.message || "Image to video conversion started",
        customId: result.custom_id
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to convert image to video: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});

// ============================================================================
// AUDIO PROCESSING TOOLS
// ============================================================================

/**
 * Audio Concatenate Tool
 * Combine multiple audio files into one
 */
export const ncatAudioConcatenateTool = createTool({
  id: "ncat-audio-concatenate",
  description:
    "Combine multiple audio files into a single audio file. Audio tracks are merged in the order provided.",
  inputSchema: z.object({
    audioUrls: z.array(z.string()).min(2).describe("Array of audio URLs to concatenate (in order)"),
    customId: z.string().optional().describe("Optional custom ID for job tracking"),
    userToken: z.string().optional().describe("User authentication token")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    ncaJobId: z.string().optional(),
    message: z.string(),
    customId: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      const result = await callEdgeFunction(
        "audio-concatenate",
        {
          audio_urls: context.audioUrls,
          custom_id: context.customId
        },
        context.userToken
      );

      return {
        success: true,
        ncaJobId: result.nca_job_id,
        message: result.message || "Audio concatenation started",
        customId: result.custom_id
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to concatenate audio: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});

// ============================================================================
// STORAGE TOOLS
// ============================================================================

/**
 * S3 Upload Tool
 * Upload files to S3-compatible storage
 */
export const ncatS3UploadTool = createTool({
  id: "ncat-s3-upload",
  description:
    "Upload files to Amazon S3 or S3-compatible storage. Supports direct URL streaming to cloud storage.",
  inputSchema: z.object({
    fileUrl: z.string().describe("URL of the file to upload to S3"),
    bucketName: z.string().describe("S3 bucket name"),
    fileName: z.string().describe("Destination file name in S3"),
    region: z.string().optional().describe("AWS region (default: us-east-1)"),
    customId: z.string().optional().describe("Optional custom ID for job tracking"),
    userToken: z.string().optional().describe("User authentication token")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    ncaJobId: z.string().optional(),
    s3Url: z.string().optional(),
    message: z.string(),
    customId: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      const result = await callEdgeFunction(
        "s3-upload",
        {
          file_url: context.fileUrl,
          bucket_name: context.bucketName,
          file_name: context.fileName,
          region: context.region,
          custom_id: context.customId
        },
        context.userToken
      );

      return {
        success: true,
        ncaJobId: result.nca_job_id,
        s3Url: result.s3_url,
        message: result.message || "S3 upload started",
        customId: result.custom_id
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to upload to S3: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});

// ============================================================================
// ADVANCED TOOLS
// ============================================================================

/**
 * FFmpeg Compose Tool
 * Advanced video composition and effects using FFmpeg
 */
export const ncatFfmpegComposeTool = createTool({
  id: "ncat-ffmpeg-compose",
  description:
    "Execute complex FFmpeg operations for advanced video composition, effects, and transformations. Provides direct access to FFmpeg capabilities.",
  inputSchema: z.object({
    inputUrls: z.array(z.string()).describe("Array of input media URLs"),
    ffmpegCommand: z
      .string()
      .describe(
        "FFmpeg command/filter string (without input/output file paths - those are handled automatically)"
      ),
    customId: z.string().optional().describe("Optional custom ID for job tracking"),
    userToken: z.string().optional().describe("User authentication token")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    ncaJobId: z.string().optional(),
    message: z.string(),
    customId: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      const result = await callEdgeFunction(
        "ffmpeg-compose",
        {
          input_urls: context.inputUrls,
          ffmpeg_command: context.ffmpegCommand,
          custom_id: context.customId
        },
        context.userToken
      );

      return {
        success: true,
        ncaJobId: result.nca_job_id,
        message: result.message || "FFmpeg composition started",
        customId: result.custom_id
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to execute FFmpeg composition: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});

/**
 * Python Code Execution Tool
 * Execute Python code remotely for custom processing
 */
export const ncatPythonExecuteTool = createTool({
  id: "ncat-python-execute",
  description:
    "Execute Python code remotely. Useful for custom media processing, data manipulation, or running specialized algorithms.",
  inputSchema: z.object({
    code: z.string().describe("Python code to execute"),
    customId: z.string().optional().describe("Optional custom ID for job tracking"),
    userToken: z.string().optional().describe("User authentication token")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    ncaJobId: z.string().optional(),
    output: z.string().optional(),
    message: z.string(),
    customId: z.string().optional()
  }),
  execute: async ({ context }) => {
    try {
      const result = await callEdgeFunction(
        "code-execute-python",
        {
          code: context.code,
          custom_id: context.customId
        },
        context.userToken
      );

      return {
        success: true,
        ncaJobId: result.nca_job_id,
        output: result.output,
        message: result.message || "Python code execution started",
        customId: result.custom_id
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to execute Python code: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});

// ============================================================================
// JOB TRACKING TOOLS
// ============================================================================

/**
 * Job Status Tool
 * Check the status of an NCAT processing job
 */
export const ncatJobStatusTool = createTool({
  id: "ncat-job-status",
  description:
    "Check the status of a processing job by its NCA job ID. Returns current status, progress, and results if completed.",
  inputSchema: z.object({
    ncaJobId: z.string().describe("NCA job ID to check status"),
    userToken: z.string().optional().describe("User authentication token")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    jobId: z.string(),
    status: z.enum(["pending", "processing", "completed", "failed"]),
    progress: z.number().optional(),
    result: z.any().optional(),
    message: z.string()
  }),
  execute: async ({ context }) => {
    try {
      // Query Supabase jobs table for status
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/jobs?nca_job_id=eq.${context.ncaJobId}`,
        {
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || "",
            ...(context.userToken && { Authorization: `Bearer ${context.userToken}` })
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch job status");
      }

      const jobs = await response.json();

      if (!jobs || jobs.length === 0) {
        return {
          success: false,
          jobId: context.ncaJobId,
          status: "pending" as const,
          message: "Job not found"
        };
      }

      const job = jobs[0];

      return {
        success: true,
        jobId: context.ncaJobId,
        status: job.processing_status,
        progress: job.progress_percentage,
        result: job.nca_message,
        message: job.error_message || job.nca_message || "Job status retrieved"
      };
    } catch (error) {
      return {
        success: false,
        jobId: context.ncaJobId,
        status: "pending" as const,
        message: `Failed to check job status: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});
