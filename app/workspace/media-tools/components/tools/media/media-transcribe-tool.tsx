"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function MediaTranscribeTool() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
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
      alert("Please provide a media URL");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        media_url: mediaUrl.trim(),
        task,
        include_text: includeText,
        include_srt: includeSrt,
        include_segments: includeSegments,
        word_timestamps: wordTimestamps,
        language: language.trim() || undefined,
        id: customId.trim() || undefined
      };

      console.log("Submitting Media Transcribe:", payload);
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert("Transcription request submitted successfully!");
      setIsDialogOpen(false);
      setMediaUrl("");
      setTask("transcribe");
      setIncludeText(true);
      setIncludeSrt(false);
      setIncludeSegments(false);
      setWordTimestamps(false);
      setLanguage("");
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
              <FileText className="h-4 w-4 text-orange-600" />
              <CardTitle className="text-sm">Media Transcribe</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Transcribes audio/video content to text with multiple output formats
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-600" />
            Media Transcribe
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Transcribe or translate audio/video to text
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
              placeholder="https://example.com/audio.mp3"
              className="h-10"
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
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
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
              <label htmlFor="include-text" className="text-sm cursor-pointer">
                Include full text
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-srt"
                checked={includeSrt}
                onCheckedChange={(checked) => setIncludeSrt(!!checked)}
              />
              <label htmlFor="include-srt" className="text-sm cursor-pointer">
                Include SRT subtitles
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-segments"
                checked={includeSegments}
                onCheckedChange={(checked) => setIncludeSegments(!!checked)}
              />
              <label htmlFor="include-segments" className="text-sm cursor-pointer">
                Include time segments
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="word-timestamps"
                checked={wordTimestamps}
                onCheckedChange={(checked) => setWordTimestamps(!!checked)}
              />
              <label htmlFor="word-timestamps" className="text-sm cursor-pointer">
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
