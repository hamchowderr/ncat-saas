"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

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
import { Button } from "@/components/ui/button";

interface StoryTypeDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storyTypeId: string;
  storyTypeName: string;
}

export function StoryTypeDeleteDialog({
  open,
  onOpenChange,
  storyTypeId,
  storyTypeName
}: StoryTypeDeleteDialogProps) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/workspace/story-types/${storyTypeId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete story type");
      }

      toast.success("Story type deleted successfully");
      onOpenChange(false);
      // Invalidate query cache instead of router.refresh()
      queryClient.invalidateQueries({ queryKey: ["story-types"] });
    } catch (error) {
      console.error("Error deleting story type:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete story type");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-destructive/10 text-destructive flex h-10 w-10 items-center justify-center rounded-full">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <AlertDialogTitle>Delete Story Type</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Are you sure you want to delete <strong>{storyTypeName}</strong>? This action cannot be
            undone.
            <br />
            <br />
            Any stories using this template will need to be updated with a different story type.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
