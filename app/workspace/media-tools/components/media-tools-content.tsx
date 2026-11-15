"use client";

import { useEffect, useRef } from "react";
import { Video, Music, ImageIcon, Code, Wand2, Upload } from "lucide-react";
import { staggerFadeInUp, gridStagger } from "@/lib/animations";

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
import { MediaDownloadTool } from "./tools/media/media-download-tool";
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
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Animate sections on mount
  useEffect(() => {
    const sections = sectionsRef.current.filter(Boolean) as HTMLElement[];

    if (sections.length > 0) {
      staggerFadeInUp(sections, {
        stagger: 150,
        delay: 100
      });
    }

    // Animate tool cards within each section
    sections.forEach((section) => {
      const cards = section.querySelectorAll("[data-tool-card]");
      if (cards.length > 0) {
        setTimeout(() => {
          gridStagger(cards as unknown as HTMLElement[], 3, {
            delay: 300
          });
        }, 200);
      }
    });
  }, []);

  const setSectionRef = (index: number) => (el: HTMLDivElement | null) => {
    sectionsRef.current[index] = el;
  };

  return (
    <div className="space-y-8">
      {/* Video Processing Section */}
      <div ref={setSectionRef(0)} className="space-y-4" style={{ opacity: 0 }}>
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Video Processing</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div data-tool-card style={{ opacity: 0 }}>
            <VideoCaptionTool />
          </div>
          <div data-tool-card style={{ opacity: 0 }}>
            <VideoTrimTool />
          </div>
          <div data-tool-card style={{ opacity: 0 }}>
            <VideoSplitTool />
          </div>
          <div data-tool-card style={{ opacity: 0 }}>
            <VideoCutTool />
          </div>
          <div data-tool-card style={{ opacity: 0 }}>
            <VideoThumbnailTool />
          </div>
          <div data-tool-card style={{ opacity: 0 }}>
            <VideoConcatenateTool />
          </div>
        </div>
      </div>

      {/* Audio Processing Section */}
      <div ref={setSectionRef(1)} className="space-y-4" style={{ opacity: 0 }}>
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-semibold">Audio Processing</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div data-tool-card style={{ opacity: 0 }}>
            <AudioConcatenateTool />
          </div>
          <div data-tool-card style={{ opacity: 0 }}>
            <SilenceDetectionTool />
          </div>
        </div>
      </div>

      {/* Image Processing Section */}
      <div ref={setSectionRef(2)} className="space-y-4" style={{ opacity: 0 }}>
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-semibold">Image Processing</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div data-tool-card style={{ opacity: 0 }}>
            <ImageToVideoTool />
          </div>
        </div>
      </div>

      {/* Media Tools Section */}
      <div ref={setSectionRef(3)} className="space-y-4" style={{ opacity: 0 }}>
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-orange-600" />
          <h2 className="text-xl font-semibold">Media Tools</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div data-tool-card style={{ opacity: 0 }}>
            <MediaConvertTool />
          </div>
          <div data-tool-card style={{ opacity: 0 }}>
            <MediaToMp3Tool />
          </div>
          <div data-tool-card style={{ opacity: 0 }}>
            <MediaTranscribeTool />
          </div>
          <div data-tool-card style={{ opacity: 0 }}>
            <MediaMetadataTool />
          </div>
          <div data-tool-card style={{ opacity: 0 }}>
            <MediaDownloadTool />
          </div>
        </div>
      </div>

      {/* Code Execution Section */}
      <div ref={setSectionRef(4)} className="space-y-4" style={{ opacity: 0 }}>
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-semibold">Code Execution</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div data-tool-card style={{ opacity: 0 }}>
            <PythonExecutionTool />
          </div>
        </div>
      </div>

      {/* Cloud Storage Section */}
      <div ref={setSectionRef(5)} className="space-y-4" style={{ opacity: 0 }}>
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-semibold">Cloud Storage</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div data-tool-card style={{ opacity: 0 }}>
            <S3UploadTool />
          </div>
        </div>
      </div>
    </div>
  );
}
