"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface SceneDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scene: {
    id: string;
    title: string;
  };
}

export function SceneDeleteDialog({ open, onOpenChange, scene }: SceneDeleteDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/workspace/scenes/${scene.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete scene");
      }

      toast.success("Scene deleted successfully");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting scene:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete scene");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Scene</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &ldquo;{scene.title}&rdquo;? This will also delete all shots
            associated with this scene. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
