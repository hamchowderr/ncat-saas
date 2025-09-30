"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

export function VideoTrimTool() {
  // Video Trim state
  const [isVideoTrimDialogOpen, setIsVideoTrimDialogOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [videoCodec, setVideoCodec] = useState("libx264");
  const [videoPreset, setVideoPreset] = useState("medium");
  const [videoCrf, setVideoCrf] = useState(23);
  const [audioCodec, setAudioCodec] = useState("aac");
  const [audioBitrate, setAudioBitrate] = useState("128k");
  const [videoTrimCustomId, setVideoTrimCustomId] = useState("");
  const [isVideoTrimLoading, setIsVideoTrimLoading] = useState(false);

  // Handler function
  const handleVideoTrimSubmit = async () => {
    setIsVideoTrimLoading(true);
    try {
      if (!videoUrl.trim()) {
        alert("Please provide a video URL");
        return;
      }

      const payload = {
        video_url: videoUrl.trim(),
        start: startTime.trim() || undefined,
        end: endTime.trim() || undefined,
        video_codec: videoCodec || "libx264",
        video_preset: videoPreset || "medium",
        video_crf: videoCrf || 23,
        audio_codec: audioCodec || "aac",
        audio_bitrate: audioBitrate || "128k",
        id: videoTrimCustomId.trim() || undefined
      };

      console.log("Submitting Video Trim:", payload);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert("Video trim request submitted successfully!");
      setIsVideoTrimDialogOpen(false);
      setVideoUrl("");
      setStartTime("");
      setEndTime("");
      setVideoCodec("libx264");
      setVideoPreset("medium");
      setVideoCrf(23);
      setAudioCodec("aac");
      setAudioBitrate("128k");
      setVideoTrimCustomId("");
    } catch (error) {
      alert("Error submitting request: " + error);
    } finally {
      setIsVideoTrimLoading(false);
    }
  };

  return (
    <Dialog open={isVideoTrimDialogOpen} onOpenChange={setIsVideoTrimDialogOpen}>
      <DialogTrigger asChild>
        <Card className="transition-shadow hover:shadow-md cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm">Video Trim</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Trims a video by keeping only the content between specified start and end times
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-blue-600" />
            Video Trim
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Trim a video by specifying start and end times with custom encoding options
          </p>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="video-url" className="text-sm font-medium">
              Video URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="video-url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time" className="text-sm font-medium">
                Start Time <span className="text-muted-foreground">(hh:mm:ss or mm:ss)</span>
              </Label>
              <Input
                id="start-time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="00:30"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time" className="text-sm font-medium">
                End Time <span className="text-muted-foreground">(hh:mm:ss or mm:ss)</span>
              </Label>
              <Input
                id="end-time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="01:30"
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="video-codec" className="text-sm font-medium">
                Video Codec
              </Label>
              <select
                id="video-codec"
                value={videoCodec}
                onChange={(e) => setVideoCodec(e.target.value)}
                className="w-full h-10 px-3 border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
              >
                <option value="libx264">H.264 (libx264)</option>
                <option value="libx265">H.265 (libx265)</option>
                <option value="libvpx">VP8 (libvpx)</option>
                <option value="libvpx-vp9">VP9 (libvpx-vp9)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-preset" className="text-sm font-medium">
                Video Preset
              </Label>
              <select
                id="video-preset"
                value={videoPreset}
                onChange={(e) => setVideoPreset(e.target.value)}
                className="w-full h-10 px-3 border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
              >
                <option value="ultrafast">Ultrafast</option>
                <option value="superfast">Superfast</option>
                <option value="veryfast">Very Fast</option>
                <option value="faster">Faster</option>
                <option value="fast">Fast</option>
                <option value="medium">Medium</option>
                <option value="slow">Slow</option>
                <option value="slower">Slower</option>
                <option value="veryslow">Very Slow</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="video-crf" className="text-sm font-medium">
                CRF Quality <span className="text-muted-foreground">(0-51, lower is better)</span>
              </Label>
              <Input
                id="video-crf"
                type="number"
                min="0"
                max="51"
                value={videoCrf}
                onChange={(e) => setVideoCrf(Number(e.target.value))}
                placeholder="23"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audio-bitrate" className="text-sm font-medium">
                Audio Bitrate
              </Label>
              <Input
                id="audio-bitrate"
                value={audioBitrate}
                onChange={(e) => setAudioBitrate(e.target.value)}
                placeholder="128k"
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="audio-codec" className="text-sm font-medium">
                Audio Codec
              </Label>
              <select
                id="audio-codec"
                value={audioCodec}
                onChange={(e) => setAudioCodec(e.target.value)}
                className="w-full h-10 px-3 border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
              >
                <option value="aac">AAC</option>
                <option value="mp3">MP3</option>
                <option value="opus">Opus</option>
                <option value="flac">FLAC</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trim-custom-id" className="text-sm font-medium">
                Custom ID <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="trim-custom-id"
                value={videoTrimCustomId}
                onChange={(e) => setVideoTrimCustomId(e.target.value)}
                placeholder="my-trim-job"
                className="h-10"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="button"
              onClick={handleVideoTrimSubmit}
              disabled={isVideoTrimLoading}
              className="w-full sm:w-auto"
            >
              {isVideoTrimLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Trim Video"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
