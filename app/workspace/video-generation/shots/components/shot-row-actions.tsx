"use client";

import { Row } from "@tanstack/react-table";
import {
  Edit,
  MoreHorizontal,
  Trash,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Volume2,
  Video,
  Play
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Database } from "@/lib/database.types";
import { ShotFormDialog } from "@/components/shots/shot-form-dialog";
import { ShotDeleteDialog } from "@/components/shots/shot-delete-dialog";

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

interface ShotRowActionsProps<TData> {
  row: Row<TData>;
}

export function ShotRowActions<TData>({ row }: ShotRowActionsProps<TData>) {
  const router = useRouter();
  const shot = row.original as Shot;

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async (field: string, currentValue: boolean, label: string) => {
    setIsToggling(true);

    try {
      const response = await fetch(`/api/workspace/shots/${shot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !currentValue })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to toggle ${label}`);
      }

      toast.success(`${label} ${currentValue ? "disabled" : "enabled"}`);
      router.refresh();
    } catch (error) {
      console.error(`Error toggling ${label}:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to toggle ${label}`);
    } finally {
      setIsToggling(false);
    }
  };

  const handleRunAll = async () => {
    setIsToggling(true);

    try {
      const response = await fetch(`/api/workspace/shots/${shot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_go: true,
          audio_go: true,
          video_go: true,
          approved: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to run all generations");
      }

      toast.success("All generation triggers enabled");
      router.refresh();
    } catch (error) {
      console.error("Error running all:", error);
      toast.error(error instanceof Error ? error.message : "Failed to run all generations");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="data-[state=open]:bg-muted size-8">
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[220px]">
          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => handleToggle("approved", shot.approved ?? false, "Approval")}
            disabled={isToggling}
          >
            {shot.approved ? (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Unapprove Shot
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve Shot
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Generation Triggers</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => handleToggle("image_go", shot.image_go ?? false, "Image Generation")}
            disabled={isToggling}
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            {shot.image_go ? "Disable" : "Enable"} Image
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleToggle("audio_go", shot.audio_go ?? false, "Audio Generation")}
            disabled={isToggling}
          >
            <Volume2 className="mr-2 h-4 w-4" />
            {shot.audio_go ? "Disable" : "Enable"} Audio
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleToggle("video_go", shot.video_go ?? false, "Video Generation")}
            disabled={isToggling}
          >
            <Video className="mr-2 h-4 w-4" />
            {shot.video_go ? "Disable" : "Enable"} Video
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleRunAll} disabled={isToggling} className="text-green-600">
            <Play className="mr-2 h-4 w-4" />
            Run All Generations
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Shot
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ShotFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        shot={
          shot.scene_id
            ? {
                id: shot.id,
                scene_id: shot.scene_id,
                title: shot.title,
                description: shot.description,
                sequence_number: shot.sequence_number,
                duration_seconds: shot.duration_seconds,
                shot_type: shot.shot_type,
                camera_angle: shot.camera_angle,
                status: shot.status as "pending" | "generating" | "completed" | "failed",
                shot_script: shot.shot_script,
                image_prompt: shot.image_prompt,
                audio_prompt: shot.audio_prompt,
                video_prompt: shot.video_prompt,
                approved: shot.approved ?? false,
                image_go: shot.image_go ?? false,
                audio_go: shot.audio_go ?? false,
                video_go: shot.video_go ?? false
              }
            : undefined
        }
        mode="edit"
      />

      <ShotDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        shot={{ id: shot.id, title: shot.title }}
      />
    </>
  );
}
