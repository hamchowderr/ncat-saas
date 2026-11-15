"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoryTypeFormDialog } from "@/components/story-types/story-type-form-dialog";
import { StoryTypePromptingDialog } from "@/components/story-types/story-type-prompting-dialog";
import { StoryTypeView } from "./view-selector";

interface StoryTypesHeaderProps {
  currentView: StoryTypeView;
}

export function StoryTypesHeader({ currentView }: StoryTypesHeaderProps) {
  // Separate state for each dialog to prevent conflicts
  const [showPropertiesDialog, setShowPropertiesDialog] = useState(false);
  const [showPromptingDialog, setShowPromptingDialog] = useState(false);

  // Close all dialogs when view changes (cleanup)
  useEffect(() => {
    setShowPropertiesDialog(false);
    setShowPromptingDialog(false);
  }, [currentView]);

  // Determine if we should show create button based on view
  const showCreateButton = currentView === "properties" || currentView === "prompting";

  // Get contextual button label based on current view
  const getButtonLabel = () => {
    switch (currentView) {
      case "properties":
        return "Create Story Type";
      case "prompting":
        return "Create AI Prompts";
      default:
        return "Create Story Type";
    }
  };

  // Handle button click - open the correct dialog based on current view
  const handleCreateClick = () => {
    if (currentView === "properties") {
      setShowPropertiesDialog(true);
    } else if (currentView === "prompting") {
      setShowPromptingDialog(true);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Story Types</h1>
          <p className="text-muted-foreground mt-2">
            Manage video story templates and presets for different platforms and styles. System
            templates can be toggled on/off, while custom templates can be fully edited or deleted.
          </p>
        </div>
        {showCreateButton && (
          <Button onClick={handleCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            {getButtonLabel()}
          </Button>
        )}
      </div>

      {/* Each dialog has independent state - no conflicts */}
      <StoryTypeFormDialog
        open={showPropertiesDialog}
        onOpenChange={setShowPropertiesDialog}
        mode="create"
      />

      <StoryTypePromptingDialog
        open={showPromptingDialog}
        onOpenChange={setShowPromptingDialog}
        mode="create"
      />
    </>
  );
}
