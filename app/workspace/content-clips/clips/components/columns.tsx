"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ExternalLink, Image as ImageIcon } from "lucide-react";
import { Database } from "@/lib/database.types";
import { DataTableColumnHeader } from "@/app/workspace/jobs/components/data-table-column-header";
import { DataTableRowActions } from "@/app/workspace/jobs/components/data-table-row-actions";

type Clip = Database["public"]["Tables"]["clips"]["Row"] & {
  videos: {
    id: string;
    description: string | null;
    active_video: boolean | null;
    video_width: number | null;
    video_height: number | null;
    clip_width: number | null;
    clip_height: number | null;
    video_url: string | null;
  } | null;
};

// Helper function to format duration
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(2)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
}

export const columns: ColumnDef<Clip>[] = [
  {
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
  },
  {
    accessorKey: "clip_id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Clip ID" />,
    cell: ({ row }) => {
      const clipId = row.getValue("clip_id") as number;
      return <div className="font-mono text-xs font-semibold">{clipId}</div>;
    }
  },
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    cell: ({ row }) => {
      const title = row.getValue("title") as string | null;
      if (!title) return <span className="text-muted-foreground text-xs">Untitled</span>;

      return <div className="max-w-[250px] truncate text-xs font-medium">{title}</div>;
    }
  },
  {
    id: "video",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Video" />,
    cell: ({ row }) => {
      const video = row.original.videos;
      if (!video) {
        return <span className="text-muted-foreground text-xs">No video</span>;
      }

      return (
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="max-w-[150px] truncate text-xs">
            {video.description || "Untitled Video"}
          </Badge>
          {video.active_video && <span className="text-xs font-medium text-green-600">Active</span>}
        </div>
      );
    }
  },
  {
    id: "duration",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />,
    cell: ({ row }) => {
      const startTime = row.original.start_time;
      const endTime = row.original.end_time;

      if (startTime === null || endTime === null) {
        return <span className="text-muted-foreground text-xs">Not set</span>;
      }

      const duration = Number(endTime) - Number(startTime);
      return <div className="text-xs font-medium">{formatDuration(duration)}</div>;
    }
  },
  {
    id: "timing",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Start → End" />,
    cell: ({ row }) => {
      const startTime = row.original.start_time;
      const endTime = row.original.end_time;

      if (startTime === null || endTime === null) {
        return <span className="text-muted-foreground text-xs">Not set</span>;
      }

      return (
        <div className="flex flex-col text-xs">
          <span>
            {Number(startTime).toFixed(3)}s → {Number(endTime).toFixed(3)}s
          </span>
        </div>
      );
    }
  },
  {
    accessorKey: "transcript",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Transcript" />,
    cell: ({ row }) => {
      const transcript = row.getValue("transcript") as string | null;
      if (!transcript) {
        return <span className="text-muted-foreground text-xs">No transcript</span>;
      }

      return <div className="max-w-[200px] truncate text-xs">{transcript}</div>;
    }
  },
  {
    id: "media",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Media" />,
    cell: ({ row }) => {
      const clipUrl = row.original.clip_url;
      const thumbnailUrl = row.original.thumbnail_url;
      const finalClipUrl = row.original.final_clip_url;
      const croppedClipUrl = row.original.cropped_clip_url;

      const mediaFiles = [
        { label: "Clip", url: clipUrl },
        { label: "Final", url: finalClipUrl },
        { label: "Cropped", url: croppedClipUrl }
      ].filter((f) => f.url);

      if (mediaFiles.length === 0 && !thumbnailUrl) {
        return <span className="text-muted-foreground text-xs">No media</span>;
      }

      return (
        <div className="flex flex-col gap-1">
          {thumbnailUrl && (
            <a
              href={thumbnailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              <ImageIcon className="h-3 w-3" />
              <span>Thumbnail</span>
            </a>
          )}
          {mediaFiles.map((file) => (
            <a
              key={file.label}
              href={file.url!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              <span>{file.label}</span>
            </a>
          ))}
        </div>
      );
    }
  },
  {
    id: "crop_position",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Crop Center" />,
    cell: ({ row }) => {
      const centerX = row.original.center_x_width;
      const centerY = row.original.center_y_height;

      if (centerX === null || centerY === null) {
        return <span className="text-muted-foreground text-xs">Not set</span>;
      }

      return (
        <div className="font-mono text-xs">
          ({centerX}, {centerY})
        </div>
      );
    }
  },
  {
    accessorKey: "clip_description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
    cell: ({ row }) => {
      const description = row.getValue("clip_description") as string | null;
      if (!description) {
        return <span className="text-muted-foreground text-xs">No description</span>;
      }

      return <div className="max-w-[200px] truncate text-xs">{description}</div>;
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
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />
  }
];
