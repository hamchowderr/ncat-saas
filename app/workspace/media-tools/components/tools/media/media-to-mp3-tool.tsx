"use client";

import { useState } from "react";
import { Music } from "lucide-react";
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

export function MediaToMp3Tool() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaFileId, setMediaFileId] = useState<string | null>(null);
  const [bitrate, setBitrate] = useState("128k");
  const [customId, setCustomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!mediaUrl.trim()) {
      toast.error("Please provide a media URL");
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

      const payload = {
        source_file_id: mediaFileId || undefined,
        media_url: mediaUrl.trim(),
        bitrate: bitrate.trim(),
        custom_id: customId.trim() || undefined
      };

      console.log("📤 Submitting Media to MP3 request:", payload);

      // Call Edge Function
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
      const response = await fetch(`${supabaseUrl}/functions/v1/media-convert-mp3`, {
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

      console.log("✅ MP3 conversion started:", result);

      toast.success("MP3 conversion started!", {
        description: `Job ID: ${result.job_id}. Check the Jobs page to track progress.`
      });

      setIsDialogOpen(false);
      setMediaUrl("");
      setMediaFileId(null);
      setBitrate("128k");
      setCustomId("");
    } catch (error) {
      console.error("❌ Media to MP3 error:", error);
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
              <Music className="h-4 w-4 text-orange-600" />
              <CardTitle className="text-sm">Convert to MP3</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Converts any media file to MP3 audio format
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Music className="h-5 w-5 text-orange-600" />
            Convert to MP3
          </DialogTitle>
          <p className="text-muted-foreground mt-1 text-sm">
            Convert any video or audio file to MP3 format
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
              accept={MEDIA_TYPES.VIDEO_AUDIO_NON_MP3}
              placeholder="Select media file or paste URL..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bitrate" className="text-sm font-medium">
              Bitrate
            </Label>
            <Input
              id="bitrate"
              value={bitrate}
              onChange={(e) => setBitrate(e.target.value)}
              placeholder="128k, 192k, 256k, 320k"
              className="h-10"
            />
            <p className="text-muted-foreground text-xs">
              Higher bitrate = better quality (128k is standard)
            </p>
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

          <div className="flex gap-3 border-t pt-2">
            <Button onClick={handleSubmit} disabled={isLoading} className="h-11 flex-1">
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Converting...
                </>
              ) : (
                "Convert to MP3"
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
