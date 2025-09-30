# Media Tools Refactoring Guide

## Overview

This directory contains modular, self-contained tool components extracted from the monolithic `media-tools-content.tsx` file (originally 3,033 lines).

**Goal:** Break down the large file into manageable, reusable components where each tool is in its own file.

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

### Step 1: Identify the Tool in Original File

Open `media-tools-content.tsx` and search for your tool. Each tool has three main components:

1. **State declarations** (near the top, around lines 30-330)
2. **Handler function** (in the middle, around lines 79-673)
3. **Dialog JSX** (in the return statement, around lines 674-3030)

### Step 2: Extract State Variables

Find the comment for your tool's state, for example:
```typescript
// Video Split state
const [isVideoSplitDialogOpen, setIsVideoSplitDialogOpen] = useState(false);
const [splitVideoUrl, setSplitVideoUrl] = useState("");
// ... all related state
```

Copy ALL state variables related to that tool.

### Step 3: Extract Handler Function

Find the async handler function, for example:
```typescript
const handleVideoSplitSubmit = async () => {
  // validation
  // API call
  // success handling
  // error handling
  // form reset
};
```

Copy the entire function including all logic.

### Step 4: Extract Dialog JSX

Find the Dialog component in the return statement. It usually follows this pattern:
```typescript
<Dialog open={isToolDialogOpen} onOpenChange={setIsToolDialogOpen}>
  <DialogTrigger asChild>
    <Card>...</Card>
  </DialogTrigger>
  <DialogContent>
    {/* All form fields */}
  </DialogContent>
</Dialog>
```

### Step 5: Create New Component File

Create a new file following this template:

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

### Step 6: Clean Up State Variable Names

In the original file, state variables are prefixed to avoid conflicts. In your component, you can simplify:

❌ **Before (in monolithic file):**
```typescript
const [isVideoSplitDialogOpen, setIsVideoSplitDialogOpen] = useState(false);
const [splitVideoUrl, setSplitVideoUrl] = useState("");
const [isVideoSplitLoading, setIsVideoSplitLoading] = useState(false);
```

✅ **After (in component file):**
```typescript
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [videoUrl, setVideoUrl] = useState("");
const [isLoading, setIsLoading] = useState(false);
```

### Step 7: Update Handler Function Name

Rename tool-specific handler to generic `handleSubmit`:

❌ **Before:**
```typescript
const handleVideoSplitSubmit = async () => { ... }
```

✅ **After:**
```typescript
const handleSubmit = async () => { ... }
```

### Step 8: Add to Main File

Import and use your new component in `media-tools-content-refactored.tsx`:

```typescript
// Add import at top
import { VideoSplitTool } from "./tools/video/video-split-tool";

// Add to appropriate section
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  <VideoSplitTool />
</div>
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

## Testing Your Extracted Tool

After extracting a tool:

1. **Import it** in `media-tools-content-refactored.tsx`
2. **Run the dev server:** `npm run dev`
3. **Navigate to:** http://localhost:3000/workspace/media-tools
4. **Click on your tool card** to open the dialog
5. **Test all form fields** work correctly
6. **Submit a test request** and verify it processes

## Benefits of This Architecture

### Before Refactoring
- ❌ 3,033 lines in one file
- ❌ Hard to find specific tool logic
- ❌ All state mixed together
- ❌ Difficult to test individual tools
- ❌ Merge conflicts when multiple developers work

### After Refactoring
- ✅ ~150-500 lines per tool file
- ✅ Easy to locate and edit specific tools
- ✅ Isolated state per component
- ✅ Each tool can be tested independently
- ✅ No conflicts when adding new tools
- ✅ **To add a new tool:** Just create a new file and import it!

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

## Tips & Tricks

### Finding State Variables Quickly
Use regex search: `// .*Tool.*state$` to find all state declaration comments

### Finding Handler Functions
Use regex search: `const handle.*Submit.*=.*async` to find all handlers

### Finding Dialog Components
Search for the tool name in DialogTitle, for example: "Video Split"

### Handling Complex State
For tools with complex nested state (like FFmpeg Compose), keep the structure but simplify variable names:

```typescript
// Complex arrays and objects are fine!
const [inputs, setInputs] = useState([
  { file_url: "", options: [{ option: "", argument: "" }] }
]);
```

### Reusing Helper Functions
If multiple tools share logic, create a `utils/` folder:
```
tools/
├── utils/
│   ├── validation.ts
│   └── api-client.ts
```

## Questions?

- Check existing extracted tools for reference
- Follow the pattern established in `audio-concatenate-tool.tsx` (simplest example)
- For complex tools, reference `video-caption-tool.tsx`

## Migration Checklist

When you've extracted all tools:

- [ ] All 18+ tools extracted to separate files
- [ ] All tools imported in `media-tools-content-refactored.tsx`
- [ ] All placeholder cards removed
- [ ] Original `media-tools-content.tsx` backed up
- [ ] Refactored file renamed to `media-tools-content.tsx`
- [ ] All tools tested and working
- [ ] Update imports in `page.tsx` if needed
- [ ] Run `npm run build` to verify no errors
- [ ] Run `npm run lint` to check code quality
