"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ExternalLink, Image as ImageIcon, Volume2 } from "lucide-react";
import { Database } from "@/lib/database.types";
import { DataTableColumnHeader } from "@/app/workspace/jobs/components/data-table-column-header";
import { DataTableRowActions } from "@/app/workspace/jobs/components/data-table-row-actions";

type Shot = Database["public"]["Tables"]["shots"]["Row"] & {
  scenes: {
    id: string;
    title: string;
    sequence_number: number;
    stories: {
      id: string;
      title: string;
      user_id: string;
    } | null;
  } | null;
};

export const columns: ColumnDef<Shot>[] = [
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
    accessorKey: "sequence_number",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    cell: ({ row }) => {
      const number = row.getValue("sequence_number") as number;
      const sceneNumber = row.original.scenes?.sequence_number;
      return (
        <div className="font-mono text-xs font-medium">
          {sceneNumber}.{number}
        </div>
      );
    }
  },
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return <div className="max-w-[200px] truncate font-medium">{title}</div>;
    }
  },
  {
    accessorKey: "scenes.title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Scene" />,
    cell: ({ row }) => {
      const sceneTitle = row.original.scenes?.title;
      if (!sceneTitle) return <span className="text-muted-foreground text-xs">No scene</span>;

      return <div className="max-w-[150px] truncate text-xs">{sceneTitle}</div>;
    }
  },
  {
    accessorKey: "shot_type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Shot Type" />,
    cell: ({ row }) => {
      const shotType = row.getValue("shot_type") as string | null;
      if (!shotType) return <span className="text-muted-foreground text-xs">Not set</span>;

      return (
        <Badge variant="outline" className="text-xs">
          {shotType.replace(/_/g, " ")}
        </Badge>
      );
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      return (
        <Badge
          className={cn(
            "text-xs",
            status === "completed" && "bg-green-100 text-green-800 hover:bg-green-100",
            status === "generating" && "bg-blue-100 text-blue-800 hover:bg-blue-100",
            status === "pending" && "bg-gray-100 text-gray-800 hover:bg-gray-100",
            status === "failed" && "bg-red-100 text-red-800 hover:bg-red-100"
          )}
          variant="outline"
        >
          {status || "Unknown"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: "duration_seconds",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />,
    cell: ({ row }) => {
      const duration = row.getValue("duration_seconds") as number | null;
      if (!duration) return <span className="text-muted-foreground text-xs">Not set</span>;

      return <div className="text-xs">{duration}s</div>;
    }
  },
  {
    accessorKey: "image_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Image" />,
    cell: ({ row }) => {
      const imageUrl = row.getValue("image_url") as string | null;

      if (imageUrl) {
        return (
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            <ImageIcon className="h-3 w-3" />
            <span>View</span>
          </a>
        );
      }

      return <span className="text-muted-foreground text-xs">Not generated</span>;
    }
  },
  {
    accessorKey: "audio_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Audio" />,
    cell: ({ row }) => {
      const audioUrl = row.getValue("audio_url") as string | null;

      if (audioUrl) {
        return (
          <a
            href={audioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            <Volume2 className="h-3 w-3" />
            <span>Listen</span>
          </a>
        );
      }

      return <span className="text-muted-foreground text-xs">Not generated</span>;
    }
  },
  {
    accessorKey: "video_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Video" />,
    cell: ({ row }) => {
      const videoUrl = row.getValue("video_url") as string | null;

      if (videoUrl) {
        return (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            <span>View Shot</span>
          </a>
        );
      }

      return <span className="text-muted-foreground text-xs">Not generated</span>;
    }
  },
  {
    accessorKey: "ai_model_used",
    header: ({ column }) => <DataTableColumnHeader column={column} title="AI Model" />,
    cell: ({ row }) => {
      const model = row.getValue("ai_model_used") as string | null;
      if (!model) return <span className="text-muted-foreground text-xs">N/A</span>;

      return (
        <Badge variant="outline" className="font-mono text-xs">
          {model}
        </Badge>
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
