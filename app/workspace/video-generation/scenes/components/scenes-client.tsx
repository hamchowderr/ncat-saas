"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { SceneView } from "./view-selector";
import { ViewSelectorImproved as ViewSelector } from "./view-selector-improved";
import { SceneFormDialog } from "@/components/scenes/scene-form-dialog";
import {
  allScenesColumns,
  audioColumns,
  videoColumns,
  uploadsColumns,
  combineShotsColumns,
  buildFinalSceneColumns,
  allDataColumns
} from "./view-columns";

type Scene = Database["public"]["Tables"]["scenes"]["Row"] & {
  stories: {
    id: string;
    title: string;
    user_id: string;
  } | null;
};

interface ScenesClientProps {
  initialData: Scene[];
}

export function ScenesClient({ initialData }: ScenesClientProps) {
  const [currentView, setCurrentView] = useState<SceneView>("all-scenes");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Filter data based on the current view
  const filteredData = useMemo(() => {
    switch (currentView) {
      case "audio":
        // Show scenes that have audio or need audio generation
        return initialData;
      case "video":
        // Show scenes that have video or need video generation
        return initialData;
      case "uploads":
        // Show all scenes (uploads view shows available media)
        return initialData;
      case "combine-shots":
      case "build-final-scene":
        // Workflow views - show approved scenes ready for processing
        return initialData.filter((scene) => scene.approved);
      case "all-scenes":
      default:
        return initialData;
    }
  }, [initialData, currentView]);

  // Select the appropriate columns based on the current view
  const columns = useMemo(() => {
    switch (currentView) {
      case "all-scenes":
        return allScenesColumns as any;
      case "audio":
        return audioColumns as any;
      case "video":
        return videoColumns as any;
      case "uploads":
        return uploadsColumns as any;
      case "combine-shots":
        return combineShotsColumns as any;
      case "build-final-scene":
        return buildFinalSceneColumns as any;
      case "all-data":
        return allDataColumns as any;
      default:
        return allScenesColumns as any;
    }
  }, [currentView]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scenes</h1>
          <p className="text-muted-foreground">
            Manage video generation scenes and scene breakdowns for your stories.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Scene
        </Button>
      </div>
      <ViewSelector currentView={currentView} onViewChange={setCurrentView} />
      <DataTable data={filteredData} columns={columns} />

      <SceneFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        mode="create"
      />
    </div>
  );
}
