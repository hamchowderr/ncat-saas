"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { Database } from "@/lib/database.types";
import { DataTableColumnHeader } from "@/app/workspace/jobs/components/data-table-column-header";
import { StoryRowActions } from "./story-row-actions";

type Story = Database["public"]["Tables"]["stories"]["Row"] & {
  story_types: {
    id: string;
    name: string;
    description: string | null;
    auto_approve_story_gen: boolean;
  } | null;
};

// Common columns
const selectColumn: ColumnDef<Story> = {
  id: "select",
  header: ({ table }) => (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
    />
  ),
  enableSorting: false,
  enableHiding: false
};

const titleColumn: ColumnDef<Story> = {
  accessorKey: "title",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
  cell: ({ row }) => {
    const title = row.getValue("title") as string;
    return <div className="max-w-[300px] truncate font-medium">{title}</div>;
  }
};

const storyTypeColumn: ColumnDef<Story> = {
  accessorKey: "story_types.name",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Story Type" />,
  cell: ({ row }) => {
    const storyType = row.original.story_types?.name;
    if (!storyType) return <span className="text-muted-foreground text-xs">None</span>;
    return <Badge variant="outline" className="text-xs">{storyType}</Badge>;
  }
};

const statusColumn: ColumnDef<Story> = {
  accessorKey: "status",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
  cell: ({ row }) => {
    const status = row.getValue("status") as string;
    return (
      <Badge
        className={cn(
          "text-xs",
          status === "completed" && "bg-green-100 text-green-800",
          status === "in_progress" && "bg-blue-100 text-blue-800",
          status === "draft" && "bg-gray-100 text-gray-800",
          status === "archived" && "bg-orange-100 text-orange-800"
        )}
        variant="outline"
      >
        {status || "draft"}
      </Badge>
    );
  }
};

const actionsColumn: ColumnDef<Story> = {
  id: "actions",
  cell: ({ row }) => <StoryRowActions row={row} />
};

// ✅ Active Story View - Shows the currently active working story
export const activeStoryColumns: ColumnDef<Story>[] = [
  selectColumn,
  {
    accessorKey: "sid",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Story #" />,
    cell: ({ row }) => {
      const sid = row.getValue("sid") as number | null;
      return <div className="text-xs font-mono">#{sid || '-'}</div>;
    }
  },
  titleColumn,
  storyTypeColumn,
  statusColumn,
  {
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      if (!description) return <span className="text-muted-foreground text-xs">-</span>;
      return <div className="max-w-[400px] truncate text-xs">{description}</div>;
    }
  },
  {
    accessorKey: "active_story",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Active" />,
    cell: ({ row }) => {
      const isActive = row.getValue("active_story") as boolean;
      return (
        <div className="flex justify-center">
          {isActive && (
            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      );
    }
  },
  actionsColumn
];

// 🎥 Manage Media View - Focus on media files
export const manageMediaColumns: ColumnDef<Story>[] = [
  selectColumn,
  titleColumn,
  {
    accessorKey: "voiceover_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Voiceover" />,
    cell: ({ row }) => {
      const url = row.getValue("voiceover_url") as string | null;
      if (!url) return <span className="text-muted-foreground text-xs">Not generated</span>;
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
          <ExternalLink className="h-3 w-3" />
          Audio
        </a>
      );
    }
  },
  {
    accessorKey: "final_video_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Video" />,
    cell: ({ row }) => {
      const url = row.getValue("final_video_url") as string | null;
      if (!url) return <span className="text-muted-foreground text-xs">Not generated</span>;
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
          <ExternalLink className="h-3 w-3" />
          Video
        </a>
      );
    }
  },
  {
    accessorKey: "final_video_with_captions_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="With Captions" />,
    cell: ({ row }) => {
      const url = row.getValue("final_video_with_captions_url") as string | null;
      if (!url) return <span className="text-muted-foreground text-xs">Not generated</span>;
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
          <ExternalLink className="h-3 w-3" />
          Captions
        </a>
      );
    }
  },
  {
    accessorKey: "source_content_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
    cell: ({ row }) => {
      const url = row.getValue("source_content_url") as string | null;
      if (!url) return <span className="text-muted-foreground text-xs">-</span>;
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
          <ExternalLink className="h-3 w-3" />
          Source
        </a>
      );
    }
  },
  {
    accessorKey: "srt_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Captions" />,
    cell: ({ row }) => {
      const url = row.getValue("srt_url") as string | null;
      if (!url) return <span className="text-muted-foreground text-xs">Not generated</span>;
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
          <ExternalLink className="h-3 w-3" />
          SRT
        </a>
      );
    }
  },
  actionsColumn
];

