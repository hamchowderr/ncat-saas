"use client";

import { useState } from "react";
import { Scissors, Plus, Trash2 } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function VideoSplitTool() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [splits, setSplits] = useState([{ start: "", end: "" }]);
  const [videoCodec, setVideoCodec] = useState("libx264");
  const [videoPreset, setVideoPreset] = useState("medium");
  const [videoCrf, setVideoCrf] = useState(23);
  const [audioCodec, setAudioCodec] = useState("aac");
  const [audioBitrate, setAudioBitrate] = useState("128k");
  const [customId, setCustomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addSplit = () => {
    setSplits([...splits, { start: "", end: "" }]);
  };

  const removeSplit = (index: number) => {
    if (splits.length > 1) {
      setSplits(splits.filter((_, i) => i !== index));
    }
  };

  const updateSplit = (index: number, field: "start" | "end", value: string) => {
    const updated = [...splits];
    updated[index][field] = value;
    setSplits(updated);
  };

  const handleSubmit = async () => {
    if (!videoUrl.trim()) {
      alert("Please provide a video URL");
      return;
    }

    const validSplits = splits.filter(s => s.start.trim() && s.end.trim());
    if (validSplits.length === 0) {
      alert("Please add at least one split with start and end times");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        video_url: videoUrl.trim(),
        splits: validSplits,
        video_codec: videoCodec,
        video_preset: videoPreset,
        video_crf: videoCrf,
        audio_codec: audioCodec,
        audio_bitrate: audioBitrate,
        id: customId.trim() || undefined
      };

      console.log("Submitting Video Split:", payload);
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert("Video split request submitted successfully!");
      setIsDialogOpen(false);
      setVideoUrl("");
      setSplits([{ start: "", end: "" }]);
      setVideoCodec("libx264");
      setVideoPreset("medium");
      setVideoCrf(23);
      setAudioCodec("aac");
      setAudioBitrate("128k");
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
              <Scissors className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm">Video Split</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Splits a video into multiple segments at specified timestamps
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Scissors className="h-5 w-5 text-blue-600" />
            Video Split
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Split a video into multiple segments with custom time ranges
          </p>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="video-url" className="text-sm font-medium">
              Video URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="video-url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
              className="h-10"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Split Segments</Label>
            {splits.map((split, index) => (
              <div key={index} className="space-y-2 p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Segment {index + 1}</span>
                  {splits.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSplit(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor={`start-${index}`} className="text-xs">Start Time</Label>
                    <Input
                      id={`start-${index}`}
                      value={split.start}
                      onChange={(e) => updateSplit(index, "start", e.target.value)}
                      placeholder="00:00:10.000"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`end-${index}`} className="text-xs">End Time</Label>
                    <Input
                      id={`end-${index}`}
                      value={split.end}
                      onChange={(e) => updateSplit(index, "end", e.target.value)}
                      placeholder="00:00:20.000"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addSplit}
              className="w-full h-9 border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Split Segment
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="video-codec" className="text-sm font-medium">
                Video Codec
              </Label>
              <Input
                id="video-codec"
                value={videoCodec}
                onChange={(e) => setVideoCodec(e.target.value)}
                placeholder="libx264"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-preset" className="text-sm font-medium">
                Preset
              </Label>
              <Input
                id="video-preset"
                value={videoPreset}
                onChange={(e) => setVideoPreset(e.target.value)}
                placeholder="medium"
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-crf" className="text-sm font-medium">
              CRF Quality (0-51)
            </Label>
            <Input
              id="video-crf"
              type="number"
              min="0"
              max="51"
              value={videoCrf}
              onChange={(e) => setVideoCrf(Number(e.target.value))}
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="audio-codec" className="text-sm font-medium">
                Audio Codec
              </Label>
              <Input
                id="audio-codec"
                value={audioCodec}
                onChange={(e) => setAudioCodec(e.target.value)}
                placeholder="aac"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audio-bitrate" className="text-sm font-medium">
                Audio Bitrate
              </Label>
              <Input
                id="audio-bitrate"
                value={audioBitrate}
                onChange={(e) => setAudioBitrate(e.target.value)}
                placeholder="128k"
                className="h-10"
              />
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
                "Split Video"
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
