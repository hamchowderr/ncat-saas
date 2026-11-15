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
import { UrlInputWithPicker } from "../../url-input-with-picker";
import { MEDIA_TYPES } from "@/lib/media-types";
import { toast } from "sonner";

export function SilenceDetectionTool() {
  // Media Silence state
  const [isSilenceDialogOpen, setIsSilenceDialogOpen] = useState(false);
  const [silenceMediaUrl, setSilenceMediaUrl] = useState("");
  const [silenceMediaFileId, setSilenceMediaFileId] = useState<string | null>(null); // NEW: Track file ID
  const [silenceStart, setSilenceStart] = useState("");
  const [silenceEnd, setSilenceEnd] = useState("");
  const [silenceNoise, setSilenceNoise] = useState("-30");
  const [silenceDuration, setSilenceDuration] = useState("1.0");
  const [silenceMono, setSilenceMono] = useState(true);
  const [silenceCustomId, setSilenceCustomId] = useState("");
  const [isSilenceLoading, setIsSilenceLoading] = useState(false);

  const handleSilenceDetection = async () => {
    if (!silenceMediaUrl.trim()) {
      toast.error("Please provide a media URL");
      return;
    }
    if (!silenceDuration) {
      toast.error("Please provide a minimum duration");
      return;
    }

    setIsSilenceLoading(true);

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
        setIsSilenceLoading(false);
        return;
      }

      const payload = {
        media_url: silenceMediaUrl.trim(),
        source_file_id: silenceMediaFileId || undefined, // NEW: Send file ID if available
        start: silenceStart.trim() || undefined,
        end: silenceEnd.trim() || undefined,
        noise: parseFloat(silenceNoise) || undefined, // Send as number, Edge Function will format with "dB"
        duration: parseFloat(silenceDuration) || 1.0,
        mono: silenceMono,
        custom_id: silenceCustomId.trim() || undefined
      };

      console.log("📤 Submitting Silence Detection request:", payload);

      // Call Edge Function
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
      const response = await fetch(`${supabaseUrl}/functions/v1/media-silence`, {
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

      console.log("✅ Silence detection started:", result);

      toast.success("Silence detection started!", {
        description: `Job ID: ${result.job_id}. Check the Jobs page to track progress.`
      });

      // Reset form
      setSilenceMediaUrl("");
      setSilenceMediaFileId(null); // NEW: Reset file ID
      setSilenceStart("");
      setSilenceEnd("");
      setSilenceNoise("-30");
      setSilenceDuration("1.0");
      setSilenceMono(true);
      setSilenceCustomId("");

      // Close the dialog
      setIsSilenceDialogOpen(false);
    } catch (error) {
      console.error("❌ Silence detection error:", error);
      toast.error("Failed to submit request", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsSilenceLoading(false);
    }
  };

  return (
    <Dialog open={isSilenceDialogOpen} onOpenChange={setIsSilenceDialogOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
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
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Zap className="h-5 w-5 text-orange-600" /> Media Silence Detection
          </DialogTitle>
          <p className="text-muted-foreground mt-1 text-sm">
            Detect silent intervals in your media files
          </p>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="silence-media-url" className="text-sm font-medium">
              Media URL <span className="text-red-500">*</span>
            </Label>
            <UrlInputWithPicker
              id="silence-media-url"
              value={silenceMediaUrl}
              onChange={setSilenceMediaUrl}
              onFileIdChange={setSilenceMediaFileId}
              accept={MEDIA_TYPES.VIDEO_AUDIO}
              placeholder="Select media file or paste URL..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <p className="text-muted-foreground text-xs">Optional - Start time for detection</p>
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
              <p className="text-muted-foreground text-xs">Optional - End time for detection</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <p className="text-muted-foreground text-xs">
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
              <p className="text-muted-foreground text-xs">Minimum duration of silence to detect</p>
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
              <p className="text-muted-foreground text-xs">Unique identifier for this request</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsSilenceDialogOpen(false)}>
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
                  className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
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
