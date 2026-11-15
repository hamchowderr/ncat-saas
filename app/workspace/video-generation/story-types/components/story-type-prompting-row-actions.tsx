"use client";

import { Row } from "@tanstack/react-table";
import { Edit, MoreHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Database } from "@/lib/database.types";
import { StoryTypePromptingDialog } from "@/components/story-types/story-type-prompting-dialog";

type StoryType = Database["public"]["Tables"]["story_types"]["Row"];

interface StoryTypePromptingRowActionsProps<TData> {
  row: Row<TData>;
}

export function StoryTypePromptingRowActions<TData>({
  row
}: StoryTypePromptingRowActionsProps<TData>) {
  const storyType = row.original as StoryType;
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleEdit = () => {
    setShowEditDialog(true);
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
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Prompts
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <StoryTypePromptingDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        storyType={storyType}
        mode="edit"
      />
    </>
  );
}
