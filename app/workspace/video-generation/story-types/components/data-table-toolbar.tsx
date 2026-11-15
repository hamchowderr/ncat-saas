"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";

import { priorities, statuses } from "../data/data";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  // Check if is_active column exists in the current view
  const hasIsActiveColumn = table.getAllColumns().some((col) => col.id === "is_active");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between lg:hidden">
        <h1 className="me-4 text-xl font-bold tracking-tight lg:text-2xl">Story Types</h1>
      </div>
      <div className="flex flex-col justify-between md:flex-row lg:items-center">
        <h1 className="me-4 hidden text-xl font-bold tracking-tight lg:flex lg:text-2xl">Story Types</h1>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            placeholder="Filter story types..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
          {hasIsActiveColumn && table.getColumn("is_active") && (
            <DataTableFacetedFilter
              column={table.getColumn("is_active")}
              title="Status"
              options={statuses}
            />
          )}
          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={() => table.resetColumnFilters()}>
              Reset
              <X />
            </Button>
          )}
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <DataTableViewOptions table={table} />
        </div>
      </div>
    </div>
  );
}
