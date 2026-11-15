"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ExternalLink, CheckCircle2, Circle } from "lucide-react";
import { Database } from "@/lib/database.types";
import { DataTableColumnHeader } from "@/app/workspace/jobs/components/data-table-column-header";
import { DataTableRowActions } from "@/app/workspace/jobs/components/data-table-row-actions";

type Video = Database["public"]["Tables"]["videos"]["Row"];

export const columns: ColumnDef<Video>[] = [
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
    accessorKey: "vid",
    header: ({ column }) => <DataTableColumnHeader column={column} title="VID" />,
    cell: ({ row }) => {
      const vid = row.getValue("vid") as number;
      return <div className="font-mono text-xs font-semibold">{vid}</div>;
    }
  },
  {
    accessorKey: "active_video",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Active" />,
    cell: ({ row }) => {
      const isActive = row.getValue("active_video") as boolean;
      return (
        <div className="flex items-center">
          {isActive ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <Circle className="h-4 w-4 text-gray-300" />
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const rowValue = String(row.getValue(id));
      return value.includes(rowValue);
    }
  },
  {
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      if (!description)
        return <span className="text-muted-foreground text-xs">No description</span>;

      return <div className="max-w-[300px] truncate text-xs">{description}</div>;
    }
  },
  {
    id: "video_dimensions",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Video Size" />,
    cell: ({ row }) => {
      const width = row.original.video_width;
      const height = row.original.video_height;

      if (!width || !height) {
        return <span className="text-muted-foreground text-xs">Not set</span>;
      }

      const aspectRatio = (width / height).toFixed(4);
      return (
        <div className="flex flex-col">
          <span className="text-xs font-medium">
            {width} × {height}
          </span>
          <span className="text-muted-foreground text-xs">AR: {aspectRatio}</span>
        </div>
      );
    }
  },
  {
    id: "clip_dimensions",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Clip Size" />,
    cell: ({ row }) => {
      const width = row.original.clip_width;
      const height = row.original.clip_height;

      if (!width || !height) {
        return <span className="text-muted-foreground text-xs">Not set</span>;
      }

      const aspectRatio = (width / height).toFixed(4);
      return (
        <div className="flex flex-col">
          <span className="text-xs font-medium">
            {width} × {height}
          </span>
          <span className="text-muted-foreground text-xs">AR: {aspectRatio}</span>
        </div>
      );
    }
  },
  {
    accessorKey: "videos_to_create",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Clips Target" />,
    cell: ({ row }) => {
      const count = row.getValue("videos_to_create") as number | null;
      if (!count) return <span className="text-muted-foreground text-xs">Not set</span>;

      return (
        <Badge variant="secondary" className="text-xs">
          {count} clips
        </Badge>
      );
    }
  },
  {
    accessorKey: "video_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Video" />,
    cell: ({ row }) => {
      const videoUrl = row.getValue("video_url") as string | null;

      if (!videoUrl) {
        return <span className="text-muted-foreground text-xs">No video</span>;
      }

      return (
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          <span>View</span>
        </a>
      );
    }
  },
  {
    id: "transcripts",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Files" />,
    cell: ({ row }) => {
      const transcriptUrl = row.original.transcript_url;
      const srtUrl = row.original.srt_url;
      const segmentsUrl = row.original.segments_url;

      const files = [
        { label: "Transcript", url: transcriptUrl },
        { label: "SRT", url: srtUrl },
        { label: "Segments", url: segmentsUrl }
      ].filter((f) => f.url);

      if (files.length === 0) {
        return <span className="text-muted-foreground text-xs">No files</span>;
      }

      return (
        <div className="flex flex-wrap gap-1">
          {files.map((file) => (
            <a
              key={file.label}
              href={file.url!}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              {file.label}
            </a>
          ))}
        </div>
      );
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
