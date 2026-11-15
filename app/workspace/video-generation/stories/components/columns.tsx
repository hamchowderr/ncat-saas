"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { Database } from "@/lib/database.types";
import { DataTableColumnHeader } from "@/app/workspace/jobs/components/data-table-column-header";
import { DataTableRowActions } from "@/app/workspace/jobs/components/data-table-row-actions";

type Story = Database["public"]["Tables"]["stories"]["Row"] & {
  story_types: {
    id: string;
    name: string;
    description: string | null;
  } | null;
};

export const columns: ColumnDef<Story>[] = [
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
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return <div className="max-w-[300px] truncate font-medium">{title}</div>;
    }
  },
  {
    accessorKey: "story_types.name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Story Type" />,
    cell: ({ row }) => {
      const storyType = row.original.story_types?.name;
      if (!storyType) return <span className="text-muted-foreground text-xs">None</span>;

      return (
        <Badge variant="outline" className="text-xs">
          {storyType}
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
            status === "in_progress" && "bg-blue-100 text-blue-800 hover:bg-blue-100",
            status === "draft" && "bg-gray-100 text-gray-800 hover:bg-gray-100",
            status === "archived" && "bg-orange-100 text-orange-800 hover:bg-orange-100"
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
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      if (!description) return <span className="text-muted-foreground text-xs">No description</span>;

      return <div className="max-w-[250px] truncate text-xs">{description}</div>;
    }
  },
  {
    accessorKey: "final_video_url",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Video" />,
    cell: ({ row }) => {
      const videoUrl = row.getValue("final_video_url") as string | null;
      const videoWithCaptions = row.original.final_video_with_captions_url;

      if (videoWithCaptions) {
        return (
          <a
            href={videoWithCaptions}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            <span>With Captions</span>
          </a>
        );
      }

      if (videoUrl) {
        return (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            <span>View Video</span>
          </a>
        );
      }

      return <span className="text-muted-foreground text-xs">Not generated</span>;
    }
  },
  {
    accessorKey: "total_generation_time_seconds",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Gen Time" />,
    cell: ({ row }) => {
      const time = row.getValue("total_generation_time_seconds") as number | null;
      if (!time) return <span className="text-muted-foreground text-xs">N/A</span>;

      // Convert seconds to human readable format
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      return <div className="text-xs">{minutes}m {seconds}s</div>;
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
