"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShotView } from "./view-selector";

interface ViewSelectorImprovedProps {
  currentView: ShotView;
  onViewChange: (view: ShotView) => void;
}

const viewGroups = {
  overview: [
    { value: "all-shots" as const, label: "🎬 All Shots", emoji: "🎬" }
  ],
  assets: [
    { value: "images" as const, label: "🖼️ Images", emoji: "🖼️" },
    { value: "audio" as const, label: "🎵 Audio", emoji: "🎵" },
    { value: "video" as const, label: "🎥 Video", emoji: "🎥" },
    { value: "upload" as const, label: "📤 Upload", emoji: "📤" }
  ],
  generation: [
    { value: "generate-image" as const, label: "🪄 Generate Image", emoji: "🪄" },
    { value: "generate-audio" as const, label: "🪄 Generate Audio", emoji: "🪄" },
    { value: "generate-video" as const, label: "🪄 Generate Video", emoji: "🪄" },
    { value: "build-final-shot" as const, label: "🏗️ Build Final Shot", emoji: "🏗️" }
  ],
  automation: [
    { value: "run-generate-image" as const, label: "▶️ Run Generate Image", emoji: "▶️" },
    { value: "run-generate-audio" as const, label: "▶️ Run Generate Audio", emoji: "▶️" },
    { value: "run-generate-video" as const, label: "▶️ Run Generate Video", emoji: "▶️" }
  ]
};

const allViews = [
  ...viewGroups.overview,
  ...viewGroups.assets,
  ...viewGroups.generation,
  ...viewGroups.automation
];

export function ViewSelectorImproved({ currentView, onViewChange }: ViewSelectorImprovedProps) {
  const currentViewLabel = allViews.find((v) => v.value === currentView)?.label || "Select view...";

  return (
    <div className="w-full max-w-xs">
      <Select value={currentView} onValueChange={(value) => onViewChange(value as ShotView)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select view...">{currentViewLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Overview</SelectLabel>
            {viewGroups.overview.map((view) => (
              <SelectItem key={view.value} value={view.value}>
                {view.label}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Assets</SelectLabel>
            {viewGroups.assets.map((view) => (
              <SelectItem key={view.value} value={view.value}>
                {view.label}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Generation</SelectLabel>
            {viewGroups.generation.map((view) => (
              <SelectItem key={view.value} value={view.value}>
                {view.label}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Automation</SelectLabel>
            {viewGroups.automation.map((view) => (
              <SelectItem key={view.value} value={view.value}>
                {view.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
