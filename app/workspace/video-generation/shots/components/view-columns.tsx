"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Database } from "@/lib/database.types";
import { DataTableColumnHeader } from "@/app/workspace/jobs/components/data-table-column-header";
import { ShotRowActions } from "./shot-row-actions";
import { MediaPreviewDialog } from "@/components/media-preview-dialog";

type Shot = Database["public"]["Tables"]["shots"]["Row"] & {
  scenes: {
    id: string;
    title: string;
    sequence_number: number;
    approved: boolean;
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
    };
  } | null;
};

// Common columns
const selectColumn: ColumnDef<Shot> = {
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

const shotTitleColumn: ColumnDef<Shot> = {
  accessorKey: "title",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Shot Title" />,
  cell: ({ row }) => {
    const title = row.getValue("title") as string | null;
    if (!title) return <span className="text-muted-foreground text-xs">Unnamed Shot</span>;
    return <div className="max-w-[300px] truncate font-medium">{title}</div>;
  }
};

const sceneColumn: ColumnDef<Shot> = {
  id: "scene",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Scene" />,
  cell: ({ row }) => {
    const scene = row.original.scenes;
    if (!scene) return <span className="text-muted-foreground text-xs">No scene</span>;
    return <div className="max-w-[200px] truncate text-xs">{scene.title}</div>;
  }
};

const sequenceColumn: ColumnDef<Shot> = {
  accessorKey: "sequence_number",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Sequence" />,
  cell: ({ row }) => {
    const seq = row.getValue("sequence_number") as number | null;
    if (!seq) return <span className="text-muted-foreground text-xs">-</span>;
    return <div className="text-center font-medium">{seq}</div>;
  }
};

const statusColumn: ColumnDef<Shot> = {
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
          status === "pending" && "bg-gray-100 text-gray-800",
          status === "failed" && "bg-red-100 text-red-800"
        )}
        variant="outline"
      >
        {status || "pending"}
      </Badge>
    );
  }
};

const actionsColumn: ColumnDef<Shot> = {
  id: "actions",
  cell: ({ row }) => <ShotRowActions row={row} />
};

// Computed and Lookup Columns
const recordIdColumn: ColumnDef<Shot> = {
  id: "record_id",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Record ID" />,
  cell: ({ row }) => {
    const id = row.original.id;
    return <div className="text-xs font-mono">{id.substring(0, 8)}...</div>;
  }
};

const storyNameColumn: ColumnDef<Shot> = {
  id: "story_name",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Story" />,
  cell: ({ row }) => {
    const storyName = row.original.scenes?.stories?.title;
    if (!storyName) return <span className="text-muted-foreground text-xs">-</span>;
    return <div className="max-w-[200px] truncate text-xs">{storyName}</div>;
  }
};

const approvedComputedColumn: ColumnDef<Shot> = {
  id: "approved_computed",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Approved?" />,
  cell: ({ row }) => {
    const approved = row.original.approved;
    const autoApprove = row.original.scenes?.stories?.story_types?.auto_approve_shots;
    const isApproved = approved || autoApprove;
    return isApproved ? (
      <Badge className="bg-green-100 text-green-800">
        {autoApprove && !approved ? "Auto" : "Approved"}
      </Badge>
    ) : (
      <Badge variant="outline">Pending</Badge>
    );
  }
};

const readyColumn: ColumnDef<Shot> = {
  id: "ready",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Ready?" />,
  cell: ({ row }) => {
    const hasFinalShot = !!row.original.final_shot_url;
    const approved = row.original.approved;
    const autoApprove = row.original.scenes?.stories?.story_types?.auto_approve_shots;
    const isApproved = approved || autoApprove;
    const isReady = hasFinalShot && isApproved;

    return isReady ? (
      <Badge className="bg-green-100 text-green-800">✓ Ready</Badge>
    ) : (
      <Badge variant="outline">Not Ready</Badge>
    );
  }
};

const aspectRatioColumn: ColumnDef<Shot> = {
  id: "aspect_ratio",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Aspect Ratio" />,
  cell: ({ row }) => {
    const width = row.original.scenes?.stories?.story_types?.width;
    const height = row.original.scenes?.stories?.story_types?.height;
    if (!width || !height) return <span className="text-muted-foreground text-xs">-</span>;

    const ratio = (width / height).toFixed(2);
    let display = "Other";
    if (ratio === "1.33") display = "4:3";
    else if (ratio === "1.78") display = "16:9";
    else if (ratio === "0.56") display = "9:16";
    else if (ratio === "1.00") display = "1:1";
    else display = `${width}:${height}`;

    return <Badge variant="outline" className="text-xs">{display}</Badge>;
  }
};

