"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StoryTypeView } from "./view-selector";

interface ViewSelectorImprovedProps {
  currentView: StoryTypeView;
  onViewChange: (view: StoryTypeView) => void;
}

const views = [
  { value: "properties" as const, label: "⚙️ Properties" },
  { value: "prompting" as const, label: "📝 Prompting" },
  { value: "ai-actions" as const, label: "🪄 AI Actions" },
  { value: "approvals" as const, label: "✅ Approvals" },
  { value: "inactive" as const, label: "🚫 In-Active" }
];

export function ViewSelectorImproved({ currentView, onViewChange }: ViewSelectorImprovedProps) {
  const currentViewLabel = views.find((v) => v.value === currentView)?.label || "Select view...";

  return (
    <div className="w-full max-w-xs">
      <Select value={currentView} onValueChange={(value) => onViewChange(value as StoryTypeView)}>
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
