"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { StoryView } from "./view-selector";
import { ViewSelectorImproved as ViewSelector } from "./view-selector-improved";
import { StoryFormDialog } from "@/components/stories/story-form-dialog";
import {
  activeStoryColumns,
  manageMediaColumns,
  manageStoryColumns,
  generateStoryColumns,
  workflowColumns
} from "./view-columns";

type Story = Database["public"]["Tables"]["stories"]["Row"] & {
  story_types: {
    id: string;
    name: string;
    description: string | null;
  } | null;
};

interface StoriesClientProps {
  initialData: Story[];
}

export function StoriesClient({ initialData }: StoriesClientProps) {
  const [currentView, setCurrentView] = useState<StoryView>("active-story");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Filter data based on the current view
  const filteredData = useMemo(() => {
    switch (currentView) {
      case "archived":
        return initialData.filter((story) => story.status === "archived");
      case "active-story":
        // Show only active stories (not archived)
        return initialData.filter((story) => story.active_story === true);
      case "manage-media":
      case "manage-story":
      case "generate-story":
        // Show all non-archived stories
        return initialData.filter((story) => story.status !== "archived");
      case "add-scenes-shots":
      case "combine-scenes":
      case "build-final-story":
      case "build-final-cut":
      case "add-captions":
        // Workflow views - show stories that are ready for these stages
        return initialData.filter((story) => story.status !== "archived");
      default:
        return initialData;
    }
  }, [initialData, currentView]);

  // Select the appropriate columns based on the current view
  const columns = useMemo(() => {
    switch (currentView) {
      case "active-story":
        return activeStoryColumns as any;
      case "manage-media":
        return manageMediaColumns as any;
      case "manage-story":
        return manageStoryColumns as any;
      case "archived":
        return manageStoryColumns as any; // Use manage story columns for archived view
      case "generate-story":
        return generateStoryColumns as any;
      case "add-scenes-shots":
      case "combine-scenes":
      case "build-final-story":
      case "build-final-cut":
      case "add-captions":
        return workflowColumns as any;
      default:
        return activeStoryColumns as any;
    }
  }, [currentView]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stories</h1>
          <p className="text-muted-foreground">
            Manage your video generation stories and faceless video projects.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Story
        </Button>
      </div>
      <ViewSelector currentView={currentView} onViewChange={setCurrentView} />
      <DataTable data={filteredData} columns={columns} />

      <StoryFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        mode="create"
      />
    </div>
  );
}
