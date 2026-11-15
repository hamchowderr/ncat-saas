"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

export function MediaTranscribeTool() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaFileId, setMediaFileId] = useState<string | null>(null);
  const [task, setTask] = useState("transcribe");
  const [includeText, setIncludeText] = useState(true);
  const [includeSrt, setIncludeSrt] = useState(false);
  const [includeSegments, setIncludeSegments] = useState(false);
  const [wordTimestamps, setWordTimestamps] = useState(false);
  const [language, setLanguage] = useState("");
  const [customId, setCustomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!mediaUrl.trim()) {
      toast.error("Please provide a media URL");
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
        media_url: mediaUrl.trim(),
        source_file_id: mediaFileId || undefined,
        task,
        include_text: includeText,
        include_srt: includeSrt,
        include_segments: includeSegments,
        word_timestamps: wordTimestamps,
        language: language.trim() || undefined,
        custom_id: customId.trim() || undefined
      };

      console.log("📤 Submitting Media Transcribe request:", payload);

      // Call Edge Function
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
      const response = await fetch(`${supabaseUrl}/functions/v1/media-transcribe`, {
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

      console.log("✅ Transcription started:", result);

      toast.success("Transcription started!", {
        description: `Job ID: ${result.job_id}. Check the Jobs page to track progress.`
      });

      setIsDialogOpen(false);
      setMediaUrl("");
      setMediaFileId(null);
      setTask("transcribe");
      setIncludeText(true);
      setIncludeSrt(false);
      setIncludeSegments(false);
      setWordTimestamps(false);
      setLanguage("");
      setCustomId("");
    } catch (error) {
      console.error("❌ Media transcribe error:", error);
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
              <FileText className="h-4 w-4 text-orange-600" />
              <CardTitle className="text-sm">Media Transcribe</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Transcribes audio/video content to text with multiple output formats
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <FileText className="h-5 w-5 text-orange-600" />
            Media Transcribe
          </DialogTitle>
          <p className="text-muted-foreground mt-1 text-sm">
            Transcribe or translate audio/video to text
          </p>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="media-url" className="text-sm font-medium">
              Media URL <span className="text-red-500">*</span>
            </Label>
            <UrlInputWithPicker
              id="media-url"
              value={mediaUrl}
              onChange={setMediaUrl}
              onFileIdChange={setMediaFileId}
              accept={MEDIA_TYPES.VIDEO_AUDIO}
              placeholder="Select media file or paste URL..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task" className="text-sm font-medium">
              Task
            </Label>
            <select
              id="task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="border-input bg-background h-10 w-full rounded-md border px-3"
            >
              <option value="transcribe">Transcribe</option>
              <option value="translate">Translate to English</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="text-sm font-medium">
              Language <span className="text-muted-foreground">(Optional, auto-detect)</span>
            </Label>
            <Input
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="en, es, fr, de, etc."
              className="h-10"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Output Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-text"
                checked={includeText}
                onCheckedChange={(checked) => setIncludeText(!!checked)}
              />
              <label htmlFor="include-text" className="cursor-pointer text-sm">
                Include full text
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-srt"
                checked={includeSrt}
                onCheckedChange={(checked) => setIncludeSrt(!!checked)}
              />
              <label htmlFor="include-srt" className="cursor-pointer text-sm">
                Include SRT subtitles
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-segments"
                checked={includeSegments}
                onCheckedChange={(checked) => setIncludeSegments(!!checked)}
              />
              <label htmlFor="include-segments" className="cursor-pointer text-sm">
                Include timestamp data
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="word-timestamps"
                checked={wordTimestamps}
                onCheckedChange={(checked) => setWordTimestamps(!!checked)}
              />
              <label htmlFor="word-timestamps" className="cursor-pointer text-sm">
                Include word-level timestamps
              </label>
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

          <div className="flex gap-3 border-t pt-2">
            <Button onClick={handleSubmit} disabled={isLoading} className="h-11 flex-1">
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                "Transcribe"
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
