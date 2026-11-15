/**
 * TypeScript type definitions for NCAT API endpoint responses
 * These types represent the structured data returned from each endpoint
 */

// ============================================================================
// BASE RESPONSE TYPES
// ============================================================================

export interface BaseNcatResponse {
  endpoint: string;
  code: number;
  id?: string;
  job_id: string;
  message: string;
  pid?: number;
  queue_id?: number | string;
  run_time?: number;
  queue_time?: number;
  total_time?: number;
  queue_length?: number;
  build_number?: string;
}

// ============================================================================
// MEDIA ENDPOINTS
// ============================================================================

export interface TranscriptionSegment {
  start_time: number;
  end_time: number;
  text: string;
}

export interface MediaTranscribeResponse extends BaseNcatResponse {
  response: {
    text?: string;
    srt?: string;
    segments?: TranscriptionSegment[];
    text_url?: string;
    srt_url?: string;
    segments_url?: string;
    language?: string;
    task?: "transcribe" | "translate";
  };
}

export interface MediaMetadataResponse extends BaseNcatResponse {
  response: {
    // File Information
    filesize?: number;
    filesize_mb?: number;
    format?: string;
    overall_bitrate?: number;
    overall_bitrate_mbps?: number;

    // Duration
    duration?: number;
    duration_formatted?: string;

    // Video Metadata
    has_video?: boolean;
    video_codec?: string;
    video_codec_long?: string;
    width?: number;
    height?: number;
    resolution?: string;
    fps?: number;
    video_bitrate?: number;
    video_bitrate_mbps?: number;
    pixel_format?: string;

    // Audio Metadata
    has_audio?: boolean;
    audio_codec?: string;
    audio_codec_long?: string;
    audio_channels?: number;
    audio_sample_rate?: number;
    audio_sample_rate_khz?: number;
    audio_bitrate?: number;
    audio_bitrate_kbps?: number;
  };
}

export interface SilenceSegment {
  start: number;
  end: number;
}

export interface MediaSilenceResponse extends BaseNcatResponse {
  response: SilenceSegment[];
}

export interface MediaConvertResponse extends BaseNcatResponse {
  response: string; // URL of converted file
}

export interface MediaConvertMp3Response extends BaseNcatResponse {
  response: string; // URL of converted MP3 file
}

export interface MediaThumbnail {
  id: string;
  image_url: string;
  width: number;
  height: number;
  original_format?: string;
  converted?: boolean;
}

export interface MediaDownloadResponse extends BaseNcatResponse {
  response: {
    media: {
      media_url: string;
      title?: string;
      format_id?: string;
      ext?: string;
      resolution?: string;
      filesize?: number;
      width?: number;
      height?: number;
      fps?: number;
      video_codec?: string;
      audio_codec?: string;
      upload_date?: string;
      duration?: number;
      view_count?: number;
      uploader?: string;
      uploader_id?: string;
      description?: string;
    };
    thumbnails?: MediaThumbnail[];
  };
}

// ============================================================================
// VIDEO ENDPOINTS
// ============================================================================

export interface VideoCaptionResponse extends BaseNcatResponse {
  response: string; // URL of captioned video
}

export interface VideoConcatenateResponse extends BaseNcatResponse {
  response: string; // URL of concatenated video
}

export interface VideoCutResponse extends BaseNcatResponse {
  response: {
    file_url: string;
  };
}

export interface VideoSplitSegment {
  file_url: string;
}

export interface VideoSplitResponse extends BaseNcatResponse {
  response: VideoSplitSegment[];
}

export interface VideoThumbnailResponse extends BaseNcatResponse {
  response: string; // URL of thumbnail image
}

export interface VideoTrimResponse extends BaseNcatResponse {
  response: string; // URL of trimmed video
}

// ============================================================================
// AUDIO ENDPOINTS
// ============================================================================

export interface AudioConcatenateResponse extends BaseNcatResponse {
  response: string; // URL of concatenated audio
}

// ============================================================================
// IMAGE ENDPOINTS
// ============================================================================

export interface ImageToVideoResponse extends BaseNcatResponse {
  response: string; // URL of generated video
}

// ============================================================================
// CODE ENDPOINTS
// ============================================================================

