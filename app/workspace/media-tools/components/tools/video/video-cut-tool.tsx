"use client";

import { useState } from "react";
import { Scissors } from "lucide-react";
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
import { TimeRangesArray } from "../../shared/time/time-ranges-array";
import type { TimeRange } from "../../shared/time/types";

export function VideoCutTool() {
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Video input
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFileId, setVideoFileId] = useState<string | null>(null);

  // Cut segments (managed by shared component)
  const [cuts, setCuts] = useState<TimeRange[]>([{ start: "", end: "" }]);

  // Encoding settings (managed by shared component)
  const [videoCodec, setVideoCodec] = useState("libx264");
  const [videoPreset, setVideoPreset] = useState("medium");
  const [videoCrf, setVideoCrf] = useState(23);
  const [audioCodec, setAudioCodec] = useState("aac");
  const [audioBitrate, setAudioBitrate] = useState("128k");

  // Custom ID
  const [customId, setCustomId] = useState("");

  const handleSubmit = async () => {
    if (!videoUrl.trim()) {
      toast.error("Please provide a video URL");
      return;
    }

    const validCuts = cuts.filter((c) => c.start.trim() && c.end.trim());
    if (validCuts.length === 0) {
      toast.error("Please add at least one cut with start and end times");
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
        cuts: validCuts,
        video_codec: videoCodec,
        video_preset: videoPreset,
        video_crf: videoCrf,
        audio_codec: audioCodec,
        audio_bitrate: audioBitrate,
        webhook_url: internalWebhookUrl,
        id: customId.trim() || undefined
      };

      console.log("📤 Submitting Video Cut request:", payload);

      // Call Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/video-cut`, {
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

      console.log("✅ Video cut started:", result);

      toast.success("Video cut started!", {
        description: `Job ID: ${result.job_id}. Check the Jobs page to track progress.`
      });

      setIsDialogOpen(false);
      setVideoUrl("");
      setVideoFileId(null);
      setCuts([{ start: "", end: "" }]);
      setVideoCodec("libx264");
      setVideoPreset("medium");
      setVideoCrf(23);
      setAudioCodec("aac");
      setAudioBitrate("128k");
      setCustomId("");
    } catch (error) {
      console.error("❌ Video cut error:", error);
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
              <Scissors className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm">Video Cut</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Removes specified segments from a video to create a trimmed version
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Scissors className="h-5 w-5 text-blue-600" />
            Video Cut
          </DialogTitle>
          <p className="text-muted-foreground mt-1 text-sm">
            Remove unwanted segments from your video
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

          <TimeRangesArray
            ranges={cuts}
            onRangesChange={setCuts}
            itemLabel="Cut Segment"
            minRanges={1}
            disabled={isLoading}
          />

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
              placeholder="Enter a custom identifier for tracking"
              className="h-10"
            />
          </div>

          <div className="flex gap-3 border-t pt-2">
            <Button onClick={handleSubmit} disabled={isLoading} className="h-11 flex-1">
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                "Cut Video"
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
