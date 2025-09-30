"use client";

import { useState } from "react";
import { Zap, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function AudioConcatenateTool() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [audioUrls, setAudioUrls] = useState<string[]>([""]);
  const [customId, setCustomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addAudioUrl = () => {
    setAudioUrls([...audioUrls, ""]);
  };

  const removeAudioUrl = (index: number) => {
    if (audioUrls.length > 1) {
      setAudioUrls(audioUrls.filter((_, i) => i !== index));
    }
  };

  const updateAudioUrl = (index: number, value: string) => {
    const updated = [...audioUrls];
    updated[index] = value;
    setAudioUrls(updated);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const validUrls = audioUrls.filter(url => url.trim() !== "");
      if (validUrls.length === 0) {
        alert("Please add at least one audio URL");
        return;
      }

      const payload = {
        audio_urls: validUrls.map(url => ({ audio_url: url })),
        id: customId.trim() || undefined
      };

      console.log("Submitting:", payload);
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert("Audio concatenation request submitted successfully!");
      setIsDialogOpen(false);
      setAudioUrls([""]);
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
              <Zap className="h-4 w-4 text-green-600" />
              <CardTitle className="text-sm">Audio Concatenate</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Combines multiple audio files into a single audio file
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-600" />
            Audio Concatenate
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Combine multiple audio files into a single continuous audio file
          </p>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="custom-id" className="text-sm font-medium">
              Custom ID <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="custom-id"
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
              placeholder="Enter a custom identifier for tracking this request"
              className="h-10"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Audio URLs</Label>
            <div className="space-y-3">
              {audioUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => updateAudioUrl(index, e.target.value)}
                    placeholder={`https://example.com/audio${index + 1}.mp3`}
                    className="h-10"
                  />
                  {audioUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeAudioUrl(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addAudioUrl}
                className="w-full h-10 border-dashed flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Audio URL
              </Button>
            </div>
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
                "Submit Request"
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