export interface CodeExecutionResponse extends BaseNcatResponse {
  response: {
    result: any;
    stdout: string;
    stderr: string;
    exit_code: number;
  };
}

// ============================================================================
// FFMPEG ENDPOINTS
// ============================================================================

export interface FfmpegComposeOutput {
  file_url: string;
  thumbnail_url?: string;
  filesize?: number;
  duration?: number;
  bitrate?: number;
  encoder?: string;
}

export interface FfmpegComposeResponse extends BaseNcatResponse {
  response: FfmpegComposeOutput[];
}

// ============================================================================
// S3 ENDPOINTS
// ============================================================================

export interface S3UploadResponse extends BaseNcatResponse {
  response: {
    url: string;
    filename: string;
    bucket: string;
    public: boolean;
    region?: string;
  };
}

// ============================================================================
// UNION TYPE FOR ALL RESPONSES
// ============================================================================

export type NcatResponse =
  | MediaTranscribeResponse
  | MediaMetadataResponse
  | MediaSilenceResponse
  | MediaConvertResponse
  | MediaConvertMp3Response
  | MediaDownloadResponse
  | VideoCaptionResponse
  | VideoConcatenateResponse
  | VideoCutResponse
  | VideoSplitResponse
  | VideoThumbnailResponse
  | VideoTrimResponse
  | AudioConcatenateResponse
  | ImageToVideoResponse
  | CodeExecutionResponse
  | FfmpegComposeResponse
  | S3UploadResponse;

// ============================================================================
// ENDPOINT MAPPING
// ============================================================================

export const NCAT_ENDPOINTS = {
  // Media
  MEDIA_TRANSCRIBE: "/v1/media/transcribe",
  MEDIA_METADATA: "/v1/media/metadata",
  MEDIA_SILENCE: "/v1/media/silence",
  MEDIA_CONVERT: "/v1/media/convert",
  MEDIA_CONVERT_MP3: "/v1/media/convert/mp3",
  MEDIA_DOWNLOAD: "/v1/media/download",

  // Video
  VIDEO_CAPTION: "/v1/video/caption",
  VIDEO_CONCATENATE: "/v1/video/concatenate",
  VIDEO_CUT: "/v1/video/cut",
  VIDEO_SPLIT: "/v1/video/split",
  VIDEO_THUMBNAIL: "/v1/video/thumbnail",
  VIDEO_TRIM: "/v1/video/trim",

  // Audio
  AUDIO_CONCATENATE: "/v1/audio/concatenate",

  // Image
  IMAGE_TO_VIDEO: "/v1/image/convert/video",

  // Code
  CODE_EXECUTE_PYTHON: "/v1/code/execute/python",

  // FFmpeg
  FFMPEG_COMPOSE: "/v1/ffmpeg/compose",

  // S3
  S3_UPLOAD: "/v1/s3/upload"
} as const;

export type NcatEndpoint = (typeof NCAT_ENDPOINTS)[keyof typeof NCAT_ENDPOINTS];

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isMediaTranscribeResponse(
  response: NcatResponse
): response is MediaTranscribeResponse {
  return response.endpoint === NCAT_ENDPOINTS.MEDIA_TRANSCRIBE;
}

export function isMediaMetadataResponse(response: NcatResponse): response is MediaMetadataResponse {
  return response.endpoint === NCAT_ENDPOINTS.MEDIA_METADATA;
}

export function isMediaSilenceResponse(response: NcatResponse): response is MediaSilenceResponse {
  return response.endpoint === NCAT_ENDPOINTS.MEDIA_SILENCE;
}

export function isCodeExecutionResponse(response: NcatResponse): response is CodeExecutionResponse {
  return response.endpoint === NCAT_ENDPOINTS.CODE_EXECUTE_PYTHON;
}

export function isVideoSplitResponse(response: NcatResponse): response is VideoSplitResponse {
  return response.endpoint === NCAT_ENDPOINTS.VIDEO_SPLIT;
}

export function isFfmpegComposeResponse(response: NcatResponse): response is FfmpegComposeResponse {
  return response.endpoint === NCAT_ENDPOINTS.FFMPEG_COMPOSE;
}
