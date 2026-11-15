"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
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
import { MEDIA_TYPES } from "@/lib/media-types";
import { toast } from "sonner";
import { UrlArrayInput } from "../../shared/common/url-array-input";
import type { UrlItem } from "../../shared/common/types";

export function AudioConcatenateTool() {
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Audio URLs (managed by shared component)
  const [audioUrls, setAudioUrls] = useState<UrlItem[]>([{ url: "" }]);

  // Custom ID
  const [customId, setCustomId] = useState("");

  const handleSubmit = async () => {
    const validUrls = audioUrls.filter((item) => item.url.trim() !== "");
    if (validUrls.length < 2) {
      toast.error("Please add at least two audio URLs");
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

      // Construct internal webhook URL for NCAT API callbacks
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
      const internalWebhookUrl = `${supabaseUrl}/functions/v1/ncat-webhook`;

      const payload = {
        audio_urls: audioUrls
          .filter((item) => item.url.trim() !== "")
          .map((item) => ({
            audio_url: item.url.trim()
          })),
        webhook_url: internalWebhookUrl,
        id: customId.trim() || undefined
      };

      console.log("📤 Submitting Audio Concatenate request:", payload);

      // Call Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/audio-concatenate`, {
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

      console.log("✅ Audio concatenation started:", result);

      toast.success("Audio concatenation started!", {
        description: `Job ID: ${result.job_id}. Check the Jobs page to track progress.`
      });

      setIsDialogOpen(false);
      setAudioUrls([{ url: "" }]);
      setCustomId("");
    } catch (error) {
      console.error("❌ Audio concatenate error:", error);
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
              <Zap className="h-4 w-4 text-green-600" />
              <CardTitle className="text-sm">Audio Concatenate</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Combines multiple audio files into a single audio file
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Zap className="h-5 w-5 text-green-600" />
            Audio Concatenate
          </DialogTitle>
          <p className="text-muted-foreground mt-1 text-sm">
            Combine multiple audio files into a single continuous audio file
          </p>
        </DialogHeader>
        <div className="space-y-6">
          <UrlArrayInput
            urls={audioUrls}
            onUrlsChange={setAudioUrls}
            label="Audio Files to Concatenate"
            itemLabel="Audio"
            placeholder="Select audio or paste URL..."
            acceptedTypes={MEDIA_TYPES.AUDIO}
            minUrls={2}
            disabled={isLoading}
          />

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
              disabled={isLoading}
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
