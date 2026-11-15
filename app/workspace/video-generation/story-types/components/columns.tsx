"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Database } from "@/lib/database.types";
import { DataTableColumnHeader } from "@/app/workspace/jobs/components/data-table-column-header";
import { StoryTypeRowActions } from "./story-type-row-actions";

type StoryType = Database["public"]["Tables"]["story_types"]["Row"];

export const columns: ColumnDef<StoryType>[] = [
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
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Story Type" />,
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div className="font-medium">{name}</div>;
    }
  },
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

      // Calculate aspect ratio
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
        <div className="flex justify-center">
          {isActive ? (
            <svg
              className="h-5 w-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <StoryTypeRowActions row={row} />
  }
];
