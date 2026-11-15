"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StoryView } from "./view-selector";

interface ViewSelectorImprovedProps {
  currentView: StoryView;
  onViewChange: (view: StoryView) => void;
}

const viewGroups = {
  management: [
    { value: "active-story" as const, label: "✅ Active Story" },
    { value: "manage-media" as const, label: "🎥 Manage Media" },
    { value: "manage-story" as const, label: "📝 Manage Story" },
    { value: "archived" as const, label: "🏛️ Archived" }
  ],
  workflow: [
    { value: "generate-story" as const, label: "🪄 Generate Story" },
    { value: "add-scenes-shots" as const, label: "🏗️ Add Scenes/Shots" },
    { value: "combine-scenes" as const, label: "🏗️ Combine Scenes" },
    { value: "build-final-story" as const, label: "🏗️ Build Final Story" },
    { value: "build-final-cut" as const, label: "🏗️ Final Cut" },
    { value: "add-captions" as const, label: "🏗️ Add Captions" }
  ]
};

const allViews = [
  ...viewGroups.management,
  ...viewGroups.workflow
];

export function ViewSelectorImproved({ currentView, onViewChange }: ViewSelectorImprovedProps) {
  const currentViewLabel = allViews.find((v) => v.value === currentView)?.label || "Select view...";

  return (
    <div className="w-full max-w-xs">
      <Select value={currentView} onValueChange={(value) => onViewChange(value as StoryView)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select view...">{currentViewLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Management</SelectLabel>
            {viewGroups.management.map((view) => (
              <SelectItem key={view.value} value={view.value}>
                {view.label}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Workflow</SelectLabel>
            {viewGroups.workflow.map((view) => (
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
