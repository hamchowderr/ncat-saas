"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ShotView =
  | "all-shots"
  | "images"
  | "audio"
  | "video"
  | "upload"
  | "generate-image"
  | "generate-audio"
  | "generate-video"
  | "build-final-shot"
  | "run-generate-image"
  | "run-generate-audio"
  | "run-generate-video"
  | "all-data";

interface ViewSelectorProps {
  currentView: ShotView;
  onViewChange: (view: ShotView) => void;
}

export function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  return (
    <div className="w-full overflow-x-auto">
      <Tabs value={currentView} onValueChange={(value) => onViewChange(value as ShotView)}>
        <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full">
          <TabsTrigger value="all-shots" className="text-xs whitespace-nowrap">
            🎬 All Shots
          </TabsTrigger>
          <TabsTrigger value="images" className="text-xs whitespace-nowrap">
            🖼️ Images
          </TabsTrigger>
          <TabsTrigger value="audio" className="text-xs whitespace-nowrap">
            🎵 Audio
          </TabsTrigger>
          <TabsTrigger value="video" className="text-xs whitespace-nowrap">
            🎥 Video
          </TabsTrigger>
          <TabsTrigger value="upload" className="text-xs whitespace-nowrap">
            📤 Upload
          </TabsTrigger>
          <TabsTrigger value="generate-image" className="text-xs whitespace-nowrap">
            🪄 Generate Image
          </TabsTrigger>
          <TabsTrigger value="generate-audio" className="text-xs whitespace-nowrap">
            🪄 Generate Audio
          </TabsTrigger>
          <TabsTrigger value="generate-video" className="text-xs whitespace-nowrap">
            🪄 Generate Video
          </TabsTrigger>
          <TabsTrigger value="build-final-shot" className="text-xs whitespace-nowrap">
            🏗️ Build Final Shot
          </TabsTrigger>
          <TabsTrigger value="run-generate-image" className="text-xs whitespace-nowrap">
            ▶️ Run Generate Image
          </TabsTrigger>
          <TabsTrigger value="run-generate-audio" className="text-xs whitespace-nowrap">
            ▶️ Run Generate Audio
          </TabsTrigger>
          <TabsTrigger value="run-generate-video" className="text-xs whitespace-nowrap">
            ▶️ Run Generate Video
          </TabsTrigger>
          <TabsTrigger value="all-data" className="text-xs whitespace-nowrap">
            📊 All Data & Fields
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
