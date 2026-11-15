# NCAT API Shared Components Library

Reusable React components for the No-Code Architects Toolkit API integration.

## Overview

This library provides shared UI components that reduce code duplication across 14+ media processing tools. All components use shadcn/ui design system for consistency.

## Directory Structure

```
shared/
├── common/
│   ├── types.ts                       # WebhookIdParams interface
│   └── webhook-id-section.tsx         # Webhook URL + Custom ID (15 tools)
├── encoding/
│   ├── types.ts                       # EncodingSettings interface + constants
│   └── encoding-settings-section.tsx  # Video/audio encoding (5 tools)
├── time/
│   ├── types.ts                       # TimeRange interface
│   ├── time-range-single.tsx          # Single start/end (2 tools)
│   └── time-ranges-array.tsx          # Multiple start/end ranges (2 tools)
├── captions/
│   ├── types.ts                       # CaptionSettings interface
│   ├── caption-style-section.tsx      # Fonts, colors, styles
│   ├── caption-position-section.tsx   # 9-point grid + alignment
│   ├── caption-advanced-section.tsx   # Bold, italic, outline, etc.
│   ├── text-replacements-section.tsx  # Find/replace array
│   └── exclude-ranges-section.tsx     # Time exclusions
└── README.md                          # This file
```

## Components

### 1. Custom ID Input (NOT WebhookIdSection)

**Used by:** 15 endpoints (all except s3/upload)

**IMPORTANT:** Webhook URL is NOT user-configurable. It's always set to the internal `ncat-webhook` edge function.

```tsx
// Webhook URL is automatically constructed (NOT user input)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const internalWebhookUrl = `${supabaseUrl}/functions/v1/ncat-webhook`;

// Only Custom ID is user-editable
const [customId, setCustomId] = useState("");

<div className="space-y-2">
  <Label htmlFor="custom-id" className="text-sm font-medium">
    Custom ID <span className="text-muted-foreground">(Optional)</span>
  </Label>
  <Input
    id="custom-id"
    value={customId}
    onChange={(e) => setCustomId(e.target.value)}
    placeholder="my-job-identifier"
    className="h-10"
    disabled={isLoading}
  />
  <p className="text-muted-foreground text-xs">
    Custom identifier for tracking this request
  </p>
</div>
```

**Payload construction:**
```typescript
const payload = {
  // ... other params
  webhook_url: internalWebhookUrl,  // Always internal webhook
  id: customId.trim() || undefined
};
```

### 2. EncodingSettingsSection

**Used by:** 5 endpoints (video/trim, video/split, video/cut, media/convert)

Provides complete video and audio encoding configuration.

```tsx
import { EncodingSettingsSection } from "../shared/encoding/encoding-settings-section";

const [videoCodec, setVideoCodec] = useState("libx264");
const [videoPreset, setVideoPreset] = useState("medium");
const [videoCrf, setVideoCrf] = useState(23);
const [audioCodec, setAudioCodec] = useState("aac");
const [audioBitrate, setAudioBitrate] = useState("128k");

<EncodingSettingsSection
  videoCodec={videoCodec}
  onVideoCodecChange={setVideoCodec}
  videoPreset={videoPreset}
  onVideoPresetChange={setVideoPreset}
  videoCrf={videoCrf}
  onVideoCrfChange={setVideoCrf}
  audioCodec={audioCodec}
  onAudioCodecChange={setAudioCodec}
  audioBitrate={audioBitrate}
  onAudioBitrateChange={setAudioBitrate}
  collapsible={false}  // or true for accordion
  disabled={isLoading}
/>
```

**Payload construction:**
```typescript
const payload = {
  // ... other params
  video_codec: videoCodec,
  video_preset: videoPreset,
  video_crf: videoCrf,
  audio_codec: audioCodec,
  audio_bitrate: audioBitrate
};
```

**Available options:**
- Video codecs: libx264, libx265, vp9, av1, mpeg4, copy
- Video presets: ultrafast → veryslow (9 options)
- CRF: 0-51 (lower = better quality, 23 = default)
- Audio codecs: aac, mp3, opus, vorbis, flac, copy
- Audio bitrates: 64k → 320k (7 options)

## Usage Patterns

### Pattern 1: Simple Tools (Just Webhook/ID)

Tools like video/thumbnail, media/metadata:

