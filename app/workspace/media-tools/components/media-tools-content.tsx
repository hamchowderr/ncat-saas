"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Video, 
  Image, 
  Music, 
  FileText, 
  Scissors, 
  Download,
  Upload,
  Wand2,
  Zap,
  Camera,
  Mic,
  Edit3
} from "lucide-react";

export function MediaToolsContent() {
  return (
    <div className="space-y-8">
      {/* Video Processing */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Video Processing</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm">Video Caption</CardTitle>
              </div>
              <CardDescription className="text-xs">Adds customizable captions to videos with various styling options</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm">Video Concatenate</CardTitle>
              </div>
              <CardDescription className="text-xs">Combines multiple videos into a single continuous video file</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm">Video Thumbnail</CardTitle>
              </div>
              <CardDescription className="text-xs">Extracts a thumbnail image from a specific timestamp in a video</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Scissors className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm">Video Cut</CardTitle>
              </div>
              <CardDescription className="text-xs">Cuts specified segments from a video file with optional encoding settings</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm">Video Split</CardTitle>
              </div>
              <CardDescription className="text-xs">Splits a video into multiple segments based on specified start and end times</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm">Video Trim</CardTitle>
              </div>
              <CardDescription className="text-xs">Trims a video by keeping only the content between specified start and end times</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Audio Processing */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-semibold">Audio Processing</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-600" />
                <CardTitle className="text-sm">Audio Concatenate</CardTitle>
              </div>
              <CardDescription className="text-xs">Combines multiple audio files into a single audio file</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Image Processing */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Image className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-semibold">Image Processing</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-purple-600" />
                <CardTitle className="text-sm">Image to Video</CardTitle>
              </div>
              <CardDescription className="text-xs">Transforms a static image into a video with custom duration and zoom effects</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-purple-600" />
                <CardTitle className="text-sm">Webpage Screenshot</CardTitle>
              </div>
              <CardDescription className="text-xs">Captures screenshots of web pages using Playwright with advanced options</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Media Processing */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-orange-600" />
          <h2 className="text-xl font-semibold">Media Processing</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-orange-600" />
                <CardTitle className="text-sm">Media Convert</CardTitle>
              </div>
              <CardDescription className="text-xs">Converts media files from one format to another with customizable codec options</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-orange-600" />
                <CardTitle className="text-sm">Convert to MP3</CardTitle>
              </div>
              <CardDescription className="text-xs">Converts various media formats specifically to MP3 audio</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-orange-600" />
                <CardTitle className="text-sm">Media Download</CardTitle>
              </div>
              <CardDescription className="text-xs">Downloads media content from various online sources using yt-dlp</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-600" />
                <CardTitle className="text-sm">Media Feedback</CardTitle>
              </div>
              <CardDescription className="text-xs">Provides a web interface for collecting and displaying feedback on media content</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-orange-600" />
                <CardTitle className="text-sm">Media Transcribe</CardTitle>
              </div>
              <CardDescription className="text-xs">Transcribes or translates audio/video content from a provided media URL</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-600" />
                <CardTitle className="text-sm">Media Silence</CardTitle>
              </div>
              <CardDescription className="text-xs">Detects silence intervals in a given media file</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-orange-600" />
                <CardTitle className="text-sm">Media Metadata</CardTitle>
              </div>
              <CardDescription className="text-xs">Extracts comprehensive metadata from media files including format, codecs, resolution, and bitrates</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Code Execution */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-semibold">Code Execution</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-600" />
                <CardTitle className="text-sm">Execute Python</CardTitle>
              </div>
              <CardDescription className="text-xs">Executes Python code remotely and returns the execution results</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* FFmpeg */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-red-600" />
          <h2 className="text-xl font-semibold">FFmpeg</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-red-600" />
                <CardTitle className="text-sm">FFmpeg Compose</CardTitle>
              </div>
              <CardDescription className="text-xs">Provides a flexible interface to FFmpeg for complex media processing operations</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Cloud Storage */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-teal-600" />
          <h2 className="text-xl font-semibold">Cloud Storage</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-teal-600" />
                <CardTitle className="text-sm">S3 Upload</CardTitle>
              </div>
              <CardDescription className="text-xs">Uploads files to Amazon S3 storage by streaming directly from a URL</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
