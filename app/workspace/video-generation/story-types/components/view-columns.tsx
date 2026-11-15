"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Database } from "@/lib/database.types";
import { DataTableColumnHeader } from "@/app/workspace/jobs/components/data-table-column-header";
import { StoryTypeRowActions } from "./story-type-row-actions";
import { StoryTypePromptingRowActions } from "./story-type-prompting-row-actions";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

type StoryType = Database["public"]["Tables"]["story_types"]["Row"];

// Type for the update callback
type UpdateStoryTypeCallback = (storyTypeId: string, updates: Partial<StoryType>) => void;

// Toggle Switch Cell Component - Simplified following shadcn patterns
function ToggleSwitchCell({
  storyTypeId,
  field,
  value,
  label,
  onUpdate
}: {
  storyTypeId: string;
  field: string;
  value: boolean;
  label: string;
  onUpdate?: UpdateStoryTypeCallback;
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = useCallback(
    async (checked: boolean) => {
      setIsUpdating(true);
      const toastId = `${storyTypeId}-${field}-toggle`;

      try {
        // API call (no debouncing)
        const response = await fetch(`/api/workspace/story-types/${storyTypeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: checked })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Failed to update ${label}`);
        }

        // Update cache only after successful API response
        if (onUpdate) {
          onUpdate(storyTypeId, { [field]: checked } as Partial<StoryType>);
        }

        toast.success(`${label} ${checked ? "enabled" : "disabled"}`, { id: toastId });
      } catch (error) {
        console.error(`Error updating ${label}:`, error);
        toast.error(error instanceof Error ? error.message : `Failed to update ${label}`, {
          id: toastId
        });
      } finally {
        setIsUpdating(false);
      }
    },
    [storyTypeId, field, label, onUpdate]
  );

  return (
    <div className="flex justify-center items-center gap-2">
      <Switch checked={value} onCheckedChange={handleToggle} disabled={isUpdating} />
      <Badge
        variant={value ? "default" : "secondary"}
        className={cn(
          "text-xs font-medium",
          value
            ? "bg-green-600 hover:bg-green-700"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        )}
      >
        {value ? "ON" : "OFF"}
      </Badge>
    </div>
  );
}

// Common columns used across views
const selectColumn: ColumnDef<StoryType> = {
  id: "select",
  header: ({ table }) => (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
      className="translate-y-[2px]"
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
      className="translate-y-[2px]"
    />
  ),
  enableSorting: false,
  enableHiding: false
};

const nameColumn: ColumnDef<StoryType> = {
  accessorKey: "name",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Story Type" />,
  cell: ({ row }) => {
    const name = row.getValue("name") as string;
    return <div className="font-medium">{name}</div>;
  }
};

const actionsColumn: ColumnDef<StoryType> = {
  id: "actions",
  cell: ({ row }) => <StoryTypeRowActions row={row} />
};

// ⚙️ Properties View - Basic dimensions and settings
export function getPropertiesColumns(
  onUpdate?: UpdateStoryTypeCallback
): ColumnDef<StoryType>[] {
  return [
    selectColumn,
    nameColumn,
    {
      accessorKey: "width",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Width" />,
      cell: ({ row }) => {
        const width = row.getValue("width") as number | null;
        if (!width) return <span className="text-muted-foreground text-sm">-</span>;
        return <div className="text-center text-sm">{width}</div>;
      }
    },
    {
      accessorKey: "height",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Height" />,
      cell: ({ row }) => {
        const height = row.getValue("height") as number | null;
        if (!height) return <span className="text-muted-foreground text-sm">-</span>;
        return <div className="text-center text-sm text-blue-600 font-medium">{height}</div>;
      }
    },
    {
      id: "aspect_ratio",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Aspect Ratio" />,
      cell: ({ row }) => {
        const width = row.getValue("width") as number | null;
        const height = row.getValue("height") as number | null;

        if (!width || !height) {
          return <span className="text-muted-foreground text-sm">-</span>;
        }

        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const divisor = gcd(width, height);
        const aspectRatio = `${width / divisor}:${height / divisor}`;

        return <div className="text-center text-sm">{aspectRatio}</div>;
      }
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Active" />,
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        return (
          <ToggleSwitchCell
            storyTypeId={row.original.id}
            field="is_active"
            value={isActive ?? false}
            label="Active Status"
            onUpdate={onUpdate}
          />
        );
      }
    },
    actionsColumn
  ];
}

// 📝 Prompting View - AI prompt templates
export function getPromptingColumns(
  onUpdate?: UpdateStoryTypeCallback
): ColumnDef<StoryType>[] {
  return [
    selectColumn,
    nameColumn,
    {
      accessorKey: "story_prompt_system",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Story (System)" />,
      cell: ({ row }) => {
        const prompt = row.getValue("story_prompt_system") as string | null;
        if (!prompt) return <span className="text-muted-foreground text-xs">Not set</span>;
        return <div className="max-w-[300px] truncate text-xs">{prompt}</div>;
      }
    },
    {
      accessorKey: "story_prompt_user",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Story (User)" />,
      cell: ({ row }) => {
        const prompt = row.getValue("story_prompt_user") as string | null;
        if (!prompt) return <span className="text-muted-foreground text-xs">Not set</span>;
        return <div className="max-w-[300px] truncate text-xs">{prompt}</div>;
      }
    },
    {
      accessorKey: "scene_generation_prompt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Scene Generation" />,
      cell: ({ row }) => {
        const prompt = row.getValue("scene_generation_prompt") as string | null;
        if (!prompt) return <span className="text-muted-foreground text-xs">Not set</span>;
        return <div className="max-w-[300px] truncate text-xs">{prompt}</div>;
      }
    },
    {
      accessorKey: "shot_generation_system_prompt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Shot (System)" />,
      cell: ({ row }) => {
        const prompt = row.getValue("shot_generation_system_prompt") as string | null;
        if (!prompt) return <span className="text-muted-foreground text-xs">Not set</span>;
        return <div className="max-w-[300px] truncate text-xs">{prompt}</div>;
      }
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Active" />,
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        return (
          <ToggleSwitchCell
            storyTypeId={row.original.id}
            field="is_active"
            value={isActive ?? false}
            label="Active Status"
            onUpdate={onUpdate}
          />
        );
      }
    },
    {
      id: "prompting_actions",
      cell: ({ row }) => <StoryTypePromptingRowActions row={row} />
    }
  ];
}

