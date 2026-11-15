"use client";

import { useState } from "react";
import { PlusIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { NewChatDialog } from "./new-chat-dialog";

export function ActionDropdown() {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDialogChange = (open: boolean) => {
    setShowNewChatDialog(open);
  };

  const handleNewConversationClick = () => {
    setDropdownOpen(false); // Close dropdown FIRST
    setShowNewChatDialog(true); // Then open dialog
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full">
            <PlusIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleNewConversationClick}>
              New conversation
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Add contact</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <NewChatDialog open={showNewChatDialog} onOpenChange={handleDialogChange} />
    </>
  );
}
