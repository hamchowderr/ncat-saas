"use client";

import { Row } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash, CheckCircle, Star, StarOff, Archive } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Database } from "@/lib/database.types";
import { StoryFormDialog } from "@/components/stories/story-form-dialog";
import { StoryDeleteDialog } from "@/components/stories/story-delete-dialog";

type Story = Database["public"]["Tables"]["stories"]["Row"];

interface StoryRowActionsProps<TData> {
  row: Row<TData>;
}

export function StoryRowActions<TData>({ row }: StoryRowActionsProps<TData>) {
  const router = useRouter();
  const story = row.original as Story;

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleToggleActive = async () => {
    setIsToggling(true);

    try {
      const response = await fetch(`/api/workspace/stories/${story.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active_story: !story.active_story })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to toggle active story");
      }

      toast.success(story.active_story ? "Story deactivated" : "Story marked as active");
      router.refresh();
    } catch (error) {
      console.error("Error toggling active story:", error);
      toast.error(error instanceof Error ? error.message : "Failed to toggle story");
    } finally {
      setIsToggling(false);
    }
  };

  const handleToggleApproved = async () => {
    setIsToggling(true);

    try {
      const response = await fetch(`/api/workspace/stories/${story.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: !story.approved })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to toggle approval");
      }

      toast.success(story.approved ? "Story approval removed" : "Story approved for generation");
      router.refresh();
    } catch (error) {
      console.error("Error toggling approval:", error);
      toast.error(error instanceof Error ? error.message : "Failed to toggle approval");
    } finally {
      setIsToggling(false);
    }
  };

  const handleArchive = async () => {
    setIsToggling(true);

    try {
      const newStatus = story.status === "archived" ? "draft" : "archived";

      const response = await fetch(`/api/workspace/stories/${story.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to archive story");
      }

      toast.success(story.status === "archived" ? "Story unarchived" : "Story archived");
      router.refresh();
    } catch (error) {
      console.error("Error archiving story:", error);
      toast.error(error instanceof Error ? error.message : "Failed to archive story");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <DropdownMenu modal={false} open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="data-[state=open]:bg-muted size-8">
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>

          <DropdownMenuItem onClick={handleToggleActive} disabled={isToggling}>
            {story.active_story ? (
              <>
                <StarOff className="mr-2 h-4 w-4" />
                Remove Active
              </>
            ) : (
              <>
                <Star className="mr-2 h-4 w-4" />
                Set as Active
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleToggleApproved} disabled={isToggling}>
            <CheckCircle className="mr-2 h-4 w-4" />
            {story.approved ? "Unapprove" : "Approve"}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleArchive} disabled={isToggling}>
            <Archive className="mr-2 h-4 w-4" />
            {story.status === "archived" ? "Unarchive" : "Archive"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              alert("Edit clicked!");
              setDropdownOpen(false); // Close dropdown first
              setShowEditDialog(true);
              alert(`Dialog state set to: ${true}`);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Story
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <StoryFormDialog
        open={showEditDialog}
        onOpenChange={(isOpen) => {
          console.log("[StoryRowActions] setShowEditDialog called with:", isOpen);
          setShowEditDialog(isOpen);
        }}
        story={{
          id: story.id,
          title: story.title,
          description: story.description,
          story_type_id: story.story_type_id,
          status: story.status || "draft",
          active_story: story.active_story ?? false,
          approved: story.approved ?? false,
          approve_source: story.approve_source ?? false
        }}
        mode="edit"
      />

      <StoryDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        storyId={story.id}
        storyTitle={story.title}
      />
    </>
  );
}