```tsx
import { WebhookIdSection } from "../shared/common/webhook-id-section";

export function VideoThumbnailTool() {
  const [videoUrl, setVideoUrl] = useState("");
  const [second, setSecond] = useState(0);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [customId, setCustomId] = useState("");

  // ... tool-specific inputs

  <WebhookIdSection
    webhookUrl={webhookUrl}
    onWebhookUrlChange={setWebhookUrl}
    customId={customId}
    onCustomIdChange={setCustomId}
  />
}
```

### Pattern 2: Encoding + Webhook/ID

Tools like video/trim, media/convert:

```tsx
import { EncodingSettingsSection } from "../shared/encoding/encoding-settings-section";
import { WebhookIdSection } from "../shared/common/webhook-id-section";

export function VideoTrimTool() {
  const [videoUrl, setVideoUrl] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Encoding settings
  const [videoCodec, setVideoCodec] = useState("libx264");
  const [videoPreset, setVideoPreset] = useState("medium");
  const [videoCrf, setVideoCrf] = useState(23);
  const [audioCodec, setAudioCodec] = useState("aac");
  const [audioBitrate, setAudioBitrate] = useState("128k");

  // Webhook/ID
  const [webhookUrl, setWebhookUrl] = useState("");
  const [customId, setCustomId] = useState("");

  return (
    <>
      {/* Tool-specific inputs */}

      <EncodingSettingsSection
        videoCodec={videoCodec}
        onVideoCodecChange={setVideoCodec}
        videoPreset={videoPreset}
        onVideoPresetChange={setVideoPreset}
        videoCrf={videoCrf}
        onVideoCrfChange={setVideoCrf}
        audioCodec={audioCodec}
        onAudioCodecChange={setAudioCodec}
        audioBitrate={audioBitrate}
        onAudioBitrateChange={setAudioBitrate}
      />

      <WebhookIdSection
        webhookUrl={webhookUrl}
        onWebhookUrlChange={setWebhookUrl}
        customId={customId}
        onCustomIdChange={setCustomId}
      />
    </>
  );
}
```

## Benefits

✅ **60% Code Reduction**: Tool files shrink from ~500 lines to ~200 lines
✅ **Consistency**: All tools use identical shadcn components
✅ **Maintainability**: Update once, affects 14+ tools
✅ **Type Safety**: Shared TypeScript interfaces
✅ **Accessibility**: Built on Radix UI primitives
✅ **Documentation**: JSDoc comments on all exports

## Migration Guide

### Before (Old Pattern)

```tsx
<div className="space-y-2">
  <Label htmlFor="video-codec">Video Codec</Label>
  <select id="video-codec" value={videoCodec} onChange={(e) => setVideoCodec(e.target.value)}>
    <option value="libx264">H.264 (libx264)</option>
    <option value="libx265">H.265 (libx265)</option>
    {/* ... more options */}
  </select>
</div>
```

### After (Shared Component)

```tsx
import { EncodingSettingsSection } from "../shared/encoding/encoding-settings-section";

<EncodingSettingsSection
  videoCodec={videoCodec}
  onVideoCodecChange={setVideoCodec}
  // ... other props
/>
```

## Best Practices

1. **Import from shared/** - Always use shared components instead of duplicating
2. **Use TypeScript interfaces** - Import types for proper type checking
3. **Follow naming conventions** - Use camelCase for React state, snake_case for API payloads
4. **Disable during loading** - Pass `disabled={isLoading}` to prevent user input
5. **Collapsible for space** - Use `collapsible={true}` in crowded UIs

## Tools Using Shared Components

**High Priority (5 tools):**
- video-caption-tool (6 components)
- video-trim-tool (3 components)
- video-split-tool (3 components)
- video-cut-tool (3 components)
- media-convert-tool (2 components)

**Medium Priority (4 tools):**
- video-concatenate-tool (2 components)
- audio-concatenate-tool (2 components)
- media-silence-tool (2 components)
- video-thumbnail-tool (1 component)

**Low Priority (5 tools):**
- media-transcribe-tool (1 component)
- media-metadata-tool (1 component)
- media-to-mp3-tool (1 component)
- image-to-video-tool (1 component)
- python-execution-tool (1 component)

## Contributing

When adding new shared components:

1. Create types.ts first with interfaces and constants
2. Build component using shadcn/ui primitives
3. Add JSDoc comments for all exports
4. Include usage examples in this README
5. Update the migration guide with before/after examples
