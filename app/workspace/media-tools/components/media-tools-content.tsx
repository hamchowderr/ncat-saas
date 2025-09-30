"use client";

import { Video, Music, ImageIcon, Code, Wand2, Upload } from "lucide-react";

// Import extracted tools
import { AudioConcatenateTool } from "./tools/audio/audio-concatenate-tool";
import { SilenceDetectionTool } from "./tools/audio/silence-detection-tool";
import { ImageToVideoTool } from "./tools/image/image-to-video-tool";
import { PythonExecutionTool } from "./tools/code/python-execution-tool";
import { VideoCaptionTool } from "./tools/video/video-caption-tool";
import { VideoTrimTool } from "./tools/video/video-trim-tool";
import { VideoSplitTool } from "./tools/video/video-split-tool";
import { VideoCutTool } from "./tools/video/video-cut-tool";
import { VideoThumbnailTool } from "./tools/video/video-thumbnail-tool";
import { VideoConcatenateTool } from "./tools/video/video-concatenate-tool";
import { MediaConvertTool } from "./tools/media/media-convert-tool";
import { MediaToMp3Tool } from "./tools/media/media-to-mp3-tool";
import { MediaTranscribeTool } from "./tools/media/media-transcribe-tool";
import { MediaMetadataTool } from "./tools/media/media-metadata-tool";
import { S3UploadTool } from "./tools/storage/s3-upload-tool";

/**
 * Media Tools Content - Modular Version
 *
 * This component serves as the main orchestrator for all media processing tools.
 * Each tool is a self-contained component in its own file under ./tools/
 *
 * Directory Structure:
 * - tools/audio/     - Audio processing tools
 * - tools/video/     - Video processing tools
 * - tools/image/     - Image processing tools
 * - tools/code/      - Code execution tools
 * - tools/media/     - Media conversion and processing tools
 * - tools/storage/   - Cloud storage tools
 */
export function MediaToolsContent() {
  return (
    <div className="space-y-8">
      {/* Video Processing Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Video Processing</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <VideoCaptionTool />
          <VideoTrimTool />
          <VideoSplitTool />
          <VideoCutTool />
          <VideoThumbnailTool />
          <VideoConcatenateTool />
        </div>
      </div>

      {/* Audio Processing Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-semibold">Audio Processing</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AudioConcatenateTool />
          <SilenceDetectionTool />
        </div>
      </div>

      {/* Image Processing Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-semibold">Image Processing</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ImageToVideoTool />
        </div>
      </div>

      {/* Media Tools Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-orange-600" />
          <h2 className="text-xl font-semibold">Media Tools</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MediaConvertTool />
          <MediaToMp3Tool />
          <MediaTranscribeTool />
          <MediaMetadataTool />
        </div>
      </div>

      {/* Code Execution Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-semibold">Code Execution</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <PythonExecutionTool />
        </div>
      </div>

      {/* Cloud Storage Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-semibold">Cloud Storage</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <S3UploadTool />
        </div>
      </div>
    </div>
  );
}
