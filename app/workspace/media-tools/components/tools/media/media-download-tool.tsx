"use client";

import { useState } from "react";
import { Download, ChevronDown } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { UrlInputWithPicker } from "../../url-input-with-picker";
import { MEDIA_TYPES } from "@/lib/media-types";
import { toast } from "sonner";
import { useCookies } from "@/hooks/use-cookies";
import Link from "next/link";

export function MediaDownloadTool() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaFileId, setMediaFileId] = useState<string | null>(null);
  const [customId, setCustomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Cookie integration
  const { cookies } = useCookies();
  const [useStoredCookies, setUseStoredCookies] = useState(false);

  // Format options
  const [quality, setQuality] = useState("");
  const [resolution, setResolution] = useState("");
  const [videoCodec, setVideoCodec] = useState("");
  const [audioCodec, setAudioCodec] = useState("");

  // Audio options
  const [extractAudio, setExtractAudio] = useState(false);
  const [audioFormat, setAudioFormat] = useState("");
  const [audioQuality, setAudioQuality] = useState("");

  // Thumbnail options
  const [downloadThumbnails, setDownloadThumbnails] = useState(false);
  const [downloadAllThumbnails, setDownloadAllThumbnails] = useState(false);
  const [thumbnailFormats, setThumbnailFormats] = useState("");
  const [embedThumbnail, setEmbedThumbnail] = useState(false);

  // Subtitle options
  const [downloadSubtitles, setDownloadSubtitles] = useState(false);
  const [subtitleLanguages, setSubtitleLanguages] = useState("");
  const [subtitleFormat, setSubtitleFormat] = useState("");

  // Advanced options - REMOVED: max_filesize, rate_limit, retries (not supported by NCAT API)

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

      // Build comprehensive payload
      const payload: any = {
        media_url: mediaUrl.trim(),
        source_file_id: mediaFileId || undefined,
        custom_id: customId.trim() || undefined,
        use_cookies: useStoredCookies // Send user's cookie preference
      };

      // Add format options if any are set
      if (quality || resolution || videoCodec || audioCodec) {
        payload.format = {};
        if (quality) payload.format.quality = quality;
        if (resolution) payload.format.resolution = resolution;
        if (videoCodec) payload.format.video_codec = videoCodec;
        if (audioCodec) payload.format.audio_codec = audioCodec;
      }

      // Add audio options if extract audio is enabled
      if (extractAudio) {
        payload.audio = {
          extract: true
        };
        if (audioFormat) payload.audio.format = audioFormat;
        if (audioQuality) payload.audio.quality = audioQuality;
      }

      // Add thumbnail options if enabled
      if (downloadThumbnails || downloadAllThumbnails || thumbnailFormats || embedThumbnail) {
        payload.thumbnails = {};
        if (downloadThumbnails) payload.thumbnails.download = true;
        if (downloadAllThumbnails) payload.thumbnails.download_all = true;
        if (thumbnailFormats) payload.thumbnails.formats = thumbnailFormats;
        if (embedThumbnail) payload.thumbnails.embed_in_audio = true;
      }

      // Add subtitle options if enabled
      if (downloadSubtitles) {
        payload.subtitles = {
          download: true
        };
        if (subtitleLanguages) {
          payload.subtitles.languages = subtitleLanguages.split(",").map((l) => l.trim());
        }
        if (subtitleFormat) payload.subtitles.format = subtitleFormat;
      }

      // Note: Advanced options (max_filesize, rate_limit, retries) removed - not supported by NCAT API

      console.log("📤 Submitting Media Download request:", payload);

      // Call Edge Function
      // NOTE: Edge Function automatically uses stored cookies if available
      // No need to pass cookie parameter - handled server-side
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
      const response = await fetch(`${supabaseUrl}/functions/v1/media-download`, {
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

      console.log("✅ Media download started:", result);

      let toastMessage = `Job ID: ${result.job_id}. Check the Jobs page to track progress.`;
      if (useStoredCookies && cookies.length > 0) {
        toastMessage += " Using your stored cookies for authentication.";
      }

      toast.success("Media download started!", {
        description: toastMessage
      });

      setIsDialogOpen(false);
      // Reset form
      setMediaUrl("");
      setMediaFileId(null);
      setCustomId("");
      setUseStoredCookies(false);
      setQuality("");
      setResolution("");
      setVideoCodec("");
      setAudioCodec("");
      setExtractAudio(false);
      setAudioFormat("");
      setAudioQuality("");
      setDownloadThumbnails(false);
      setDownloadAllThumbnails(false);
      setThumbnailFormats("");
      setEmbedThumbnail(false);
      setDownloadSubtitles(false);
      setSubtitleLanguages("");
      setSubtitleFormat("");
    } catch (error) {
      console.error("❌ Media download error:", error);
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
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-orange-600" />
                <CardTitle className="text-sm">Media Download</CardTitle>
              </div>
              <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                BETA
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Download media from YouTube, Vimeo, and other platforms
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Download className="h-5 w-5 text-orange-600" />
            Media Download
          </DialogTitle>
          <p className="text-muted-foreground mt-1 text-sm">
            Download media from various platforms with advanced options for format, quality, and
            more
          </p>
        </DialogHeader>
        <div className="space-y-6">
          {/* Basic Inputs */}
          <div className="space-y-2">
            <Label htmlFor="media-url" className="text-sm font-medium">
              Media URL <span className="text-red-500">*</span>
            </Label>
            <UrlInputWithPicker
              id="media-url"
              value={mediaUrl}
              onChange={setMediaUrl}
              onFileIdChange={setMediaFileId}
              accept={MEDIA_TYPES.ALL_MEDIA}
              placeholder="Enter YouTube, Vimeo, or other media URL..."
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

          {/* Cookie Integration */}
          {cookies.length > 0 && (
            <div className="border-muted rounded-lg border bg-muted/20 p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="use-cookies"
                  checked={useStoredCookies}
                  onCheckedChange={(checked) => setUseStoredCookies(checked as boolean)}
                />
                <div className="space-y-1">
                  <Label htmlFor="use-cookies" className="cursor-pointer text-sm font-medium">
                    Use my stored cookies for authentication
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Required for downloading from authenticated platforms (YouTube Premium, private
                    videos, etc.)
                  </p>
                </div>
              </div>
            </div>
          )}

          {cookies.length === 0 && (
            <div className="border-muted rounded-lg border bg-muted/20 p-4">
              <p className="text-muted-foreground text-xs">
                Need to download from authenticated platforms?{" "}
                <Link href="/settings/integrations" className="text-primary underline">
                  Add cookies in Settings → Integrations
                </Link>
              </p>
            </div>
          )}

          {/* Collapsible Options */}
          <Accordion type="multiple" className="w-full">
            {/* Format Options */}
            <AccordionItem value="format">
              <AccordionTrigger className="text-sm font-medium">
                Format Options
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quality" className="text-sm">
                        Quality
                      </Label>
                      <Select value={quality} onValueChange={setQuality}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="best">Best</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resolution" className="text-sm">
                        Resolution
                      </Label>
                      <Select value={resolution} onValueChange={setResolution}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select resolution" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                          <SelectItem value="720p">720p (HD)</SelectItem>
                          <SelectItem value="480p">480p (SD)</SelectItem>
                          <SelectItem value="360p">360p</SelectItem>
                          <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="video-codec" className="text-sm">
                        Video Codec
                      </Label>
                      <Select value={videoCodec} onValueChange={setVideoCodec}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select codec" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="h264">H.264</SelectItem>
                          <SelectItem value="h265">H.265/HEVC</SelectItem>
                          <SelectItem value="vp9">VP9</SelectItem>
                          <SelectItem value="av1">AV1</SelectItem>
                          <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="audio-codec-format" className="text-sm">
                        Audio Codec
                      </Label>
                      <Select value={audioCodec} onValueChange={setAudioCodec}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select codec" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aac">AAC</SelectItem>
                          <SelectItem value="mp3">MP3</SelectItem>
                          <SelectItem value="opus">Opus</SelectItem>
                          <SelectItem value="vorbis">Vorbis</SelectItem>
                          <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Audio Options */}
            <AccordionItem value="audio">
              <AccordionTrigger className="text-sm font-medium">
                Audio Options
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="extract-audio"
                      checked={extractAudio}
                      onCheckedChange={(checked) => setExtractAudio(checked as boolean)}
                    />
                    <Label htmlFor="extract-audio" className="cursor-pointer text-sm">
                      Extract audio only
                    </Label>
                  </div>

                  {extractAudio && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="audio-format" className="text-sm">
                          Audio Format
                        </Label>
                        <Select value={audioFormat} onValueChange={setAudioFormat}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mp3">MP3</SelectItem>
                            <SelectItem value="m4a">M4A</SelectItem>
                            <SelectItem value="wav">WAV</SelectItem>
                            <SelectItem value="flac">FLAC (Lossless)</SelectItem>
                            <SelectItem value="opus">Opus</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="audio-quality" className="text-sm">
                          Audio Quality
                        </Label>
                        <Select value={audioQuality} onValueChange={setAudioQuality}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select quality" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="best">Best</SelectItem>
                            <SelectItem value="320k">320 kbps</SelectItem>
                            <SelectItem value="256k">256 kbps</SelectItem>
                            <SelectItem value="192k">192 kbps</SelectItem>
                            <SelectItem value="128k">128 kbps</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Thumbnail Options */}
            <AccordionItem value="thumbnails">
              <AccordionTrigger className="text-sm font-medium">
                Thumbnail Options
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="download-thumbnails"
                      checked={downloadThumbnails}
                      onCheckedChange={(checked) => setDownloadThumbnails(checked as boolean)}
                    />
                    <Label htmlFor="download-thumbnails" className="cursor-pointer text-sm">
                      Download thumbnails
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="download-all"
                      checked={downloadAllThumbnails}
                      onCheckedChange={(checked) => setDownloadAllThumbnails(checked as boolean)}
                    />
                    <Label htmlFor="download-all" className="cursor-pointer text-sm">
                      Download all available thumbnails
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnail-formats" className="text-sm">
                      Thumbnail Formats
                    </Label>
                    <Input
                      id="thumbnail-formats"
                      value={thumbnailFormats}
                      onChange={(e) => setThumbnailFormats(e.target.value)}
                      placeholder="jpg,png,webp (comma-separated)"
                      className="h-10"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="embed-thumbnail"
                      checked={embedThumbnail}
                      onCheckedChange={(checked) => setEmbedThumbnail(checked as boolean)}
                    />
                    <Label htmlFor="embed-thumbnail" className="cursor-pointer text-sm">
                      Embed thumbnail in audio file
                    </Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Subtitle Options */}
            <AccordionItem value="subtitles">
              <AccordionTrigger className="text-sm font-medium">
                Subtitle Options
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="download-subtitles"
                      checked={downloadSubtitles}
                      onCheckedChange={(checked) => setDownloadSubtitles(checked as boolean)}
                    />
                    <Label htmlFor="download-subtitles" className="cursor-pointer text-sm">
                      Download subtitles
                    </Label>
                  </div>

                  {downloadSubtitles && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="subtitle-languages" className="text-sm">
                          Languages
                        </Label>
                        <Input
                          id="subtitle-languages"
                          value={subtitleLanguages}
                          onChange={(e) => setSubtitleLanguages(e.target.value)}
                          placeholder="en,es,fr,de (comma-separated language codes)"
                          className="h-10"
                        />
                        <p className="text-muted-foreground text-xs">
                          Common codes: en (English), es (Spanish), fr (French), de (German), ja
                          (Japanese), ko (Korean), zh (Chinese)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subtitle-format" className="text-sm">
                          Subtitle Format
                        </Label>
                        <Select value={subtitleFormat} onValueChange={setSubtitleFormat}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="srt">SRT (SubRip)</SelectItem>
                            <SelectItem value="vtt">VTT (WebVTT)</SelectItem>
                            <SelectItem value="ass">ASS (Advanced SubStation)</SelectItem>
                            <SelectItem value="lrc">LRC (Lyrics)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Advanced Options section removed - fields not supported by NCAT API */}
          </Accordion>

          {/* Action Buttons */}
          <div className="flex gap-3 border-t pt-4">
            <Button onClick={handleSubmit} disabled={isLoading} className="h-11 flex-1">
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Media
                </>
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
