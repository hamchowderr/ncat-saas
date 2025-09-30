"use client";

import { useState } from "react";
import { Video, Plus, Trash2 } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function VideoConcatenateTool() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [videoUrls, setVideoUrls] = useState([""]);
  const [customId, setCustomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addVideoUrl = () => {
    setVideoUrls([...videoUrls, ""]);
  };

  const removeVideoUrl = (index: number) => {
    if (videoUrls.length > 1) {
      setVideoUrls(videoUrls.filter((_, i) => i !== index));
    }
  };

  const updateVideoUrl = (index: number, value: string) => {
    const updated = [...videoUrls];
    updated[index] = value;
    setVideoUrls(updated);
  };

  const handleSubmit = async () => {
    const validUrls = videoUrls.filter(url => url.trim() !== "");
    if (validUrls.length < 2) {
      alert("Please add at least two video URLs");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        video_urls: validUrls.map(url => ({ video_url: url.trim() })),
        id: customId.trim() || undefined
      };

      console.log("Submitting Video Concatenate:", payload);
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert("Video concatenation request submitted successfully!");
      setIsDialogOpen(false);
      setVideoUrls([""]);
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
              <Video className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm">Video Concatenate</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Combines multiple video files into a single continuous video
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Video className="h-5 w-5 text-blue-600" />
            Video Concatenate
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Combine multiple videos into one continuous file
          </p>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Video URLs</Label>
            <div className="space-y-3">
              {videoUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => updateVideoUrl(index, e.target.value)}
                    placeholder={`https://example.com/video${index + 1}.mp4`}
                    className="h-10"
                  />
                  {videoUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeVideoUrl(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addVideoUrl}
                className="w-full h-10 border-dashed flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Video URL
              </Button>
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
                "Concatenate Videos"
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
