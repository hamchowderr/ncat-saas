"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function MediaConvertTool() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [format, setFormat] = useState("");
  const [videoCodec, setVideoCodec] = useState("libx264");
  const [videoPreset, setVideoPreset] = useState("medium");
  const [videoCrf, setVideoCrf] = useState(23);
  const [audioCodec, setAudioCodec] = useState("aac");
  const [audioBitrate, setAudioBitrate] = useState("128k");
  const [customId, setCustomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!mediaUrl.trim() || !format.trim()) {
      alert("Please provide a media URL and output format");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        media_url: mediaUrl.trim(),
        format: format.trim(),
        video_codec: videoCodec,
        video_preset: videoPreset,
        video_crf: videoCrf,
        audio_codec: audioCodec,
        audio_bitrate: audioBitrate,
        id: customId.trim() || undefined
      };

      console.log("Submitting Media Convert:", payload);
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert("Media conversion request submitted successfully!");
      setIsDialogOpen(false);
      setMediaUrl("");
      setFormat("");
      setVideoCodec("libx264");
      setVideoPreset("medium");
      setVideoCrf(23);
      setAudioCodec("aac");
      setAudioBitrate("128k");
      setCustomId("");
    } catch (error) {
      alert("Error submitting request: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Card className="transition-shadow hover:shadow-md cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-orange-600" />
              <CardTitle className="text-sm">Media Convert</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Converts media files between different formats
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-orange-600" />
            Media Convert
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Convert media files to different formats with custom encoding settings
          </p>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="media-url" className="text-sm font-medium">
              Media URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="media-url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="format" className="text-sm font-medium">
              Output Format <span className="text-red-500">*</span>
            </Label>
            <Input
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              placeholder="mp4, avi, mkv, webm, etc."
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="video-codec" className="text-sm font-medium">
                Video Codec
              </Label>
              <Input
                id="video-codec"
                value={videoCodec}
                onChange={(e) => setVideoCodec(e.target.value)}
                placeholder="libx264"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-preset" className="text-sm font-medium">
                Video Preset
              </Label>
              <Input
                id="video-preset"
                value={videoPreset}
                onChange={(e) => setVideoPreset(e.target.value)}
                placeholder="medium"
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-crf" className="text-sm font-medium">
              CRF Quality (0-51)
            </Label>
            <Input
              id="video-crf"
              type="number"
              min="0"
              max="51"
              value={videoCrf}
              onChange={(e) => setVideoCrf(Number(e.target.value))}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">Lower = better quality (23 is default)</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="audio-codec" className="text-sm font-medium">
                Audio Codec
              </Label>
              <Input
                id="audio-codec"
                value={audioCodec}
                onChange={(e) => setAudioCodec(e.target.value)}
                placeholder="aac"
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

          <div className="space-y-2">
            <Label htmlFor="custom-id" className="text-sm font-medium">
              Custom ID <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="custom-id"
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
              placeholder="Enter a custom identifier for tracking"
              className="h-10"
            />
          </div>

          <div className="flex gap-3 pt-2 border-t">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 h-11"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                "Convert Media"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="h-11 px-6"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
