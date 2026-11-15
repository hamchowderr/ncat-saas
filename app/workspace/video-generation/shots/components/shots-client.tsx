"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { ShotView } from "./view-selector";
import { ViewSelectorImproved as ViewSelector } from "./view-selector-improved";
import { ShotFormDialog } from "@/components/shots/shot-form-dialog";
import {
  allShotsColumns,
  imagesColumns,
  audioColumns,
  videoColumns,
  uploadColumns,
  generateImageColumns,
  generateAudioColumns,
  generateVideoColumns,
  buildFinalShotColumns,
  runGenerateImageColumns,
  runGenerateAudioColumns,
  runGenerateVideoColumns,
  allDataColumns
} from "./view-columns";

type Shot = Database["public"]["Tables"]["shots"]["Row"] & {
  scenes: {
    id: string;
    title: string;
    sequence_number: number;
    stories: {
      id: string;
      title: string;
      user_id: string;
    };
  } | null;
};

interface ShotsClientProps {
  initialData: Shot[];
}

export function ShotsClient({ initialData }: ShotsClientProps) {
  const [currentView, setCurrentView] = useState<ShotView>("all-shots");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Filter data based on the current view
  const filteredData = useMemo(() => {
    switch (currentView) {
      case "images":
        // Show shots with images or ready for image generation
        return initialData.filter((shot) => shot.image_url || shot.image_go);
      case "audio":
        // Show shots with audio or ready for audio generation
        return initialData.filter((shot) => shot.audio_url || shot.audio_go);
      case "video":
        // Show shots with video or ready for video generation
        return initialData.filter((shot) => shot.video_url || shot.video_go);
      case "upload":
        // Show shots with thumbnails or final shots
        return initialData.filter((shot) => shot.thumbnail_url || shot.final_shot_url);
      case "generate-image":
        // Show shots with image prompts ready for generation
        return initialData.filter((shot) => shot.image_prompt);
      case "generate-audio":
        // Show shots with scripts ready for audio generation
        return initialData.filter((shot) => shot.shot_script);
      case "generate-video":
        // Show shots with video prompts ready for generation
        return initialData.filter((shot) => shot.video_prompt);
      case "build-final-shot":
        // Show shots with all assets ready for composition
        return initialData.filter(
          (shot) => shot.image_url && shot.audio_url && shot.video_url
        );
      case "run-generate-image":
        // Show shots with image_go trigger enabled
        return initialData.filter((shot) => shot.image_go);
      case "run-generate-audio":
        // Show shots with audio_go trigger enabled
        return initialData.filter((shot) => shot.audio_go);
      case "run-generate-video":
        // Show shots with video_go trigger enabled
        return initialData.filter((shot) => shot.video_go);
      case "all-data":
      case "all-shots":
      default:
        return initialData;
    }
  }, [initialData, currentView]);

  // Select the appropriate columns based on the current view
  const columns = useMemo(() => {
    switch (currentView) {
      case "all-shots":
        return allShotsColumns as any;
      case "images":
        return imagesColumns as any;
      case "audio":
        return audioColumns as any;
      case "video":
        return videoColumns as any;
      case "upload":
        return uploadColumns as any;
      case "generate-image":
        return generateImageColumns as any;
      case "generate-audio":
        return generateAudioColumns as any;
      case "generate-video":
        return generateVideoColumns as any;
      case "build-final-shot":
        return buildFinalShotColumns as any;
      case "run-generate-image":
        return runGenerateImageColumns as any;
      case "run-generate-audio":
        return runGenerateAudioColumns as any;
      case "run-generate-video":
        return runGenerateVideoColumns as any;
      case "all-data":
        return allDataColumns as any;
      default:
        return allShotsColumns as any;
    }
  }, [currentView]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shots</h1>
          <p className="text-muted-foreground">
            Manage individual video shots and camera angles for your scenes.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Shot
        </Button>
      </div>
      <ViewSelector currentView={currentView} onViewChange={setCurrentView} />
      <DataTable data={filteredData} columns={columns} />

      <ShotFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        mode="create"
      />
    </div>
  );
}
