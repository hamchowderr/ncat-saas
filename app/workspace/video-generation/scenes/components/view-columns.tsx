"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { Database } from "@/lib/database.types";
import { DataTableColumnHeader } from "@/app/workspace/jobs/components/data-table-column-header";
import { SceneRowActions } from "./scene-row-actions";

type Scene = Database["public"]["Tables"]["scenes"]["Row"] & {
  stories: {
    id: string;
    title: string;
    active_story: boolean;
    user_id: string;
    story_types: {
      id: string;
      name: string;
      width: number;
      height: number;
      voice_id: string | null;
      captions_enabled: boolean;
      auto_approve_shots: boolean;
      auto_approve_scenes: boolean;
      auto_approve_story: boolean;
      auto_approve_source: boolean;
      auto_run_image_action: boolean;
      auto_run_audio_action: boolean;
      auto_run_video_action: boolean;
    } | null;
  } | null;
};

// Common columns
const selectColumn: ColumnDef<Scene, unknown> = {
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

const sceneNameColumn: ColumnDef<Scene> = {
  accessorKey: "title",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Scene Title" />,
  cell: ({ row }) => {
    const title = row.getValue("title") as string | null;
    if (!title) return <span className="text-muted-foreground text-xs">Unnamed Scene</span>;
    return <div className="max-w-[300px] truncate font-medium">{title}</div>;
  }
};

const storyColumn: ColumnDef<Scene, unknown> = {
  id: "story",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Story" />,
  cell: ({ row }) => {
    const story = row.original.stories;
    if (!story) return <span className="text-muted-foreground text-xs">No story</span>;
    return <div className="max-w-[200px] truncate text-xs">{story.title}</div>;
  }
};

const sequenceColumn: ColumnDef<Scene> = {
  accessorKey: "sequence_number",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Sequence" />,
  cell: ({ row }) => {
    const seq = row.getValue("sequence_number") as number | null;
    if (!seq) return <span className="text-muted-foreground text-xs">-</span>;
    return <div className="text-center font-medium">{seq}</div>;
  }
};

const sceneIdColumn: ColumnDef<Scene, unknown> = {
  id: "scene_id",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Scene ID" />,
  cell: ({ row }) => {
    const seq = row.original.sequence_number;
    const title = row.original.title;
    const sceneId = `${seq}—${title}`;
    return <div className="text-xs font-mono">{sceneId}</div>;
  }
};

const actionsColumn: ColumnDef<Scene, unknown> = {
  id: "actions",
  cell: ({ row }) => <SceneRowActions row={row} />
};

// 🎬 All Scenes View
export const allScenesColumns: ColumnDef<Scene, unknown>[] = [
  selectColumn,
  sceneIdColumn,
  sceneNameColumn,
  storyColumn,
  sequenceColumn,
  {
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
    cell: ({ row }) => {
      const desc = row.getValue("description") as string | null;
      if (!desc) return <span className="text-muted-foreground text-xs">-</span>;
      return <div className="max-w-[400px] truncate text-xs">{desc}</div>;
    }
  },
  {
    id: "width",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Width" />,
    cell: ({ row }) => {
      const width = row.original.stories?.story_types?.width;
      if (!width) return <span className="text-muted-foreground text-xs">-</span>;
      return <div className="text-xs">{width}px</div>;
    }
  } as ColumnDef<Scene, unknown>,
  {
    id: "height",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Height" />,
    cell: ({ row }) => {
      const height = row.original.stories?.story_types?.height;
      if (!height) return <span className="text-muted-foreground text-xs">-</span>;
      return <div className="text-xs">{height}px</div>;
    }
  } as ColumnDef<Scene, unknown>,
  {
    id: "aspect_ratio",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Aspect Ratio" />,
    cell: ({ row }) => {
      const width = row.original.stories?.story_types?.width;
      const height = row.original.stories?.story_types?.height;
      if (!width || !height) return <span className="text-muted-foreground text-xs">-</span>;
      const ratio = (width / height).toFixed(2);
      // Calculate common aspect ratios
      let display = "Other";
      if (ratio === "1.33") display = "4:3";
      else if (ratio === "1.78") display = "16:9";
      else if (ratio === "0.56") display = "9:16";
      else if (ratio === "1.60") display = "16:10";
      else if (ratio === "1.25") display = "5:4";
      else if (ratio === "2.39") display = "21:9";
      else if (ratio === "1.00") display = "1:1";
      return <Badge variant="outline" className="text-xs">{display}</Badge>;
    }
  } as ColumnDef<Scene, unknown>,
  {
    accessorKey: "approved",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Approved" />,
    cell: ({ row }) => {
      const approved = row.getValue("approved") as boolean;
      const autoApprove = row.original.stories?.story_types?.auto_approve_scenes;
      const isApproved = approved || autoApprove;
      return isApproved ? (
        <Badge className="bg-green-100 text-green-800">
          {autoApprove && !approved ? "Auto" : "Approved"}
        </Badge>
      ) : (
        <Badge variant="outline">Pending</Badge>
      );
    }
  },
  {
    id: "active",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Active Story" />,
    cell: ({ row }) => {
      const isActive = row.original.stories?.active_story;
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
  } as ColumnDef<Scene, unknown>,
  actionsColumn
];

// 🎵 Audio View - Focus on audio_url field
export const audioColumns: ColumnDef<Scene, unknown>[] = [
  selectColumn,
  sceneNameColumn,
  storyColumn,
  sequenceColumn,
  {
    accessorKey: "audio_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Audio (Generated)" />,
    cell: ({ row }) => {
      const url = row.getValue("audio_url") as string | null;
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
    accessorKey: "audio_upload_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Audio (Upload)" />,
    cell: ({ row }) => {
      const url = row.getValue("audio_upload_url") as string | null;
      if (!url) return <span className="text-muted-foreground text-xs">Not uploaded</span>;
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
          <ExternalLink className="h-3 w-3" />
          Upload
        </a>
      );
    }
  },
  {
    accessorKey: "scene_script",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Scene Script" />,
    cell: ({ row }) => {
      const script = row.getValue("scene_script") as string | null;
      if (!script) return <span className="text-muted-foreground text-xs">No script</span>;
      const preview = script.substring(0, 100) + (script.length > 100 ? "..." : "");
      return <div className="max-w-[300px] truncate text-xs font-mono">{preview}</div>;
    }
  },
  {
    id: "auto_run_audio",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Auto Run Audio" />,
    cell: ({ row }) => {
      const autoRun = row.original.stories?.story_types?.auto_run_audio_action;
      return autoRun ? (
        <Badge className="bg-green-100 text-green-800 text-xs">Yes</Badge>
      ) : (
        <Badge variant="outline" className="text-xs">No</Badge>
      );
    }
  } as ColumnDef<Scene, unknown>,
  {
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
            status === "planned" && "bg-gray-100 text-gray-800"
          )}
          variant="outline"
        >
          {status || "planned"}
        </Badge>
      );
    }
  },
  actionsColumn
];