// 📝 Manage Story View - Story content editing
export const manageStoryColumns: ColumnDef<Story>[] = [
  selectColumn,
  titleColumn,
  storyTypeColumn,
  {
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      if (!description) return <span className="text-muted-foreground text-xs">-</span>;
      return <div className="max-w-[300px] truncate text-xs">{description}</div>;
    }
  },
  {
    accessorKey: "story_content",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Story Content" />,
    cell: ({ row }) => {
      const content = row.getValue("story_content") as string | null;
      if (!content) return <span className="text-muted-foreground text-xs">No content</span>;
      const preview = content.substring(0, 100) + (content.length > 100 ? "..." : "");
      return <div className="max-w-[300px] truncate text-xs">{preview}</div>;
    }
  },
  {
    accessorKey: "script",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Script" />,
    cell: ({ row }) => {
      const script = row.getValue("script") as string | null;
      if (!script) return <span className="text-muted-foreground text-xs">No script</span>;
      const preview = script.substring(0, 100) + (script.length > 100 ? "..." : "");
      return <div className="max-w-[300px] truncate text-xs font-mono">{preview}</div>;
    }
  },
  {
    accessorKey: "approved",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Approved" />,
    cell: ({ row }) => {
      const approved = row.getValue("approved") as boolean;
      return approved ? (
        <Badge className="bg-green-100 text-green-800">Approved</Badge>
      ) : (
        <Badge variant="outline">Pending</Badge>
      );
    }
  },
  {
    accessorKey: "approve_source",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Source Approved" />,
    cell: ({ row }) => {
      const approved = row.getValue("approve_source") as boolean;
      return approved ? (
        <Badge className="bg-green-100 text-green-800">✓</Badge>
      ) : (
        <Badge variant="outline">Pending</Badge>
      );
    }
  },
  actionsColumn
];

// 🪄 Generate Story View - AI generation workflow
export const generateStoryColumns: ColumnDef<Story>[] = [
  selectColumn,
  titleColumn,
  storyTypeColumn,
  statusColumn,
  {
    accessorKey: "generation_started_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Started" />,
    cell: ({ row }) => {
      const date = row.getValue("generation_started_at") as string | null;
      if (!date) return <span className="text-muted-foreground text-xs">Not started</span>;
      return <div className="text-xs">{new Date(date).toLocaleString()}</div>;
    }
  },
  {
    accessorKey: "generation_completed_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Completed" />,
    cell: ({ row }) => {
      const date = row.getValue("generation_completed_at") as string | null;
      if (!date) return <span className="text-muted-foreground text-xs">In progress</span>;
      return <div className="text-xs">{new Date(date).toLocaleString()}</div>;
    }
  },
  {
    accessorKey: "total_generation_time_seconds",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />,
    cell: ({ row }) => {
      const time = row.getValue("total_generation_time_seconds") as number | null;
      if (!time) return <span className="text-muted-foreground text-xs">N/A</span>;
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      return <div className="text-xs">{minutes}m {seconds}s</div>;
    }
  },
  {
    id: "auto_approve",
    header: "Auto Approve",
    cell: ({ row }) => {
      const autoApprove = row.original.story_types?.auto_approve_story_gen;
      return autoApprove ? (
        <Badge className="bg-green-100 text-green-800 text-xs">Yes</Badge>
      ) : (
        <Badge variant="outline" className="text-xs">No</Badge>
      );
    }
  },
  actionsColumn
];

// All Data View - Comprehensive
export const allDataColumns: ColumnDef<Story>[] = [
  selectColumn,
  titleColumn,
  storyTypeColumn,
  statusColumn,
  {
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      return description ? <div className="max-w-[200px] truncate text-xs">{description}</div> : <span className="text-muted-foreground text-xs">-</span>;
    }
  },
  {
    accessorKey: "final_video_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Video" />,
    cell: ({ row }) => {
      const url = row.getValue("final_video_url") as string | null;
      return url ? <Badge variant="outline" className="text-xs">✓</Badge> : <span className="text-muted-foreground text-xs">-</span>;
    }
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div className="text-xs">{date.toLocaleDateString()}</div>;
    }
  },
  actionsColumn
];

// For workflow views (Add Scenes/Shots, Combine Scenes, Build Final Story, etc.)
// We'll use variations of these base columns with different filters
export const workflowColumns: ColumnDef<Story>[] = [
  selectColumn,
  titleColumn,
  statusColumn,
  {
    accessorKey: "approved",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Approved" />,
    cell: ({ row }) => {
      const approved = row.getValue("approved") as boolean;
      return approved ? (
        <Badge className="bg-green-100 text-green-800">✓ Approved</Badge>
      ) : (
        <Badge variant="outline">⏳ Pending</Badge>
      );
    }
  },
  {
    accessorKey: "final_video_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Output" />,
    cell: ({ row }) => {
      const url = row.getValue("final_video_url") as string | null;
      return url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
          <ExternalLink className="h-3 w-3" />
          View
        </a>
      ) : (
        <span className="text-muted-foreground text-xs">Not ready</span>
      );
    }
  },
  actionsColumn
];
