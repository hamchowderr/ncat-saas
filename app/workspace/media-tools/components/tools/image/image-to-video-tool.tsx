"use client";

import { useState } from "react";
import { Video } from "lucide-react";
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

export function ImageToVideoTool() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFileId, setImageFileId] = useState<string | null>(null);
  const [videoLength, setVideoLength] = useState(5);
  const [frameRate, setFrameRate] = useState(30);
  const [zoomSpeed, setZoomSpeed] = useState(3);
  const [customId, setCustomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!imageUrl.trim()) {
      toast.error("Please provide an image URL");
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
        image_url: imageUrl.trim(),
        source_file_id: imageFileId || undefined,
        length: videoLength || 5,
        frame_rate: frameRate || 30,
        zoom_speed: zoomSpeed || 3,
        custom_id: customId.trim() || undefined
      };

      console.log("📤 Submitting Image to Video request:", payload);

      // Call Edge Function
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
      const response = await fetch(`${supabaseUrl}/functions/v1/image-convert-video`, {
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

      console.log("✅ Image to video conversion started:", result);

      toast.success("Image to video conversion started!", {
        description: `Job ID: ${result.job_id}. Check the Jobs page to track progress.`
      });

      setIsDialogOpen(false);
      setImageUrl("");
      setImageFileId(null);
      setVideoLength(5);
      setFrameRate(30);
      setZoomSpeed(3);
      setCustomId("");
    } catch (error) {
      console.error("❌ Image to video error:", error);
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
              <Video className="h-4 w-4 text-purple-600" />
              <CardTitle className="text-sm">Image to Video</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Transforms a static image into a video with custom duration and zoom effects
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Video className="h-5 w-5 text-purple-600" />
            Image to Video
          </DialogTitle>
          <p className="text-muted-foreground mt-1 text-sm">
            Transform a static image into a dynamic video with zoom effects
          </p>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image-url" className="text-sm font-medium">
              Image URL <span className="text-red-500">*</span>
            </Label>
            <UrlInputWithPicker
              id="image-url"
              value={imageUrl}
              onChange={setImageUrl}
              onFileIdChange={setImageFileId}
              accept={MEDIA_TYPES.IMAGE}
              placeholder="Select image or paste URL..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="video-length" className="text-sm font-medium">
                Video Length <span className="text-muted-foreground">(seconds)</span>
              </Label>
              <Input
                id="video-length"
                type="number"
                min="1"
                max="60"
                value={videoLength}
                onChange={(e) => setVideoLength(Number(e.target.value))}
                placeholder="5"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frame-rate" className="text-sm font-medium">
                Frame Rate <span className="text-muted-foreground">(fps)</span>
              </Label>
              <Input
                id="frame-rate"
                type="number"
                min="1"
                max="60"
                value={frameRate}
                onChange={(e) => setFrameRate(Number(e.target.value))}
                placeholder="30"
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zoom-speed" className="text-sm font-medium">
              Zoom Speed <span className="text-muted-foreground">(0-100)</span>
            </Label>
            <Input
              id="zoom-speed"
              type="number"
              min="0"
              max="100"
              value={zoomSpeed}
              onChange={(e) => setZoomSpeed(Number(e.target.value))}
              placeholder="3"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-custom-id" className="text-sm font-medium">
              Custom ID <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="image-custom-id"
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
                "Create Video"
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
