"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SceneView } from "./view-selector";

interface ViewSelectorImprovedProps {
  currentView: SceneView;
  onViewChange: (view: SceneView) => void;
}

const views = [
  { value: "all-scenes" as const, label: "🎬 All Scenes" },
  { value: "audio" as const, label: "🎵 Audio" },
  { value: "video" as const, label: "🎥 Video" },
  { value: "uploads" as const, label: "📤 Uploads" },
  { value: "combine-shots" as const, label: "🏗️ Combine Shots" },
  { value: "build-final-scene" as const, label: "🏗️ Build Final Scene" }
];

export function ViewSelectorImproved({ currentView, onViewChange }: ViewSelectorImprovedProps) {
  const currentViewLabel = views.find((v) => v.value === currentView)?.label || "Select view...";

  return (
    <div className="w-full max-w-xs">
      <Select value={currentView} onValueChange={(value) => onViewChange(value as SceneView)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select view...">{currentViewLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {views.map((view) => (
            <SelectItem key={view.value} value={view.value}>
              {view.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
