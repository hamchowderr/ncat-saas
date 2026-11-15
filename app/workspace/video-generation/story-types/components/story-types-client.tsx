"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Database } from "@/lib/database.types";
import { DataTable } from "./data-table";
import { StoryTypesHeader } from "./story-types-header";
import { StoryTypeView } from "./view-selector";
import { ViewSelectorImproved as ViewSelector } from "./view-selector-improved";
import {
  getPropertiesColumns,
  getPromptingColumns,
  getAiActionsColumns,
  getApprovalsColumns
} from "./view-columns";

type StoryType = Database["public"]["Tables"]["story_types"]["Row"];

interface StoryTypesClientProps {
  initialData: StoryType[];
}

// Fetch story types from API
async function fetchStoryTypes(): Promise<StoryType[]> {
  const response = await fetch("/api/workspace/story-types");
  if (!response.ok) {
    throw new Error("Failed to fetch story types");
  }
  return response.json();
}

export function StoryTypesClient({ initialData }: StoryTypesClientProps) {
  const [currentView, setCurrentView] = useState<StoryTypeView>("properties");
  const queryClient = useQueryClient();

  // Use React Query for data fetching with initial data from server
  const { data: storyTypes = initialData } = useQuery({
    queryKey: ["story-types"],
    queryFn: fetchStoryTypes,
    initialData: initialData,
    staleTime: 30000 // 30 seconds
  });

  // Callback to update a story type optimistically
  const updateStoryType = useCallback(
    (storyTypeId: string, updates: Partial<StoryType>) => {
      queryClient.setQueryData<StoryType[]>(["story-types"], (old) => {
        if (!old) return old;
        return old.map((st) => (st.id === storyTypeId ? { ...st, ...updates } : st));
      });
    },
    [queryClient]
  );

  // Filter data based on view
  const filteredData = useMemo(() => {
    if (currentView === "inactive") {
      return storyTypes.filter((st) => !st.is_active);
    }
    // All other views show only active story types
    return storyTypes.filter((st) => st.is_active);
  }, [storyTypes, currentView]);

  // Get columns based on view (pass updateStoryType callback)
  const columns = useMemo(() => {
    switch (currentView) {
      case "properties":
        return getPropertiesColumns(updateStoryType);
      case "prompting":
        return getPromptingColumns(updateStoryType);
      case "ai-actions":
        return getAiActionsColumns(updateStoryType);
      case "approvals":
        return getApprovalsColumns(updateStoryType);
      case "inactive":
        return getPropertiesColumns(updateStoryType); // Same as properties but filtered
      default:
        return getPropertiesColumns(updateStoryType);
    }
  }, [currentView, updateStoryType]);

  return (
    <div className="space-y-6">
      <StoryTypesHeader currentView={currentView} />
      <ViewSelector currentView={currentView} onViewChange={setCurrentView} />
      <DataTable data={filteredData} columns={columns} />
    </div>
  );
}