const finalImagePromptColumn: ColumnDef<Shot> = {
  id: "final_image_prompt",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Final Image Prompt" />,
  cell: ({ row }) => {
    const imagePrompt = row.original.image_prompt || "";
    const cref = row.original.cref;
    const finalPrompt = imagePrompt + (cref ? ` --cref ${cref}` : "");
    if (!finalPrompt) return <span className="text-muted-foreground text-xs">No prompt</span>;
    const preview = finalPrompt.substring(0, 100) + (finalPrompt.length > 100 ? "..." : "");
    return <div className="max-w-[300px] truncate text-xs font-mono">{preview}</div>;
  }
};

// 🎬 All Shots View
export const allShotsColumns: ColumnDef<Shot>[] = [
  selectColumn,
  shotTitleColumn,
  sceneColumn,
  sequenceColumn,
  statusColumn,
  {
    accessorKey: "shot_type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Shot Type" />,
    cell: ({ row }) => {
      const type = row.getValue("shot_type") as string | null;
      if (!type) return <span className="text-muted-foreground text-xs">-</span>;
      return <Badge variant="outline" className="text-xs">{type}</Badge>;
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
  actionsColumn
];

// 🖼️ Images View - Focus on image generation
export const imagesColumns: ColumnDef<Shot>[] = [
  selectColumn,
  shotTitleColumn,
  sceneColumn,
  sequenceColumn,
  {
    accessorKey: "image_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Image" />,
    cell: ({ row }) => {
      const url = row.getValue("image_url") as string | null;
      return <MediaPreviewDialog url={url} type="image" alt={row.original.title || "Shot image"} />;
    }
  },
  {
    accessorKey: "image_prompt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Image Prompt" />,
    cell: ({ row }) => {
      const prompt = row.getValue("image_prompt") as string | null;
      if (!prompt) return <span className="text-muted-foreground text-xs">No prompt</span>;
      const preview = prompt.substring(0, 100) + (prompt.length > 100 ? "..." : "");
      return <div className="max-w-[300px] truncate text-xs font-mono">{preview}</div>;
    }
  },
  {
    accessorKey: "image_go",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ready" />,
    cell: ({ row }) => {
      const go = row.getValue("image_go") as boolean;
      return go ? (
        <Badge className="bg-green-100 text-green-800">✓</Badge>
      ) : (
        <Badge variant="outline">-</Badge>
      );
    }
  },
  actionsColumn
];

// 🎵 Audio View - Focus on audio generation
export const audioColumns: ColumnDef<Shot>[] = [
  selectColumn,
  shotTitleColumn,
  sceneColumn,
  sequenceColumn,
  {
    accessorKey: "audio_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Audio" />,
    cell: ({ row }) => {
      const url = row.getValue("audio_url") as string | null;
      return <MediaPreviewDialog url={url} type="audio" alt={row.original.title || "Shot audio"} />;
    }
  },
  {
    accessorKey: "shot_script",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Shot Script" />,
    cell: ({ row }) => {
      const script = row.getValue("shot_script") as string | null;
      if (!script) return <span className="text-muted-foreground text-xs">No script</span>;
      const preview = script.substring(0, 100) + (script.length > 100 ? "..." : "");
      return <div className="max-w-[300px] truncate text-xs font-mono">{preview}</div>;
    }
  },
  {
    accessorKey: "audio_go",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ready" />,
    cell: ({ row }) => {
      const go = row.getValue("audio_go") as boolean;
      return go ? (
        <Badge className="bg-green-100 text-green-800">✓</Badge>
      ) : (
        <Badge variant="outline">-</Badge>
      );
    }
  },
  actionsColumn
];

// 🎥 Video View - Focus on video generation
export const videoColumns: ColumnDef<Shot>[] = [
  selectColumn,
  shotTitleColumn,
  sceneColumn,
  sequenceColumn,
  {
    accessorKey: "video_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Video" />,
    cell: ({ row }) => {
      const url = row.getValue("video_url") as string | null;
      return <MediaPreviewDialog url={url} type="video" alt={row.original.title || "Shot video"} />;
    }
  },
  {
    accessorKey: "video_prompt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Video Prompt" />,
    cell: ({ row }) => {
      const prompt = row.getValue("video_prompt") as string | null;
      if (!prompt) return <span className="text-muted-foreground text-xs">No prompt</span>;
      const preview = prompt.substring(0, 100) + (prompt.length > 100 ? "..." : "");
      return <div className="max-w-[300px] truncate text-xs font-mono">{preview}</div>;
    }
  },
  {
    accessorKey: "video_go",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ready" />,
    cell: ({ row }) => {
      const go = row.getValue("video_go") as boolean;
      return go ? (
        <Badge className="bg-green-100 text-green-800">✓</Badge>
      ) : (
        <Badge variant="outline">-</Badge>
      );
    }
  },
  actionsColumn
];

// 📤 Upload View - Show uploaded files and generated files
export const uploadColumns: ColumnDef<Shot>[] = [
  selectColumn,
  shotTitleColumn,
  sceneColumn,
  sequenceColumn,
  {
    accessorKey: "image_upload_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Image Upload" />,
    cell: ({ row }) => {
      const url = row.getValue("image_upload_url") as string | null;
      return <MediaPreviewDialog url={url || null} type="image" alt="Uploaded image" />;
    }
  },
  {
    accessorKey: "audio_upload_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Audio Upload" />,
    cell: ({ row }) => {
      const url = row.getValue("audio_upload_url") as string | null;
      return <MediaPreviewDialog url={url || null} type="audio" alt="Uploaded audio" />;
    }
  },
  {
    accessorKey: "video_upload_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Video Upload" />,
    cell: ({ row }) => {
      const url = row.getValue("video_upload_url") as string | null;
      return <MediaPreviewDialog url={url || null} type="video" alt="Uploaded video" />;
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

// 🪄 Generate Image View
export const generateImageColumns: ColumnDef<Shot>[] = [
  selectColumn,
  shotTitleColumn,
  sceneColumn,
  sequenceColumn,
  {
    accessorKey: "image_prompt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Image Prompt" />,
    cell: ({ row }) => {
      const prompt = row.getValue("image_prompt") as string | null;
      if (!prompt) return <span className="text-muted-foreground text-xs">No prompt</span>;
      const preview = prompt.substring(0, 100) + (prompt.length > 100 ? "..." : "");
      return <div className="max-w-[300px] truncate text-xs font-mono">{preview}</div>;
    }
  },
  {
    accessorKey: "cref",
    header: ({ column }) => <DataTableColumnHeader column={column} title="CREF" />,
    cell: ({ row }) => {
      const cref = row.getValue("cref") as string | null;
      return <MediaPreviewDialog url={cref || null} type="image" alt="Character reference" />;
    }
  },
  finalImagePromptColumn,
  {
    accessorKey: "image_selector",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Selector" />,
    cell: ({ row }) => {
      const selector = row.getValue("image_selector") as string | null;
      if (!selector) return <span className="text-muted-foreground text-xs">-</span>;
      return <Badge variant="outline" className="text-xs">#{selector}</Badge>;
    }
  },
  {
    accessorKey: "image_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Result" />,
    cell: ({ row }) => {
      const url = row.getValue("image_url") as string | null;
      return url ? (
        <Badge className="bg-green-100 text-green-800">✓ Generated</Badge>
      ) : (
        <Badge variant="outline">Pending</Badge>
      );
    }
  },
  actionsColumn
];

// 🪄 Generate Audio View
export const generateAudioColumns: ColumnDef<Shot>[] = [
  selectColumn,
  shotTitleColumn,
  sceneColumn,
  sequenceColumn,
  {
    accessorKey: "shot_script",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Script" />,
    cell: ({ row }) => {
      const script = row.getValue("shot_script") as string | null;
      if (!script) return <span className="text-muted-foreground text-xs">No script</span>;
      const preview = script.substring(0, 100) + (script.length > 100 ? "..." : "");
      return <div className="max-w-[300px] truncate text-xs font-mono">{preview}</div>;
    }
  },
  {
    accessorKey: "audio_prompt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Audio Prompt" />,
    cell: ({ row }) => {
      const prompt = row.getValue("audio_prompt") as string | null;
      if (!prompt) return <span className="text-muted-foreground text-xs">-</span>;
      const preview = prompt.substring(0, 100) + (prompt.length > 100 ? "..." : "");
      return <div className="max-w-[300px] truncate text-xs font-mono">{preview}</div>;
    }
  },
  {
    accessorKey: "final_audio_prompt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Final Audio Prompt" />,
    cell: ({ row }) => {
      const prompt = row.getValue("final_audio_prompt") as string | null;
      if (!prompt) return <span className="text-muted-foreground text-xs">-</span>;
      const preview = prompt.substring(0, 100) + (prompt.length > 100 ? "..." : "");
      return <div className="max-w-[300px] truncate text-xs font-mono">{preview}</div>;
    }
  },
  {
    accessorKey: "audio_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Result" />,
    cell: ({ row }) => {
      const url = row.getValue("audio_url") as string | null;
      return url ? (
        <Badge className="bg-green-100 text-green-800">✓ Generated</Badge>
      ) : (
        <Badge variant="outline">Pending</Badge>
      );
    }
  },
  actionsColumn
];

// 🪄 Generate Video View
export const generateVideoColumns: ColumnDef<Shot>[] = [
  selectColumn,
  shotTitleColumn,
  sceneColumn,
  sequenceColumn,
  {
    accessorKey: "video_prompt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Video Prompt" />,
    cell: ({ row }) => {
      const prompt = row.getValue("video_prompt") as string | null;
      if (!prompt) return <span className="text-muted-foreground text-xs">No prompt</span>;
      const preview = prompt.substring(0, 100) + (prompt.length > 100 ? "..." : "");
      return <div className="max-w-[300px] truncate text-xs font-mono">{preview}</div>;
    }
  },
  {
    accessorKey: "final_video_prompt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Final Video Prompt" />,
    cell: ({ row }) => {
      const prompt = row.getValue("final_video_prompt") as string | null;
      if (!prompt) return <span className="text-muted-foreground text-xs">-</span>;
      const preview = prompt.substring(0, 100) + (prompt.length > 100 ? "..." : "");
      return <div className="max-w-[300px] truncate text-xs font-mono">{preview}</div>;
    }
  },
  {
    accessorKey: "video_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Result" />,
    cell: ({ row }) => {
      const url = row.getValue("video_url") as string | null;
      return url ? (
        <Badge className="bg-green-100 text-green-800">✓ Generated</Badge>
      ) : (
        <Badge variant="outline">Pending</Badge>
      );
    }
  },
  actionsColumn
];

// 🏗️ Build Final Shot View
export const buildFinalShotColumns: ColumnDef<Shot>[] = [
  selectColumn,
  shotTitleColumn,
  sceneColumn,
  sequenceColumn,
  approvedComputedColumn,
  {
    id: "has_assets",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Assets Ready" />,
    cell: ({ row }) => {
      const hasImage = !!row.original.image_url;
      const hasAudio = !!row.original.audio_url;
      const hasVideo = !!row.original.video_url;
      const ready = hasImage && hasAudio && hasVideo;

      return ready ? (
        <Badge className="bg-green-100 text-green-800">✓ Ready</Badge>
      ) : (
        <Badge variant="outline">
          {hasImage ? "✓" : "○"} Img | {hasAudio ? "✓" : "○"} Audio | {hasVideo ? "✓" : "○"} Video
        </Badge>
      );
    }
  },
  {
    accessorKey: "final_shot_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Final Shot" />,
    cell: ({ row }) => {
      const url = row.getValue("final_shot_url") as string | null;
      return <MediaPreviewDialog url={url} type="video" alt={`${row.original.title} - Final` || "Final shot"} />;
    }
  },
  readyColumn,
  actionsColumn
];

// ▶️ Run Generate Image View - Auto-run trigger view
export const runGenerateImageColumns: ColumnDef<Shot>[] = [
  selectColumn,
  shotTitleColumn,
  sceneColumn,
  sequenceColumn,
  {
    accessorKey: "image_go",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trigger" />,
    cell: ({ row }) => {
      const go = row.getValue("image_go") as boolean;
      return go ? (
        <Badge className="bg-blue-100 text-blue-800">▶️ Active</Badge>
      ) : (
        <Badge variant="outline">Inactive</Badge>
      );
    }
  },
  {
    accessorKey: "image_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const url = row.getValue("image_url") as string | null;
      return url ? (
        <Badge className="bg-green-100 text-green-800">✓ Complete</Badge>
      ) : (
        <Badge variant="outline">Pending</Badge>
      );
    }
  },
  actionsColumn
];

// ▶️ Run Generate Audio View
export const runGenerateAudioColumns: ColumnDef<Shot>[] = [
  selectColumn,
  shotTitleColumn,
  sceneColumn,
  sequenceColumn,
  {
    accessorKey: "audio_go",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trigger" />,
    cell: ({ row }) => {
      const go = row.getValue("audio_go") as boolean;
      return go ? (
        <Badge className="bg-blue-100 text-blue-800">▶️ Active</Badge>
      ) : (
        <Badge variant="outline">Inactive</Badge>
      );
    }
  },
  {
    accessorKey: "audio_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const url = row.getValue("audio_url") as string | null;
      return url ? (
        <Badge className="bg-green-100 text-green-800">✓ Complete</Badge>
      ) : (
        <Badge variant="outline">Pending</Badge>
      );
    }
  },
  actionsColumn
];

// ▶️ Run Generate Video View
export const runGenerateVideoColumns: ColumnDef<Shot>[] = [
  selectColumn,
  shotTitleColumn,
  sceneColumn,
  sequenceColumn,
  {
    accessorKey: "video_go",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trigger" />,
    cell: ({ row }) => {
      const go = row.getValue("video_go") as boolean;
      return go ? (
        <Badge className="bg-blue-100 text-blue-800">▶️ Active</Badge>
      ) : (
        <Badge variant="outline">Inactive</Badge>
      );
    }
  },
  {
    accessorKey: "video_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const url = row.getValue("video_url") as string | null;
      return url ? (
        <Badge className="bg-green-100 text-green-800">✓ Complete</Badge>
      ) : (
        <Badge variant="outline">Pending</Badge>
      );
    }
  },
  actionsColumn
];

// All Data View - Comprehensive view with all fields
export const allDataColumns: ColumnDef<Shot>[] = [
  selectColumn,
  recordIdColumn,
  shotTitleColumn,
  sceneColumn,
  storyNameColumn,
  sequenceColumn,
  {
    accessorKey: "sort",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Sort" />,
    cell: ({ row }) => {
      const sort = row.getValue("sort") as number | null;
      return sort ? <div className="text-xs">{sort}</div> : <span className="text-muted-foreground text-xs">-</span>;
    }
  },
  statusColumn,
  {
    accessorKey: "shot_type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => {
      const type = row.getValue("shot_type") as string | null;
      return type ? <Badge variant="outline" className="text-xs">{type}</Badge> : <span className="text-muted-foreground text-xs">-</span>;
    }
  },
  {
    id: "active",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Active" />,
    cell: ({ row }) => {
      const active = row.original.scenes?.stories?.active_story;
      return active ? (
        <Badge className="bg-green-100 text-green-800 text-xs">✓</Badge>
      ) : (
        <Badge variant="outline" className="text-xs">-</Badge>
      );
    }
  },
  approvedComputedColumn,
  readyColumn,
  aspectRatioColumn,
  {
    id: "width",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Width" />,
    cell: ({ row }) => {
      const width = row.original.scenes?.stories?.story_types?.width;
      return width ? <div className="text-xs">{width}</div> : <span className="text-muted-foreground text-xs">-</span>;
    }
  },
  {
    id: "height",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Height" />,
    cell: ({ row }) => {
      const height = row.original.scenes?.stories?.story_types?.height;
      return height ? <div className="text-xs">{height}</div> : <span className="text-muted-foreground text-xs">-</span>;
    }
  },
  {
    accessorKey: "image_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Image URL" />,
    cell: ({ row }) => {
      const url = row.getValue("image_url") as string | null;
      return <MediaPreviewDialog url={url} type="image" alt={row.original.title || "Shot image"} />;
    }
  },
  {
    accessorKey: "audio_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Audio URL" />,
    cell: ({ row }) => {
      const url = row.getValue("audio_url") as string | null;
      return <MediaPreviewDialog url={url} type="audio" alt={row.original.title || "Shot audio"} />;
    }
  },
  {
    accessorKey: "video_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Video URL" />,
    cell: ({ row }) => {
      const url = row.getValue("video_url") as string | null;
      return <MediaPreviewDialog url={url} type="video" alt={row.original.title || "Shot video"} />;
    }
  },
  {
    accessorKey: "final_shot_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Final Shot URL" />,
    cell: ({ row }) => {
      const url = row.getValue("final_shot_url") as string | null;
      return <MediaPreviewDialog url={url} type="video" alt={`${row.original.title} - Final` || "Final shot"} />;
    }
  },
  {
    accessorKey: "image_upload_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Image Upload" />,
    cell: ({ row }) => {
      const url = row.getValue("image_upload_url") as string | null;
      return <MediaPreviewDialog url={url || null} type="image" alt="Uploaded image" />;
    }
  },
  {
    accessorKey: "audio_upload_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Audio Upload" />,
    cell: ({ row }) => {
      const url = row.getValue("audio_upload_url") as string | null;
      return <MediaPreviewDialog url={url || null} type="audio" alt="Uploaded audio" />;
    }
  },
  {
    accessorKey: "video_upload_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Video Upload" />,
    cell: ({ row }) => {
      const url = row.getValue("video_upload_url") as string | null;
      return <MediaPreviewDialog url={url || null} type="video" alt="Uploaded video" />;
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
  {
    accessorKey: "updated_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("updated_at"));
      return <div className="text-xs">{date.toLocaleDateString()}</div>;
    }
  },
  actionsColumn
];
