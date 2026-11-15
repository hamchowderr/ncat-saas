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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { UrlInputWithPicker } from "../../url-input-with-picker";
import { MEDIA_TYPES } from "@/lib/media-types";
import { toast } from "sonner";
import { EncodingSettingsSection } from "../../shared/encoding/encoding-settings-section";

export function MediaConvertTool() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaFileId, setMediaFileId] = useState<string | null>(null);
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
      toast.error("Please provide a media URL and output format");
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
        media_url: mediaUrl.trim(),
        source_file_id: mediaFileId || undefined,
        format: format.trim(),
        video_codec: videoCodec,
        video_preset: videoPreset,
        video_crf: videoCrf,
        audio_codec: audioCodec,
        audio_bitrate: audioBitrate,
        webhook_url: internalWebhookUrl,
        id: customId.trim() || undefined
      };

      console.log("📤 Submitting Media Convert request:", payload);

      // Call Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/media-convert`, {
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

      console.log("✅ Media conversion started:", result);

      toast.success("Media conversion started!", {
        description: `Job ID: ${result.job_id}. Check the Jobs page to track progress.`
      });

      setIsDialogOpen(false);
      setMediaUrl("");
      setMediaFileId(null);
      setFormat("");
      setVideoCodec("libx264");
      setVideoPreset("medium");
      setVideoCrf(23);
      setAudioCodec("aac");
      setAudioBitrate("128k");
      setCustomId("");
    } catch (error) {
      console.error("❌ Media convert error:", error);
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
              <Wand2 className="h-4 w-4 text-orange-600" />
              <CardTitle className="text-sm">Media Convert</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Converts media files between different formats
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Wand2 className="h-5 w-5 text-orange-600" />
            Media Convert
          </DialogTitle>
          <p className="text-muted-foreground mt-1 text-sm">
            Convert media files to different formats with custom encoding settings
          </p>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="media-url" className="text-sm font-medium">
              Media URL <span className="text-red-500">*</span>
            </Label>
            <UrlInputWithPicker
              id="media-url"
              value={mediaUrl}
              onChange={setMediaUrl}
              onFileIdChange={setMediaFileId}
              accept={MEDIA_TYPES.ALL_MEDIA}
              placeholder="Select media file or paste URL..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="format" className="text-sm font-medium">
              Output Format <span className="text-red-500">*</span>
            </Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select output format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                <SelectItem value="avi">AVI</SelectItem>
                <SelectItem value="mkv">MKV (Matroska)</SelectItem>
                <SelectItem value="webm">WebM</SelectItem>
                <SelectItem value="mov">MOV (QuickTime)</SelectItem>
                <SelectItem value="flv">FLV (Flash Video)</SelectItem>
                <SelectItem value="wmv">WMV (Windows Media)</SelectItem>
                <SelectItem value="m4v">M4V</SelectItem>
                <SelectItem value="3gp">3GP</SelectItem>
              </SelectContent>
            </Select>
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
