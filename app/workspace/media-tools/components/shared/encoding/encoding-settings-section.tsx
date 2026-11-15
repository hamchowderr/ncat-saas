"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  EncodingSettingsSectionProps,
  VIDEO_CODECS,
  VIDEO_PRESETS,
  AUDIO_CODECS,
  AUDIO_BITRATES
} from "./types";

/**
 * Reusable video and audio encoding settings section
 * Used by 5 NCAT API endpoints: video/trim, video/split, video/cut, media/convert
 *
 * @example
 * ```tsx
 * const [videoCodec, setVideoCodec] = useState("libx264");
 * const [videoPreset, setVideoPreset] = useState("medium");
 * const [videoCrf, setVideoCrf] = useState(23);
 * const [audioCodec, setAudioCodec] = useState("aac");
 * const [audioBitrate, setAudioBitrate] = useState("128k");
 *
 * <EncodingSettingsSection
 *   videoCodec={videoCodec}
 *   onVideoCodecChange={setVideoCodec}
 *   videoPreset={videoPreset}
 *   onVideoPresetChange={setVideoPreset}
 *   videoCrf={videoCrf}
 *   onVideoCrfChange={setVideoCrf}
 *   audioCodec={audioCodec}
 *   onAudioCodecChange={setAudioCodec}
 *   audioBitrate={audioBitrate}
 *   onAudioBitrateChange={setAudioBitrate}
 *   collapsible={true}
 * />
 * ```
 */
export function EncodingSettingsSection({
  videoCodec,
  onVideoCodecChange,
  videoPreset,
  onVideoPresetChange,
  videoCrf,
  onVideoCrfChange,
  audioCodec,
  onAudioCodecChange,
  audioBitrate,
  onAudioBitrateChange,
  disabled = false,
  collapsible = false
}: EncodingSettingsSectionProps) {
  const content = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="video-codec" className="text-sm font-medium">
            Video Codec
          </Label>
          <Select value={videoCodec} onValueChange={onVideoCodecChange} disabled={disabled}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select video codec" />
            </SelectTrigger>
            <SelectContent>
              {VIDEO_CODECS.map((codec) => (
                <SelectItem key={codec.value} value={codec.value}>
                  {codec.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="video-preset" className="text-sm font-medium">
            Video Preset
          </Label>
          <Select value={videoPreset} onValueChange={onVideoPresetChange} disabled={disabled}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select video preset" />
            </SelectTrigger>
            <SelectContent>
              {VIDEO_PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          onChange={(e) => onVideoCrfChange(Number(e.target.value))}
          className="h-10"
          disabled={disabled}
        />
        <p className="text-muted-foreground text-xs">Lower = better quality (23 is default)</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="audio-codec" className="text-sm font-medium">
            Audio Codec
          </Label>
          <Select value={audioCodec} onValueChange={onAudioCodecChange} disabled={disabled}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select audio codec" />
            </SelectTrigger>
            <SelectContent>
              {AUDIO_CODECS.map((codec) => (
                <SelectItem key={codec.value} value={codec.value}>
                  {codec.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="audio-bitrate" className="text-sm font-medium">
            Audio Bitrate
          </Label>
          <Select value={audioBitrate} onValueChange={onAudioBitrateChange} disabled={disabled}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select audio bitrate" />
            </SelectTrigger>
            <SelectContent>
              {AUDIO_BITRATES.map((bitrate) => (
                <SelectItem key={bitrate.value} value={bitrate.value}>
                  {bitrate.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  if (collapsible) {
    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="encoding">
          <AccordionTrigger className="text-sm font-medium">Encoding Settings</AccordionTrigger>
          <AccordionContent>{content}</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Encoding Settings</h3>
      {content}
    </div>
  );
}
