"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function VideoThumbnailTool() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [second, setSecond] = useState(0);
  const [customId, setCustomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!videoUrl.trim()) {
      alert("Please provide a video URL");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        video_url: videoUrl.trim(),
        second: second,
        id: customId.trim() || undefined
      };

      console.log("Submitting Video Thumbnail:", payload);
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert("Thumbnail extraction request submitted successfully!");
      setIsDialogOpen(false);
      setVideoUrl("");
      setSecond(0);
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
              <Camera className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm">Video Thumbnail</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Extracts a thumbnail image from a specific timestamp in a video
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />
            Video Thumbnail
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Extract a thumbnail image from any point in your video
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
            <p className="text-xs text-muted-foreground">
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

          <div className="flex gap-3 pt-2 border-t">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 h-11"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
