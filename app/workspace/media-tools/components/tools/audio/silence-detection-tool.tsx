"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

export function SilenceDetectionTool() {
  // Media Silence state
  const [isSilenceDialogOpen, setIsSilenceDialogOpen] = useState(false);
  const [silenceMediaUrl, setSilenceMediaUrl] = useState("");
  const [silenceStart, setSilenceStart] = useState("");
  const [silenceEnd, setSilenceEnd] = useState("");
  const [silenceNoise, setSilenceNoise] = useState("-30");
  const [silenceDuration, setSilenceDuration] = useState("1.0");
  const [silenceMono, setSilenceMono] = useState(true);
  const [silenceCustomId, setSilenceCustomId] = useState("");
  const [isSilenceLoading, setIsSilenceLoading] = useState(false);

  const handleSilenceDetection = async () => {
    if (!silenceMediaUrl.trim() || !silenceDuration || !silenceCustomId.trim()) {
      return;
    }

    setIsSilenceLoading(true);

    try {
      // Prepare the request payload
      const payload = {
        media_url: silenceMediaUrl.trim(),
        start: silenceStart.trim() || undefined,
        end: silenceEnd.trim() || undefined,
        noise: parseFloat(silenceNoise) || -30,
        duration: parseFloat(silenceDuration) || 1.0,
        mono: silenceMono,
        id: silenceCustomId.trim()
      };

      // Log the payload for debugging
      console.log("Sending silence detection request:", payload);

      // Simulate API call (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show success message
      alert("Silence detection request sent successfully!");

      // Reset form
      setSilenceMediaUrl("");
      setSilenceStart("");
      setSilenceEnd("");
      setSilenceNoise("-30");
      setSilenceDuration("1.0");
      setSilenceMono(true);
      setSilenceCustomId("");

      // Close the dialog
      setIsSilenceDialogOpen(false);
    } catch (error) {
      console.error("Error detecting silence:", error);
      alert("Failed to detect silence. Please try again.");
    } finally {
      setIsSilenceLoading(false);
    }
  };

  return (
    <Dialog open={isSilenceDialogOpen} onOpenChange={setIsSilenceDialogOpen}>
      <DialogTrigger asChild>
        <Card className="transition-shadow hover:shadow-md cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-600" />
              <CardTitle className="text-sm">Media Silence</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Detects silence intervals in a given media file
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" /> Media Silence Detection
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Detect silent intervals in your media files
          </p>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="silence-media-url" className="text-sm font-medium">
              Media URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="silence-media-url"
              value={silenceMediaUrl}
              onChange={(e) => setSilenceMediaUrl(e.target.value)}
              placeholder="https://example.com/media.mp4"
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="silence-start" className="text-sm font-medium">
                Start Time (HH:MM:SS.ms)
              </Label>
              <Input
                id="silence-start"
                value={silenceStart}
                onChange={(e) => setSilenceStart(e.target.value)}
                placeholder="00:00:00.000"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Optional - Start time for detection
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="silence-end" className="text-sm font-medium">
                End Time (HH:MM:SS.ms)
              </Label>
              <Input
                id="silence-end"
                value={silenceEnd}
                onChange={(e) => setSilenceEnd(e.target.value)}
                placeholder="00:01:30.000"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Optional - End time for detection
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="silence-noise" className="text-sm font-medium">
                Noise Threshold (dB)
              </Label>
              <Input
                id="silence-noise"
                type="number"
                value={silenceNoise}
                onChange={(e) => setSilenceNoise(e.target.value)}
                placeholder="-30"
                className="h-10"
                min="-100"
                max="0"
                step="0.1"
              />
              <p className="text-xs text-muted-foreground">
                Lower values make the detection more sensitive (default: -30)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="silence-duration" className="text-sm font-medium">
                Minimum Duration (seconds) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="silence-duration"
                type="number"
                value={silenceDuration}
                onChange={(e) => setSilenceDuration(e.target.value)}
                placeholder="1.0"
                className="h-10"
                min="0.1"
                step="0.1"
              />
              <p className="text-xs text-muted-foreground">
                Minimum duration of silence to detect
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="silence-mono"
                checked={silenceMono}
                onCheckedChange={(checked) => setSilenceMono(checked as boolean)}
              />
              <Label htmlFor="silence-mono" className="text-sm font-medium">
                Process as mono audio
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="silence-custom-id" className="text-sm font-medium">
                Request ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="silence-custom-id"
                value={silenceCustomId}
                onChange={(e) => setSilenceCustomId(e.target.value)}
                placeholder="my-silence-detection-1"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier for this request
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsSilenceDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSilenceDetection}
            disabled={
              isSilenceLoading ||
              !silenceMediaUrl.trim() ||
              !silenceDuration ||
              !silenceCustomId.trim()
            }
          >
            {isSilenceLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Detecting...
              </>
            ) : (
              "Detect Silence"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