// 🪄 AI Actions View - Auto-run settings
export function getAiActionsColumns(
  onUpdate?: UpdateStoryTypeCallback
): ColumnDef<StoryType>[] {
  return [
    selectColumn,
    nameColumn,
    {
      accessorKey: "auto_run_image_action",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Auto Image" />,
      cell: ({ row }) => {
        const autoRun = row.getValue("auto_run_image_action") as boolean;
        return (
          <ToggleSwitchCell
            storyTypeId={row.original.id}
            field="auto_run_image_action"
            value={autoRun}
            label="Auto Image"
            onUpdate={onUpdate}
          />
        );
      }
    },
    {
      accessorKey: "auto_run_audio_action",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Auto Audio" />,
      cell: ({ row }) => {
        const autoRun = row.getValue("auto_run_audio_action") as boolean;
        return (
          <ToggleSwitchCell
            storyTypeId={row.original.id}
            field="auto_run_audio_action"
            value={autoRun}
            label="Auto Audio"
            onUpdate={onUpdate}
          />
        );
      }
    },
    {
      accessorKey: "auto_run_video_action",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Auto Video" />,
      cell: ({ row }) => {
        const autoRun = row.getValue("auto_run_video_action") as boolean;
        return (
          <ToggleSwitchCell
            storyTypeId={row.original.id}
            field="auto_run_video_action"
            value={autoRun}
            label="Auto Video"
            onUpdate={onUpdate}
          />
        );
      }
    },
    {
      accessorKey: "voice_id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Voice" />,
      cell: ({ row }) => {
        const voiceId = row.getValue("voice_id") as string | null;
        if (!voiceId) return <span className="text-muted-foreground text-xs">Not set</span>;
        return <Badge variant="outline">{voiceId}</Badge>;
      }
    },
    {
      accessorKey: "captions_enabled",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Captions" />,
      cell: ({ row }) => {
        const enabled = row.getValue("captions_enabled") as boolean;
        return (
          <ToggleSwitchCell
            storyTypeId={row.original.id}
            field="captions_enabled"
            value={enabled ?? false}
            label="Captions"
            onUpdate={onUpdate}
          />
        );
      }
    },
    actionsColumn
  ];
}

// ✅ Approvals View - Auto-approval settings
export function getApprovalsColumns(
  onUpdate?: UpdateStoryTypeCallback
): ColumnDef<StoryType>[] {
  return [
    selectColumn,
    nameColumn,
    {
      accessorKey: "auto_approve_story_gen",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Story Gen" />,
      cell: ({ row }) => {
        const autoApprove = row.getValue("auto_approve_story_gen") as boolean;
        return (
          <ToggleSwitchCell
            storyTypeId={row.original.id}
            field="auto_approve_story_gen"
            value={autoApprove}
            label="Story Gen Auto-Approval"
            onUpdate={onUpdate}
          />
        );
      }
    },
    {
      accessorKey: "auto_approve_shots",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Shots" />,
      cell: ({ row }) => {
        const autoApprove = row.getValue("auto_approve_shots") as boolean;
        return (
          <ToggleSwitchCell
            storyTypeId={row.original.id}
            field="auto_approve_shots"
            value={autoApprove}
            label="Shots Auto-Approval"
            onUpdate={onUpdate}
          />
        );
      }
    },
    {
      accessorKey: "auto_approve_scenes",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Scenes" />,
      cell: ({ row }) => {
        const autoApprove = row.getValue("auto_approve_scenes") as boolean;
        return (
          <ToggleSwitchCell
            storyTypeId={row.original.id}
            field="auto_approve_scenes"
            value={autoApprove}
            label="Scenes Auto-Approval"
            onUpdate={onUpdate}
          />
        );
      }
    },
    {
      accessorKey: "auto_approve_story",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Story" />,
      cell: ({ row }) => {
        const autoApprove = row.getValue("auto_approve_story") as boolean;
        return (
          <ToggleSwitchCell
            storyTypeId={row.original.id}
            field="auto_approve_story"
            value={autoApprove}
            label="Story Auto-Approval"
            onUpdate={onUpdate}
          />
        );
      }
    },
    {
      accessorKey: "auto_approve_source",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
      cell: ({ row }) => {
        const autoApprove = row.getValue("auto_approve_source") as boolean;
        return (
          <ToggleSwitchCell
            storyTypeId={row.original.id}
            field="auto_approve_source"
            value={autoApprove}
            label="Source Auto-Approval"
            onUpdate={onUpdate}
          />
        );
      }
    },
    actionsColumn
  ];
}
