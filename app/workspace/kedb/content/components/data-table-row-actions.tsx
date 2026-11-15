"use client";

import { Row } from "@tanstack/react-table";
import { Copy, MoreHorizontal, Trash, Edit, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Database } from "@/lib/database.types";
import { toast } from "sonner";

type KEDBEntry = Database["public"]["Tables"]["kedb"]["Row"];

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  const entry = row.original as KEDBEntry;

  const handleCopyId = () => {
    if (entry.id) {
      navigator.clipboard.writeText(entry.id);
      toast.success("Entry ID copied to clipboard");
    }
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    toast.info("Edit functionality coming soon");
  };

  const handleView = () => {
    // TODO: Implement view functionality
    toast.info("View functionality coming soon");
  };

  const handleDelete = async () => {
    // TODO: Implement delete functionality
    toast.info("Delete functionality coming soon");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="data-[state=open]:bg-muted size-8">
          <MoreHorizontal />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem onClick={handleView}>
          <Eye className="mr-2 h-4 w-4" />
          View Entry
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Entry
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyId}>
          <Copy className="mr-2 h-4 w-4" />
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          <Trash className="mr-2 h-4 w-4" />
          Delete Entry
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
