"use client";

import { useState } from "react";
import { FileText, X, Plus } from "lucide-react";
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

interface VideoCaptionToolProps {
  webhookUrl?: string;
}

export function VideoCaptionTool({ webhookUrl = "" }: VideoCaptionToolProps) {
  // Video Caption state
  const [isCaptionDialogOpen, setIsCaptionDialogOpen] = useState(false);
  const [captionVideoUrl, setCaptionVideoUrl] = useState("");
  const [captions, setCaptions] = useState("");
  const [captionType, setCaptionType] = useState<"text" | "srt" | "ass" | "auto">("auto");
  const [captionCustomId, setCaptionCustomId] = useState("");
  const [captionLanguage, setCaptionLanguage] = useState("auto");
  const [isCaptionLoading, setIsCaptionLoading] = useState(false);
  const [excludeTimeRanges, setExcludeTimeRanges] = useState<
    Array<{ start: string; end: string }>
  >([]);
  const [currentExcludeStart, setCurrentExcludeStart] = useState("");
  const [currentExcludeEnd, setCurrentExcludeEnd] = useState("");
  const [textReplacements, setTextReplacements] = useState<
    Array<{ find: string; replace: string }>
  >([{ find: "", replace: "" }]);

  // Caption settings state
  const [captionSettings, setCaptionSettings] = useState({
    fontFamily: "Arial",
    fontSize: 24,
    color: "#FFFFFF",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    position: "bottom",
    offset: 10,
    textAlign: "center" as const
  });

  const handleAddCaptions = async () => {
    if (!captionVideoUrl.trim()) {
      alert("Please enter a video URL");
      return;
    }

    try {
      setIsCaptionLoading(true);

      const payload: any = {
        video_url: captionVideoUrl.trim(),
        caption_type: captionType,
        language: captionLanguage,
        settings: captionSettings,
        exclude_time_ranges: excludeTimeRanges.filter((range) => range.start && range.end),
        text_replacements: textReplacements.filter((rep) => rep.find),
        webhook_url: webhookUrl.trim() || undefined,
        id: captionCustomId.trim() || undefined
      };

      if (captions.trim()) {
        payload.captions = captions.trim();
      }

      console.log("Submitting Video Caption Request:", payload);
      // Replace with your actual API call
      // const response = await fetch('/api/video/caption', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });
      // const data = await response.json();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert("Video caption request submitted successfully!");

      // Reset form
      setIsCaptionDialogOpen(false);
      setCaptionVideoUrl("");
      setCaptions("");
      setCaptionType("auto");
      setCaptionLanguage("auto");
      setExcludeTimeRanges([]);
      setCurrentExcludeStart("");
      setCurrentExcludeEnd("");
      setTextReplacements([{ find: "", replace: "" }]);
      setCaptionCustomId("");

      // Reset caption settings to defaults
      setCaptionSettings({
        fontFamily: "Arial",
        fontSize: 24,
        color: "#FFFFFF",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        position: "bottom",
        offset: 10,
        textAlign: "center" as const
      });
    } catch (error) {
      console.error("Error adding captions to video:", error);
      alert("Error submitting video caption request: " + (error as Error).message);
    } finally {
      setIsCaptionLoading(false);
    }
  };

  const renderButtonText = () => "Add Captions to Video";

  return (
    <Dialog open={isCaptionDialogOpen} onOpenChange={setIsCaptionDialogOpen}>
      <DialogTrigger asChild>
        <Card className="transition-shadow hover:shadow-md cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm">Video Caption</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Adds customizable captions to videos with various styling options
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Add Captions to Video
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Add or generate captions with custom styling and timing options
          </p>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="caption-video-url" className="text-sm font-medium">
              Video URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="caption-video-url"
              value={captionVideoUrl}
              onChange={(e) => setCaptionVideoUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Caption Source</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <select
                  value={captionType}
                  onChange={(e) => setCaptionType(e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="auto">Auto-generate from audio</option>
                  <option value="text">Enter text</option>
                  <option value="srt">SRT file URL</option>
                  <option value="ass">ASS file URL</option>
                </select>
              </div>
              <div className="space-y-2">
                <Input
                  id="caption-language"
                  value={captionLanguage}
                  onChange={(e) => setCaptionLanguage(e.target.value)}
                  placeholder="Language code (e.g., en, fr)"
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  Leave as &quot;auto&quot; to detect language
                </p>
              </div>
            </div>
          </div>

          {(captionType === "text" || captionType === "srt" || captionType === "ass") && (
            <div className="space-y-2">
              <Label htmlFor="captions" className="text-sm font-medium">
                {captionType === "text"
                  ? "Caption Text"
                  : `${captionType.toUpperCase()} File URL`}
              </Label>
              {captionType === "text" ? (
                <textarea
                  id="captions"
                  value={captions}
                  onChange={(e) => setCaptions(e.target.value)}
                  placeholder="Enter your captions here..."
                  rows={6}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              ) : (
                <Input
                  id="captions"
                  value={captions}
                  onChange={(e) => setCaptions(e.target.value)}
                  placeholder={`https://example.com/captions.${captionType}`}
                  className="h-10"
                />
              )}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Text Replacements (optional)</Label>
              <div className="space-y-3">
                {textReplacements.map((replacement, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Find text"
                      value={replacement.find}
                      onChange={(e) => {
                        const updated = [...textReplacements];
                        updated[index].find = e.target.value;
                        setTextReplacements(updated);
                      }}
                      className="h-10"
                    />
                    <Input
                      placeholder="Replace with"
                      value={replacement.replace}
                      onChange={(e) => {
                        const updated = [...textReplacements];
                        updated[index].replace = e.target.value;
                        setTextReplacements(updated);
                      }}
                      className="h-10"
                    />
                    {textReplacements.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setTextReplacements(textReplacements.filter((_, i) => i !== index));
                        }}
                        className="h-10 w-10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setTextReplacements([...textReplacements, { find: "", replace: "" }])
                  }
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Replacement
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Exclude Time Ranges (optional)</Label>
              <div className="space-y-3">
                {excludeTimeRanges.map((range, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <Input
                          placeholder="Start (hh:mm:ss.ms)"
                          value={range.start}
                          disabled
                          className="h-10"
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="End (hh:mm:ss.ms)"
                          value={range.end}
                          disabled
                          className="h-10"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setExcludeTimeRanges(excludeTimeRanges.filter((_, i) => i !== index));
                      }}
                      className="h-10 w-10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <Input
                        placeholder="Start (hh:mm:ss.ms)"
                        value={currentExcludeStart}
                        onChange={(e) => setCurrentExcludeStart(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="End (hh:mm:ss.ms)"
                        value={currentExcludeEnd}
                        onChange={(e) => setCurrentExcludeEnd(e.target.value)}
                        className="h-10"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (currentExcludeStart && currentExcludeEnd) {
                        setExcludeTimeRanges([
                          ...excludeTimeRanges,
                          {
                            start: currentExcludeStart,
                            end: currentExcludeEnd
                          }
                        ]);
                        setCurrentExcludeStart("");
                        setCurrentExcludeEnd("");
                      }
                    }}
                    className="h-10 w-10 p-0"
                    disabled={!currentExcludeStart || !currentExcludeEnd}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caption-font-family" className="text-sm font-medium">
                Font Family
              </Label>
              <select
                id="caption-font-family"
                value={captionSettings.fontFamily}
                onChange={(e) =>
                  setCaptionSettings({ ...captionSettings, fontFamily: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Verdana">Verdana</option>
                <option value="Tahoma">Tahoma</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption-position" className="text-sm font-medium">
                Position
              </Label>
              <select
                id="caption-position"
                value={captionSettings.position}
                onChange={(e) =>
                  setCaptionSettings({ ...captionSettings, position: e.target.value as any })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="top">Top</option>
                <option value="middle">Middle</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption-font-size" className="text-sm font-medium">
                Font Size (px)
              </Label>
              <Input
                id="caption-font-size"
                type="number"
                min="8"
                max="72"
                value={captionSettings.fontSize}
                onChange={(e) =>
                  setCaptionSettings({
                    ...captionSettings,
                    fontSize: parseInt(e.target.value) || 24
                  })
                }
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption-offset" className="text-sm font-medium">
                Offset (px)
              </Label>
              <Input
                id="caption-offset"
                type="number"
                min="0"
                max="200"
                value={captionSettings.offset}
                onChange={(e) =>
                  setCaptionSettings({
                    ...captionSettings,
                    offset: parseInt(e.target.value) || 10
                  })
                }
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption-color" className="text-sm font-medium">
                Text Color
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="caption-color"
                  value={captionSettings.color}
                  onChange={(e) =>
                    setCaptionSettings({ ...captionSettings, color: e.target.value })
                  }
                  className="h-10 w-10 p-1 rounded border"
                />
                <span className="text-sm">{captionSettings.color.toUpperCase()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption-background" className="text-sm font-medium">
                Background
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="caption-background"
                  value={captionSettings.backgroundColor}
                  onChange={(e) =>
                    setCaptionSettings({ ...captionSettings, backgroundColor: e.target.value })
                  }
                  className="h-10 w-10 p-1 rounded border"
                />
                <span className="text-sm">{captionSettings.backgroundColor}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption-custom-id" className="text-sm font-medium">
              Custom ID (optional)
            </Label>
            <Input
              id="caption-custom-id"
              value={captionCustomId}
              onChange={(e) => setCaptionCustomId(e.target.value)}
              placeholder="my-captioned-video-1"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Optional identifier for tracking this request
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="button"
              onClick={handleAddCaptions}
              disabled={isCaptionLoading || !captionVideoUrl.trim()}
              className="w-full sm:w-auto"
            >
              {isCaptionLoading ? (
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
                  Processing...
                </>
              ) : (
                "Add Captions to Video"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
