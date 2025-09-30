"use client";

import { useState } from "react";
import { Video } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ImageToVideoTool() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [videoLength, setVideoLength] = useState(5);
  const [frameRate, setFrameRate] = useState(30);
  const [zoomSpeed, setZoomSpeed] = useState(3);
  const [customId, setCustomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (!imageUrl.trim()) {
        alert("Please provide an image URL");
        return;
      }

      const payload = {
        image_url: imageUrl.trim(),
        length: videoLength || 5,
        frame_rate: frameRate || 30,
        zoom_speed: zoomSpeed || 3,
        id: customId.trim() || undefined
      };

      console.log("Submitting Image to Video:", payload);
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert("Image to Video request submitted successfully!");
      setIsDialogOpen(false);
      setImageUrl("");
      setVideoLength(5);
      setFrameRate(30);
      setZoomSpeed(3);
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
              <Video className="h-4 w-4 text-purple-600" />
              <CardTitle className="text-sm">Image to Video</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Transforms a static image into a video with custom duration and zoom effects
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Video className="h-5 w-5 text-purple-600" />
            Image to Video
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Transform a static image into a dynamic video with zoom effects
          </p>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image-url" className="text-sm font-medium">
              Image URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="image-url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="h-10"
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
