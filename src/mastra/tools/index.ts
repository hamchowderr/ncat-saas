/**
 * Mastra Tools Index
 *
 * This file exports all available tools for Mastra agents.
 *
 * Tool Categories:
 * - NCAT Tools: Comprehensive tools for NCAT API integration (17 tools)
 * - AI Generation Tools: Image and audio generation
 */

// Comprehensive NCAT API tools (production-ready implementations)
export {
  // Media Processing
  ncatMediaConvertTool,
  ncatMediaConvertMp3Tool,
  ncatMediaTranscribeTool,
  ncatMediaSilenceTool,
  ncatMediaMetadataTool,

  // Video Processing
  ncatVideoCaptionTool,
  ncatVideoConcatenateTool,
  ncatVideoCutTool,
  ncatVideoSplitTool,
  ncatVideoTrimTool,
  ncatVideoThumbnailTool,
  ncatImageToVideoTool,

  // Audio Processing
  ncatAudioConcatenateTool,

  // Storage
  ncatS3UploadTool,

  // Advanced
  ncatFfmpegComposeTool,
  ncatPythonExecuteTool,

  // Job Tracking
  ncatJobStatusTool
} from "./ncat-tools";

// AI Generation Tools
export { generateImageTool } from "./generate-image-tool";
export { generateAudioTool } from "./generate-audio-tool";