// 🎥 Video View - Focus on video_url field
export const videoColumns: ColumnDef<Scene, unknown>[] = [
  selectColumn,
  sceneNameColumn,
  storyColumn,
  sequenceColumn,
  {
    accessorKey: "video_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Video (Generated)" />,
    cell: ({ row }) => {
      const url = row.getValue("video_url") as string | null;
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
    accessorKey: "video_upload_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Video (Upload)" />,
    cell: ({ row }) => {
      const url = row.getValue("video_upload_url") as string | null;
      if (!url) return <span className="text-muted-foreground text-xs">Not uploaded</span>;
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
          <ExternalLink className="h-3 w-3" />
          Upload
        </a>
      );
    }
  },
  {
    accessorKey: "final_scene_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Final Scene" />,
    cell: ({ row }) => {
      const url = row.getValue("final_scene_url") as string | null;
      if (!url) return <span className="text-muted-foreground text-xs">Not composed</span>;
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
          <ExternalLink className="h-3 w-3" />
          Final
        </a>
      );
    }
  },
  {
    id: "auto_run_video",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Auto Run Video" />,
    cell: ({ row }) => {
      const autoRun = row.original.stories?.story_types?.auto_run_video_action;
      return autoRun ? (
        <Badge className="bg-green-100 text-green-800 text-xs">Yes</Badge>
      ) : (
        <Badge variant="outline" className="text-xs">No</Badge>
      );
    }
  } as ColumnDef<Scene, unknown>,
  {
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
            status === "planned" && "bg-gray-100 text-gray-800"
          )}
          variant="outline"
        >
          {status || "planned"}
        </Badge>
      );
    }
  },
  actionsColumn
];

