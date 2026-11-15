"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type SceneView =
  | "all-scenes"
  | "audio"
  | "video"
  | "uploads"
  | "combine-shots"
  | "build-final-scene"
  | "all-data";

interface ViewSelectorProps {
  currentView: SceneView;
  onViewChange: (view: SceneView) => void;
}

export function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  return (
    <div className="w-full overflow-x-auto">
      <Tabs value={currentView} onValueChange={(value) => onViewChange(value as SceneView)}>
        <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full">
          <TabsTrigger value="all-scenes" className="text-xs whitespace-nowrap">
            🎬 All Scenes
          </TabsTrigger>
          <TabsTrigger value="audio" className="text-xs whitespace-nowrap">
            🎵 Audio
          </TabsTrigger>
          <TabsTrigger value="video" className="text-xs whitespace-nowrap">
            🎥 Video
          </TabsTrigger>
          <TabsTrigger value="uploads" className="text-xs whitespace-nowrap">
            📤 Uploads
          </TabsTrigger>
          <TabsTrigger value="combine-shots" className="text-xs whitespace-nowrap">
            🏗️ Combine Shots
          </TabsTrigger>
          <TabsTrigger value="build-final-scene" className="text-xs whitespace-nowrap">
            🏗️ Build Final Scene
          </TabsTrigger>
          <TabsTrigger value="all-data" className="text-xs whitespace-nowrap">
            📊 All Data & Fields
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
