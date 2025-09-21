"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import { Job } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<Job>[] = [
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
    accessorKey: "nca_job_id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Job ID" />,
    cell: ({ row }) => (
      <div className="font-mono text-xs max-w-[120px] truncate">
        {row.getValue("nca_job_id") || "N/A"}
      </div>
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "nca_build_number",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Build Number" />,
    cell: ({ row }) => (
      <div className="text-xs">
        {row.getValue("nca_build_number") || "N/A"}
      </div>
    )
  },
  {
    accessorKey: "processing_status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("processing_status") as string;
      
      return (
        <Badge 
          className={cn(
            "text-xs",
            status === 'completed' && 'bg-green-100 text-green-800 hover:bg-green-100',
            status === 'failed' && 'bg-red-100 text-red-800 hover:bg-red-100',
            status === 'error' && 'bg-red-100 text-red-800 hover:bg-red-100',
            status === 'processing' && 'bg-blue-100 text-blue-800 hover:bg-blue-100',
            status === 'pending' && 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
            !status && 'bg-gray-100 text-gray-800 hover:bg-gray-100'
          )}
          variant="outline"
        >
          {status || 'Unknown'}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: "nca_total_time",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total Time" />,
    cell: ({ row }) => {
      const totalTime = row.getValue("nca_total_time") as number;
      return (
        <div className="text-xs">
          {totalTime ? `${totalTime}ms` : "N/A"}
        </div>
      );
    }
  },
  {
    accessorKey: "nca_message",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Message" />,
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-xs">
        {row.getValue("nca_message") || "No message"}
      </div>
    )
  },
  {
    accessorKey: "error_message",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Error" />,
    cell: ({ row }) => {
      const error = row.getValue("error_message") as string;
      return error ? (
        <div className="max-w-[150px] truncate text-xs text-red-600">
          {error}
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">No errors</span>
      );
    }
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return (
        <div className="text-xs">
          {date.toLocaleString()}
        </div>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />
  }
];
