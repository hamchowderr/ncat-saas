"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
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
import { UrlInputWithPicker } from "../../url-input-with-picker";
import { MEDIA_TYPES } from "@/lib/media-types";
import { toast } from "sonner";
import {
  CaptionStyleSection,
  CaptionPositionSection,
  CaptionAdvancedSection,
  TextReplacementsSection,
  ExcludeRangesSection
} from "../../shared/captions";
import type {
  CaptionPosition,
  TextReplacement,
  ExcludeRange
} from "../../shared/captions";

export function VideoCaptionTool() {
  // Dialog state
  const [isCaptionDialogOpen, setIsCaptionDialogOpen] = useState(false);
  const [isCaptionLoading, setIsCaptionLoading] = useState(false);

  // Video input
  const [captionVideoUrl, setCaptionVideoUrl] = useState("");
  const [videoFileId, setVideoFileId] = useState<string | null>(null);

  // Caption source
  const [captionType, setCaptionType] = useState<"text" | "srt" | "ass" | "auto">("auto");
  const [captions, setCaptions] = useState("");
  const [captionLanguage, setCaptionLanguage] = useState("auto");

  // Caption style settings (managed by shared component)
  const [fonts, setFonts] = useState("Arial");
  const [fontSize, setFontSize] = useState(48);
  const [primaryColor, setPrimaryColor] = useState("#FFFFFF");
  const [outlineColor, setOutlineColor] = useState("#000000");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [strikeout, setStrikeout] = useState(false);
  const [alignment, setAlignment] = useState(2);
  const [outline, setOutline] = useState(2);
  const [shadow, setShadow] = useState(0);

  // Caption position (managed by shared component)
  const [position, setPosition] = useState<CaptionPosition>("bottom-center");

  // Text replacements (managed by shared component)
  const [textReplacements, setTextReplacements] = useState<TextReplacement[]>([]);

  // Exclude ranges (managed by shared component)
  const [excludeRanges, setExcludeRanges] = useState<ExcludeRange[]>([]);

  // Custom ID
  const [captionCustomId, setCaptionCustomId] = useState("");

  // Helper function to map our 9-point position grid to NCAT format
  const mapPositionToNCATFormat = (pos: CaptionPosition): string => {
    // Convert "top-left" to "top_left", "bottom-center" to "bottom_center", etc.
    return pos.replace(/-/g, "_");
  };

  // Helper function to map alignment number to NCAT format
  const mapAlignmentToNCATFormat = (alignmentNum: number): string => {
    // ASS subtitle alignment grid:
    // 7 8 9 (top row)
    // 4 5 6 (middle row)
    // 1 2 3 (bottom row)
    // Left column (1,4,7) = "left"
    // Center column (2,5,8) = "center"
    // Right column (3,6,9) = "right"
    if ([1, 4, 7].includes(alignmentNum)) return "left";
    if ([3, 6, 9].includes(alignmentNum)) return "right";
    return "center"; // Default for 2, 5, 8
  };

  const handleAddCaptions = async () => {
    if (!captionVideoUrl.trim()) {
      toast.error("Please enter a video URL");
      return;
    }

    setIsCaptionLoading(true);
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
        setIsCaptionLoading(false);
        return;
      }

      const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";

      // Construct payload according to NCAT API documentation
      const payload: any = {
        video_url: captionVideoUrl.trim(),
        source_file_id: videoFileId || undefined,
        language: captionLanguage,
        custom_id: captionCustomId.trim() || undefined
      };

      // Add captions if provided (raw text, SRT URL, or ASS URL)
      if (captions.trim()) {
        payload.captions = captions.trim();
      }

      // Build settings object with all styling parameters
      const settings: any = {
        line_color: primaryColor,
        outline_color: outlineColor,
        font_family: fonts,
        font_size: fontSize,
        bold,
        italic,
        underline,
        strikeout,
        position: mapPositionToNCATFormat(position),
        alignment: mapAlignmentToNCATFormat(alignment),
        outline_width: outline,
        shadow_offset: shadow
      };

      payload.settings = settings;

      // Add text replacements if any
      if (textReplacements.length > 0) {
        const validReplacements = textReplacements.filter(
          (rep) => rep.original && rep.replacement
        );
        if (validReplacements.length > 0) {
          payload.replace = validReplacements.map((rep) => ({
            find: rep.original,
            replace: rep.replacement
          }));
        }
      }

      // Add exclude time ranges if any
      if (excludeRanges.length > 0) {
        const validRanges = excludeRanges.filter((range) => range.start && range.end);
        if (validRanges.length > 0) {
          payload.exclude_time_ranges = validRanges;
        }
      }

      console.log("📤 Submitting Video Caption request:", payload);

      // Call Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/video-caption`, {
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

      console.log("✅ Video caption started:", result);

      toast.success("Video caption started!", {
        description: `Job ID: ${result.job_id}. Check the Jobs page to track progress.`
      });

      // Reset form
      setIsCaptionDialogOpen(false);
      setCaptionVideoUrl("");
      setVideoFileId(null);
      setCaptions("");
      setCaptionType("auto");
      setCaptionLanguage("auto");

      // Reset caption style settings to defaults
      setFonts("Arial");
      setFontSize(48);
      setPrimaryColor("#FFFFFF");
      setOutlineColor("#000000");
      setBold(false);
      setItalic(false);
      setUnderline(false);
      setStrikeout(false);
      setAlignment(2);
      setOutline(2);
      setShadow(0);

      // Reset position
      setPosition("bottom-center");

      // Reset arrays
      setTextReplacements([]);
      setExcludeRanges([]);
      setCaptionCustomId("");
    } catch (error) {
      console.error("❌ Video caption error:", error);
      toast.error("Failed to submit request", {
        description: (error as Error).message || "An unexpected error occurred"
      });
    } finally {
      setIsCaptionLoading(false);
    }
  };

  return (
    <Dialog open={isCaptionDialogOpen} onOpenChange={setIsCaptionDialogOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <FileText className="h-5 w-5 text-blue-600" />
            Add Captions to Video
          </DialogTitle>
          <p className="text-muted-foreground mt-1 text-sm">
            Add or generate captions with custom styling and timing options
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="caption-video-url" className="text-sm font-medium">
              Video URL <span className="text-red-500">*</span>
            </Label>
            <UrlInputWithPicker
              id="caption-video-url"
              value={captionVideoUrl}
              onChange={setCaptionVideoUrl}
              onFileIdChange={setVideoFileId}
              accept={MEDIA_TYPES.VIDEO}
              placeholder="Select video or paste URL..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Caption Source</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <select
                  value={captionType}
                  onChange={(e) => setCaptionType(e.target.value as any)}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
                <p className="text-muted-foreground text-xs">
                  Leave as &quot;auto&quot; to detect language
                </p>
              </div>
            </div>
          </div>

          {(captionType === "text" || captionType === "srt" || captionType === "ass") && (
            <div className="space-y-2">
              <Label htmlFor="captions" className="text-sm font-medium">
                {captionType === "text" ? "Caption Text" : `${captionType.toUpperCase()} File URL`}
              </Label>
              {captionType === "text" ? (
                <textarea
                  id="captions"
                  value={captions}
                  onChange={(e) => setCaptions(e.target.value)}
                  placeholder="Enter your captions here..."
                  rows={6}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              ) : (
                <UrlInputWithPicker
                  id="captions"
                  value={captions}
                  onChange={setCaptions}
                  accept="*/*"
                  placeholder="Select caption file or paste URL..."
                />
              )}
            </div>
          )}

          <CaptionStyleSection
            fonts={fonts}
            onFontsChange={setFonts}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            primaryColor={primaryColor}
            onPrimaryColorChange={setPrimaryColor}
            outlineColor={outlineColor}
            onOutlineColorChange={setOutlineColor}
            bold={bold}
            onBoldChange={setBold}
            italic={italic}
            onItalicChange={setItalic}
            underline={underline}
            onUnderlineChange={setUnderline}
            strikeout={strikeout}
            onStrikeoutChange={setStrikeout}
            alignment={alignment}
            onAlignmentChange={setAlignment}
            disabled={isCaptionLoading}
            collapsible={true}
          />

          <CaptionPositionSection
            position={position}
            onPositionChange={setPosition}
            disabled={isCaptionLoading}
          />

          <CaptionAdvancedSection
            outline={outline}
            onOutlineChange={setOutline}
            shadow={shadow}
            onShadowChange={setShadow}
            disabled={isCaptionLoading}
            collapsible={true}
          />

          <TextReplacementsSection
            replacements={textReplacements}
            onReplacementsChange={setTextReplacements}
            disabled={isCaptionLoading}
            collapsible={true}
          />

          <ExcludeRangesSection
            ranges={excludeRanges}
            onRangesChange={setExcludeRanges}
            disabled={isCaptionLoading}
            collapsible={true}
          />

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
            <p className="text-muted-foreground text-xs">
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
