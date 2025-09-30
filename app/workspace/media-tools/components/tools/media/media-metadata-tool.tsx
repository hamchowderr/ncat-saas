"use client";

import { useState } from "react";
import { Edit3 } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function MediaMetadataTool() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [customId, setCustomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!mediaUrl.trim()) {
      alert("Please provide a media URL");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        media_url: mediaUrl.trim(),
        id: customId.trim() || undefined
      };

      console.log("Submitting Media Metadata:", payload);
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert("Metadata extraction request submitted successfully!");
      setIsDialogOpen(false);
      setMediaUrl("");
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
              <Edit3 className="h-4 w-4 text-orange-600" />
              <CardTitle className="text-sm">Media Metadata</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Extracts comprehensive metadata from media files including format, codecs, and duration
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-orange-600" />
            Media Metadata
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Extract detailed metadata from any media file
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
                "Extract Metadata"
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
