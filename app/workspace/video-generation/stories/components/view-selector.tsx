"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type StoryView =
  | "active-story"
  | "manage-media"
  | "manage-story"
  | "archived"
  | "generate-story"
  | "add-scenes-shots"
  | "combine-scenes"
  | "build-final-story"
  | "build-final-cut"
  | "add-captions";

interface ViewSelectorProps {
  currentView: StoryView;
  onViewChange: (view: StoryView) => void;
}

export function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  return (
    <div className="w-full overflow-x-auto">
      <Tabs value={currentView} onValueChange={(value) => onViewChange(value as StoryView)}>
        <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full">
          <TabsTrigger value="active-story" className="text-xs whitespace-nowrap">
            ✅ Active Story
          </TabsTrigger>
          <TabsTrigger value="manage-media" className="text-xs whitespace-nowrap">
            🎥 Manage Media
          </TabsTrigger>
          <TabsTrigger value="manage-story" className="text-xs whitespace-nowrap">
            📝 Manage Story
          </TabsTrigger>
          <TabsTrigger value="archived" className="text-xs whitespace-nowrap">
            🏛️ Archived
          </TabsTrigger>
          <TabsTrigger value="generate-story" className="text-xs whitespace-nowrap">
            🪄 Generate Story
          </TabsTrigger>
          <TabsTrigger value="add-scenes-shots" className="text-xs whitespace-nowrap">
            🏗️ Add Scenes/Shots
          </TabsTrigger>
          <TabsTrigger value="combine-scenes" className="text-xs whitespace-nowrap">
            🏗️ Combine Scenes
          </TabsTrigger>
          <TabsTrigger value="build-final-story" className="text-xs whitespace-nowrap">
            🏗️ Build Final Story
          </TabsTrigger>
          <TabsTrigger value="build-final-cut" className="text-xs whitespace-nowrap">
            🏗️ Final Cut (captions)
          </TabsTrigger>
          <TabsTrigger value="add-captions" className="text-xs whitespace-nowrap">
            🏗️ Add Captions
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
