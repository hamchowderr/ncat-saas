"use client";

import { Row } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash, Power, PowerOff } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { StoryTypeFormDialog } from "@/components/story-types/story-type-form-dialog";
import { StoryTypeDeleteDialog } from "@/components/story-types/story-type-delete-dialog";

type StoryType = Database["public"]["Tables"]["story_types"]["Row"];

interface StoryTypeRowActionsProps<TData> {
  row: Row<TData>;
}

export function StoryTypeRowActions<TData>({ row }: StoryTypeRowActionsProps<TData>) {
  const queryClient = useQueryClient();
  const storyType = row.original as StoryType;

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleActive = async () => {
    setIsToggling(true);

    try {
      const response = await fetch(`/api/workspace/story-types/${storyType.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !storyType.is_active })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to toggle story type");
      }

      toast.success(
        storyType.is_active ? "Story type deactivated" : "Story type activated"
      );
      // Invalidate query cache instead of router.refresh()
      queryClient.invalidateQueries({ queryKey: ["story-types"] });
    } catch (error) {
      console.error("Error toggling story type:", error);
      toast.error(error instanceof Error ? error.message : "Failed to toggle story type");
    } finally {
      setIsToggling(false);
    }
  };

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
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
          <DropdownMenuItem onClick={handleToggleActive} disabled={isToggling}>
            {storyType.is_active ? (
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <StoryTypeFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        storyType={storyType}
        mode="edit"
      />

      <StoryTypeDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        storyTypeId={storyType.id}
        storyTypeName={storyType.name}
      />
    </>
  );
}
