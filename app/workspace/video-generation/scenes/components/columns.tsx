"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { Database } from "@/lib/database.types";
import { DataTableColumnHeader } from "@/app/workspace/jobs/components/data-table-column-header";
import { DataTableRowActions } from "@/app/workspace/jobs/components/data-table-row-actions";

type Scene = Database["public"]["Tables"]["scenes"]["Row"] & {
  stories: {
    id: string;
    title: string;
    user_id: string;
  } | null;
};

export const columns: ColumnDef<Scene>[] = [
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
      return <div className="font-mono text-xs font-medium">Scene {number}</div>;
    }
  },
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return <div className="max-w-[250px] truncate font-medium">{title}</div>;
    }
  },
  {
    accessorKey: "stories.title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Story" />,
    cell: ({ row }) => {
      const storyTitle = row.original.stories?.title;
      if (!storyTitle) return <span className="text-muted-foreground text-xs">No story</span>;

      return <div className="max-w-[200px] truncate text-xs">{storyTitle}</div>;
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
            status === "planned" && "bg-gray-100 text-gray-800 hover:bg-gray-100",
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

      if (videoUrl) {
        return (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            <span>View Scene</span>
          </a>
        );
      }

      return <span className="text-muted-foreground text-xs">Not generated</span>;
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
