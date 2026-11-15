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
import { UrlInputWithPicker } from "../../url-input-with-picker";
import { MEDIA_TYPES } from "@/lib/media-types";
import { toast } from "sonner";
import { EncodingSettingsSection } from "../../shared/encoding/encoding-settings-section";

export function VideoTrimTool() {
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Video input
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFileId, setVideoFileId] = useState<string | null>(null);

  // Time range
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Encoding settings (managed by shared component)
  const [videoCodec, setVideoCodec] = useState("libx264");
  const [videoPreset, setVideoPreset] = useState("medium");
  const [videoCrf, setVideoCrf] = useState(23);
  const [audioCodec, setAudioCodec] = useState("aac");
  const [audioBitrate, setAudioBitrate] = useState("128k");

  // Custom ID only (webhook URL is always internal ncat-webhook)
  const [customId, setCustomId] = useState("");

  // Handler function
  const handleSubmit = async () => {
    if (!videoUrl.trim()) {
      toast.error("Please provide a video URL");
      return;
    }

    setIsLoading(true);
    try {
      // Get Supabase session for authentication
      const { createClient } = await import("@/lib/client");
      const supabase = createClient();
      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        toast.error("Authentication error - please refresh and try again");
        setIsLoading(false);
        return;
      }

      // Construct internal webhook URL for NCAT API callbacks
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
      const internalWebhookUrl = `${supabaseUrl}/functions/v1/ncat-webhook`;

      const payload = {
        video_url: videoUrl.trim(),
        source_file_id: videoFileId || undefined,
        start: startTime.trim() || undefined,
        end: endTime.trim() || undefined,
        video_codec: videoCodec,
        video_preset: videoPreset,
        video_crf: videoCrf,
        audio_codec: audioCodec,
        audio_bitrate: audioBitrate,
        webhook_url: internalWebhookUrl,
        id: customId.trim() || undefined
      };

      console.log("📤 Submitting Video Trim request:", payload);

      // Call Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/video-trim`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || "Request failed");
      }

      console.log("✅ Video trim started:", result);

      toast.success("Video trim started!", {
        description: `Job ID: ${result.job_id}. Check the Jobs page to track progress.`
      });

      setIsDialogOpen(false);
      setVideoUrl("");
      setVideoFileId(null);
      setStartTime("");
      setEndTime("");
      setVideoCodec("libx264");
      setVideoPreset("medium");
      setVideoCrf(23);
      setAudioCodec("aac");
      setAudioBitrate("128k");
      setCustomId("");
    } catch (error) {
      console.error("❌ Video trim error:", error);
      toast.error("Failed to submit request", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
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
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Wand2 className="h-5 w-5 text-blue-600" />
            Video Trim
          </DialogTitle>
          <p className="text-muted-foreground mt-1 text-sm">
            Trim a video by specifying start and end times with custom encoding options
          </p>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="video-url" className="text-sm font-medium">
              Video URL <span className="text-red-500">*</span>
            </Label>
            <UrlInputWithPicker
              id="video-url"
              value={videoUrl}
              onChange={setVideoUrl}
              onFileIdChange={setVideoFileId}
              accept={MEDIA_TYPES.VIDEO}
              placeholder="Select video or paste URL..."
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

          <EncodingSettingsSection
            videoCodec={videoCodec}
            onVideoCodecChange={setVideoCodec}
            videoPreset={videoPreset}
            onVideoPresetChange={setVideoPreset}
            videoCrf={videoCrf}
            onVideoCrfChange={setVideoCrf}
            audioCodec={audioCodec}
            onAudioCodecChange={setAudioCodec}
            audioBitrate={audioBitrate}
            onAudioBitrateChange={setAudioBitrate}
            disabled={isLoading}
          />

          <div className="space-y-2">
            <Label htmlFor="custom-id" className="text-sm font-medium">
              Custom ID <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="custom-id"
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
              placeholder="my-trim-job"
              className="h-10"
              disabled={isLoading}
            />
            <p className="text-muted-foreground text-xs">
              Custom identifier for tracking this request
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <svg
                    className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
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
