"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type StoryTypeView =
  | "properties"
  | "prompting"
  | "ai-actions"
  | "approvals"
  | "inactive";

interface ViewSelectorProps {
  currentView: StoryTypeView;
  onViewChange: (view: StoryTypeView) => void;
}

export function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  return (
    <Tabs value={currentView} onValueChange={(value) => onViewChange(value as StoryTypeView)}>
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="properties" className="text-xs">
          ⚙️ Properties
        </TabsTrigger>
        <TabsTrigger value="prompting" className="text-xs">
          📝 Prompting
        </TabsTrigger>
        <TabsTrigger value="ai-actions" className="text-xs">
          🪄 AI Actions
        </TabsTrigger>
        <TabsTrigger value="approvals" className="text-xs">
          ✅ Approvals
        </TabsTrigger>
        <TabsTrigger value="inactive" className="text-xs">
          In-Active
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
