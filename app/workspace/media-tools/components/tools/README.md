# Media Tools Refactoring Guide

## Overview

Modular tool components extracted from monolithic file (3,033 lines → separate files).

## Directory Structure

```
tools/
├── audio/
│   ├── audio-concatenate-tool.tsx ✅ (Extracted)
│   └── silence-detection-tool.tsx ✅ (Extracted)
├── video/
│   ├── video-caption-tool.tsx ✅ (Extracted)
│   ├── video-trim-tool.tsx ✅ (Extracted)
│   ├── video-split-tool.tsx ⏳ (TODO)
│   ├── video-thumbnail-tool.tsx ⏳ (TODO)
│   └── video-concatenate-tool.tsx ⏳ (TODO)
├── image/
│   ├── image-to-video-tool.tsx ✅ (Extracted)
│   └── webpage-screenshot-tool.tsx ⏳ (TODO)
├── code/
│   └── python-execution-tool.tsx ✅ (Extracted)
├── ffmpeg/
│   └── ffmpeg-compose-tool.tsx ⏳ (TODO)
├── media/
│   ├── media-convert-tool.tsx ⏳ (TODO)
│   ├── media-to-mp3-tool.tsx ⏳ (TODO)
│   ├── media-download-tool.tsx ⏳ (TODO)
│   ├── media-metadata-tool.tsx ⏳ (TODO)
│   └── media-transcribe-tool.tsx ⏳ (TODO)
└── storage/
    ├── s3-upload-tool.tsx ⏳ (TODO)
    └── s3-download-tool.tsx ⏳ (TODO)
```

## Extraction Pattern

**Each tool has 3 parts:**
1. State declarations
2. Handler function
3. Dialog JSX

**Component template:**

```typescript
"use client";

import { useState } from "react";
import { IconName } from "lucide-react"; // Use appropriate icon
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// Import any other components used by your tool

export function YourToolNameTool() {
  // 1. Paste state variables here (rename to remove tool-specific prefixes if needed)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // ... other state

  // 2. Paste handler function here (rename to generic name like handleSubmit)
  const handleSubmit = async () => {
    // ... logic
  };

  // 3. Return JSX
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Card className="transition-shadow hover:shadow-md cursor-pointer">
          {/* Card content */}
        </Card>
      </DialogTrigger>
      <DialogContent>
        {/* Dialog content */}
      </DialogContent>
    </Dialog>
  );
}
```

**Simplify names:**
- `isVideoSplitDialogOpen` → `isDialogOpen`
- `handleVideoSplitSubmit` → `handleSubmit`

**Import in main file:**
```typescript
import { VideoSplitTool } from "./tools/video/video-split-tool";
```

## Examples

### Simple Tool Example: Audio Concatenate

**File:** `tools/audio/audio-concatenate-tool.tsx`

- **Lines:** ~170 lines
- **Complexity:** Low
- **Features:**
  - Dynamic array of audio URLs
  - Add/remove URL functionality
  - Simple form validation

### Complex Tool Example: Video Caption

**File:** `tools/video/video-caption-tool.tsx`

- **Lines:** ~500+ lines
- **Complexity:** High
- **Features:**
  - Multiple caption sources (auto/text/srt/ass)
  - Caption styling settings (font, color, position)
  - Dynamic text replacements array
  - Dynamic exclude time ranges array
  - Conditional form fields based on caption type

## Testing

Import → `npm run dev` → Test at http://localhost:3000/workspace/media-tools

## Benefits

Before: 3,033 lines, mixed state, hard to test
After: 150-500 lines per tool, isolated components, easy to add/test

## Remaining Tools to Extract

### High Priority (Most Used)

1. ⏳ Video Split Tool
2. ⏳ Video Thumbnail Tool
3. ⏳ FFmpeg Compose Tool
4. ⏳ Media Convert Tool

### Medium Priority

5. ⏳ Video Concatenate Tool
6. ⏳ Media to MP3 Tool
7. ⏳ Media Download Tool
8. ⏳ Webpage Screenshot Tool

### Low Priority (Less Complex)

9. ⏳ Media Metadata Tool (might be just a placeholder)
10. ⏳ Media Transcribe Tool
11. ⏳ S3 Upload Tool
12. ⏳ S3 Download Tool

## Tips

**Find state:** Regex `// .*Tool.*state$`
**Find handlers:** Regex `const handle.*Submit.*=.*async`
**Find dialogs:** Search tool name in DialogTitle
**Shared logic:** Create `tools/utils/` folder
**Examples:** `audio-concatenate-tool.tsx` (simple) | `video-caption-tool.tsx` (complex)

## Checklist

- [ ] Extract all tools → Import → Remove placeholders
- [ ] Backup original → Rename refactored
- [ ] `npm run build` → `npm run lint`