// 📤 Uploads View - Focus on scene media files
export const uploadsColumns: ColumnDef<Scene, unknown>[] = [
  selectColumn,
  sceneNameColumn,
  storyColumn,
  sequenceColumn,
  {
    accessorKey: "audio_upload_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Audio Upload" />,
    cell: ({ row }) => {
      const url = row.getValue("audio_upload_url") as string | null;
      if (!url) return <span className="text-muted-foreground text-xs">Not uploaded</span>;
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
          <ExternalLink className="h-3 w-3" />
          Audio
        </a>
      );
    }
  },
  {
    accessorKey: "video_upload_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Video Upload" />,
    cell: ({ row }) => {
      const url = row.getValue("video_upload_url") as string | null;
      if (!url) return <span className="text-muted-foreground text-xs">Not uploaded</span>;
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
          <ExternalLink className="h-3 w-3" />
          Video
        </a>
      );
    }
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div className="text-xs">{date.toLocaleString()}</div>;
    }
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Modified" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("updated_at"));
      return <div className="text-xs">{date.toLocaleString()}</div>;
    }
  },
  actionsColumn
];

// 🏗️ Combine Shots View - Workflow for combining shots
export const combineShotsColumns: ColumnDef<Scene, unknown>[] = [
  selectColumn,
  sceneNameColumn,
  storyColumn,
  sequenceColumn,
  {
    accessorKey: "approved",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Approved" />,
    cell: ({ row }) => {
      const approved = row.getValue("approved") as boolean;
      const autoApprove = row.original.stories?.story_types?.auto_approve_scenes;
      const isApproved = approved || autoApprove;
      return isApproved ? (
        <Badge className="bg-green-100 text-green-800">
          ✓ {autoApprove && !approved ? "Auto" : "Approved"}
        </Badge>
      ) : (
        <Badge variant="outline">⏳ Pending</Badge>
      );
    }
  },
  {
    id: "auto_approve_shots",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Auto Approve Shots" />,
    cell: ({ row }) => {
      const autoApprove = row.original.stories?.story_types?.auto_approve_shots;
      return autoApprove ? (
        <Badge className="bg-green-100 text-green-800 text-xs">Yes</Badge>
      ) : (
        <Badge variant="outline" className="text-xs">No</Badge>
      );
    }
  } as ColumnDef<Scene, unknown>,
  {
    id: "shots_ready",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Shots Ready" />,
    cell: ({ row }) => {
      // This would need actual shot counting logic from database
      return <Badge variant="outline" className="text-xs">Check Shots</Badge>;
    }
  } as ColumnDef<Scene, unknown>,
  {
    accessorKey: "video_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Combined Video" />,
    cell: ({ row }) => {
      const url = row.getValue("video_url") as string | null;
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

// 🏗️ Build Final Scene View - Workflow for building final scene
export const buildFinalSceneColumns: ColumnDef<Scene, unknown>[] = [
  selectColumn,
  sceneNameColumn,
  storyColumn,
  sequenceColumn,
  {
    accessorKey: "final_scene_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Final Scene" />,
    cell: ({ row }) => {
      const url = row.getValue("final_scene_url") as string | null;
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
  {
    id: "approved_status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Approved?" />,
    cell: ({ row }) => {
      const approved = row.original.approved;
      const autoApprove = row.original.stories?.story_types?.auto_approve_scenes;
      const isApproved = approved || autoApprove;
      return isApproved ? (
        <Badge className="bg-green-100 text-green-800">
          ✓ {autoApprove && !approved ? "Auto" : "Approved"}
        </Badge>
      ) : (
        <Badge variant="outline">⏳ Pending</Badge>
      );
    }
  } as ColumnDef<Scene, unknown>,
  {
    id: "ready_status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ready?" />,
    cell: ({ row }) => {
      const finalSceneUrl = row.original.final_scene_url;
      const approved = row.original.approved;
      const autoApprove = row.original.stories?.story_types?.auto_approve_scenes;
      const isApproved = approved || autoApprove;
      const isReady = !!finalSceneUrl && isApproved;
      return isReady ? (
        <Badge className="bg-green-100 text-green-800">✓ Ready</Badge>
      ) : (
        <Badge variant="outline">Not Ready</Badge>
      );
    }
  } as ColumnDef<Scene, unknown>,
  actionsColumn
];

// All Data View - Comprehensive
export const allDataColumns: ColumnDef<Scene, unknown>[] = [
  selectColumn,
  sceneIdColumn,
  sceneNameColumn,
  storyColumn,
  sequenceColumn,
  {
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
    cell: ({ row }) => {
      const desc = row.getValue("description") as string | null;
      return desc ? <div className="max-w-[200px] truncate text-xs">{desc}</div> : <span className="text-muted-foreground text-xs">-</span>;
    }
  },
  {
    id: "width",
    header: ({ column }) => <DataTableColumnHeader column={column} title="W" />,
    cell: ({ row }) => {
      const width = row.original.stories?.story_types?.width;
      return width ? <div className="text-xs">{width}</div> : <span className="text-muted-foreground text-xs">-</span>;
    }
  } as ColumnDef<Scene, unknown>,
  {
    id: "height",
    header: ({ column }) => <DataTableColumnHeader column={column} title="H" />,
    cell: ({ row }) => {
      const height = row.original.stories?.story_types?.height;
      return height ? <div className="text-xs">{height}</div> : <span className="text-muted-foreground text-xs">-</span>;
    }
  } as ColumnDef<Scene, unknown>,
  {
    accessorKey: "audio_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Audio" />,
    cell: ({ row }) => {
      const url = row.getValue("audio_url") as string | null;
      return url ? <Badge variant="outline" className="text-xs">✓</Badge> : <span className="text-muted-foreground text-xs">-</span>;
    }
  },
  {
    accessorKey: "audio_upload_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Audio Upload" />,
    cell: ({ row }) => {
      const url = row.getValue("audio_upload_url") as string | null;
      return url ? <Badge variant="outline" className="text-xs">✓</Badge> : <span className="text-muted-foreground text-xs">-</span>;
    }
  },
  {
    accessorKey: "video_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Video" />,
    cell: ({ row }) => {
      const url = row.getValue("video_url") as string | null;
      return url ? <Badge variant="outline" className="text-xs">✓</Badge> : <span className="text-muted-foreground text-xs">-</span>;
    }
  },
  {
    accessorKey: "video_upload_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Video Upload" />,
    cell: ({ row }) => {
      const url = row.getValue("video_upload_url") as string | null;
      return url ? <Badge variant="outline" className="text-xs">✓</Badge> : <span className="text-muted-foreground text-xs">-</span>;
    }
  },
  {
    accessorKey: "final_scene_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Final" />,
    cell: ({ row }) => {
      const url = row.getValue("final_scene_url") as string | null;
      return url ? <Badge variant="outline" className="text-xs">✓</Badge> : <span className="text-muted-foreground text-xs">-</span>;
    }
  },
  {
    accessorKey: "approved",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Approved" />,
    cell: ({ row }) => {
      const approved = row.getValue("approved") as boolean;
      const autoApprove = row.original.stories?.story_types?.auto_approve_scenes;
      const isApproved = approved || autoApprove;
      return isApproved ? (
        <Badge className="bg-green-100 text-green-800 text-xs">✓</Badge>
      ) : (
        <Badge variant="outline" className="text-xs">-</Badge>
      );
    }
  },
  {
    id: "active",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Active" />,
    cell: ({ row }) => {
      const isActive = row.original.stories?.active_story;
      return isActive ? (
        <Badge variant="outline" className="text-xs">✓</Badge>
      ) : (
        <span className="text-muted-foreground text-xs">-</span>
      );
    }
  } as ColumnDef<Scene, unknown>,
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div className="text-xs">{date.toLocaleDateString()}</div>;
    }
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Modified" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("updated_at"));
      return <div className="text-xs">{date.toLocaleDateString()}</div>;
    }
  },
  actionsColumn
];
