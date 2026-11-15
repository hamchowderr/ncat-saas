"use client";

import { Row } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Database } from "@/lib/database.types";
import { SceneFormDialog } from "@/components/scenes/scene-form-dialog";
import { SceneDeleteDialog } from "@/components/scenes/scene-delete-dialog";

type Scene = Database["public"]["Tables"]["scenes"]["Row"] & {
  stories: {
    id: string;
    title: string;
    user_id: string;
  } | null;
};

interface SceneRowActionsProps<TData> {
  row: Row<TData>;
}

export function SceneRowActions<TData>({ row }: SceneRowActionsProps<TData>) {
  const router = useRouter();
  const scene = row.original as Scene;

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleApproved = async () => {
    setIsToggling(true);

    try {
      const response = await fetch(`/api/workspace/scenes/${scene.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: !scene.approved })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to toggle scene approval");
      }

      toast.success(scene.approved ? "Scene unapproved" : "Scene approved");
      router.refresh();
    } catch (error) {
      console.error("Error toggling scene approval:", error);
      toast.error(error instanceof Error ? error.message : "Failed to toggle scene approval");
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
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem onClick={handleToggleApproved} disabled={isToggling}>
            {scene.approved ? (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Unapprove
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Scene
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SceneFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        scene={
          scene.story_id
            ? {
                id: scene.id,
                story_id: scene.story_id,
                title: scene.title,
                description: scene.description,
                sequence_number: scene.sequence_number,
                duration_seconds: scene.duration_seconds,
                status: scene.status as "planned" | "generating" | "completed" | "failed",
                scene_script: scene.scene_script,
                approved: scene.approved ?? false
              }
            : undefined
        }
        mode="edit"
      />

      <SceneDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        scene={{ id: scene.id, title: scene.title }}
      />
    </>
  );
}
