"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { CreateVideoDialog } from "./create-video-dialog";

import { activeStatuses } from "../data/data";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between lg:hidden">
        <h1 className="me-4 text-xl font-bold tracking-tight lg:text-2xl">Videos</h1>
      </div>
      <div className="flex flex-col justify-between md:flex-row lg:items-center">
        <h1 className="me-4 hidden text-xl font-bold tracking-tight lg:flex lg:text-2xl">Videos</h1>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            placeholder="Filter videos..."
            value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("description")?.setFilterValue(event.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
          {table.getColumn("active_video") && (
            <DataTableFacetedFilter
              column={table.getColumn("active_video")}
              title="Active"
              options={activeStatuses}
            />
          )}
          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={() => table.resetColumnFilters()}>
              Reset
              <X />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CreateVideoDialog />
          <div className="hidden lg:flex">
            <DataTableViewOptions table={table} />
          </div>
        </div>
      </div>
    </div>
  );
}
