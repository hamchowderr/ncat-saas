"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { UrlInputWithPicker } from "../../url-input-with-picker";
import { MEDIA_TYPES } from "@/lib/media-types";
import { toast } from "sonner";

export function VideoThumbnailTool() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFileId, setVideoFileId] = useState<string | null>(null);
  const [second, setSecond] = useState(0);
  const [customId, setCustomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

      // Use local Supabase URL for Edge Function
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";

      const payload = {
        video_url: videoUrl.trim(),
        source_file_id: videoFileId || undefined,
        second: second,
        custom_id: customId.trim() || undefined
        // webhook_url is handled by the Edge Function, not passed from frontend
      };

      console.log("📤 Submitting Video Thumbnail request:", payload);

      // Call Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/video-thumbnail`, {
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

      console.log("✅ Thumbnail extraction started:", result);

      toast.success("Thumbnail extraction started!", {
        description: `Job ID: ${result.job_id}. Check the Jobs page to track progress.`
      });

      setIsDialogOpen(false);
      setVideoUrl("");
      setVideoFileId(null);
      setSecond(0);
      setCustomId("");
    } catch (error) {
      console.error("❌ Video thumbnail error:", error);
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
              <Camera className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm">Video Thumbnail</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Extracts a thumbnail image from a specific timestamp in a video
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Camera className="h-5 w-5 text-blue-600" />
            Video Thumbnail
          </DialogTitle>
          <DialogDescription>
            Extract a thumbnail image from any point in your video
          </DialogDescription>
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

          <div className="space-y-2">
            <Label htmlFor="second" className="text-sm font-medium">
              Timestamp (seconds)
            </Label>
            <Input
              id="second"
              type="number"
              min="0"
              value={second}
              onChange={(e) => setSecond(Number(e.target.value))}
              placeholder="0"
              className="h-10"
            />
            <p className="text-muted-foreground text-xs">
              The point in the video to extract the thumbnail from (0 = start)
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
                  Extracting...
                </>
              ) : (
                "Extract Thumbnail"
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
