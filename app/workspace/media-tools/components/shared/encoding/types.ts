/**
 * Shared TypeScript interfaces for video/audio encoding settings
 * Used by 5 endpoints: video/trim, video/split, video/cut, media/convert
 */

/**
 * Complete encoding settings for video and audio
 * Matches NCAT API parameters exactly
 */
export interface EncodingSettings {
  /**
   * Video codec for encoding
   * @default "libx264"
   */
  video_codec: string;

  /**
   * Video preset (speed/quality tradeoff)
   * @default "medium"
   */
  video_preset: string;

  /**
   * Constant Rate Factor (0-51, lower is better quality)
   * @default 23
   */
  video_crf: number;

  /**
   * Audio codec for encoding
   * @default "aac"
   */
  audio_codec: string;

  /**
   * Audio bitrate
   * @default "128k"
   */
  audio_bitrate: string;
}

/**
 * Props for the EncodingSettingsSection component
 */
export interface EncodingSettingsSectionProps {
  /**
   * Current video codec value
   */
  videoCodec: string;

  /**
   * Callback when video codec changes
   */
  onVideoCodecChange: (value: string) => void;

  /**
   * Current video preset value
   */
  videoPreset: string;

  /**
   * Callback when video preset changes
   */
  onVideoPresetChange: (value: string) => void;

  /**
   * Current CRF quality value (0-51)
   */
  videoCrf: number;

  /**
   * Callback when CRF value changes
   */
  onVideoCrfChange: (value: number) => void;

  /**
   * Current audio codec value
   */
  audioCodec: string;

  /**
   * Callback when audio codec changes
   */
  onAudioCodecChange: (value: string) => void;

  /**
   * Current audio bitrate value
   */
  audioBitrate: string;

  /**
   * Callback when audio bitrate changes
   */
  onAudioBitrateChange: (value: string) => void;

  /**
   * Whether the inputs are disabled (during loading states)
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether to show as collapsible accordion
   * @default false
   */
  collapsible?: boolean;
}

/**
 * Video codec options for Select component
 */
export const VIDEO_CODECS = [
  { value: "libx264", label: "H.264 (libx264)" },
  { value: "libx265", label: "H.265/HEVC (libx265)" },
  { value: "vp9", label: "VP9" },
  { value: "av1", label: "AV1" },
  { value: "mpeg4", label: "MPEG-4" },
  { value: "copy", label: "Copy (no re-encoding)" }
] as const;

/**
 * Video preset options for Select component
 */
export const VIDEO_PRESETS = [
  { value: "ultrafast", label: "Ultrafast (fastest, largest)" },
  { value: "superfast", label: "Superfast" },
  { value: "veryfast", label: "Very Fast" },
  { value: "faster", label: "Faster" },
  { value: "fast", label: "Fast" },
  { value: "medium", label: "Medium (balanced)" },
  { value: "slow", label: "Slow" },
  { value: "slower", label: "Slower" },
  { value: "veryslow", label: "Very Slow (slowest, smallest)" }
] as const;

/**
 * Audio codec options for Select component
 */
export const AUDIO_CODECS = [
  { value: "aac", label: "AAC" },
  { value: "mp3", label: "MP3" },
  { value: "opus", label: "Opus" },
  { value: "vorbis", label: "Vorbis" },
  { value: "flac", label: "FLAC (lossless)" },
  { value: "copy", label: "Copy (no re-encoding)" }
] as const;

/**
 * Audio bitrate options for Select component
 */
export const AUDIO_BITRATES = [
  { value: "64k", label: "64 kbps (low)" },
  { value: "96k", label: "96 kbps" },
  { value: "128k", label: "128 kbps (standard)" },
  { value: "160k", label: "160 kbps" },
  { value: "192k", label: "192 kbps (high)" },
  { value: "256k", label: "256 kbps" },
  { value: "320k", label: "320 kbps (maximum)" }
] as const;
