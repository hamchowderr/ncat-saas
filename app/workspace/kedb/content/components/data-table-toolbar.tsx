"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";

import { statuses, expertiseLevels } from "../data/data";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between lg:hidden">
        <h1 className="me-4 text-xl font-bold tracking-tight lg:text-2xl">K.E.D.B</h1>
      </div>
      <div className="flex flex-col justify-between md:flex-row lg:items-center">
        <h1 className="me-4 hidden text-xl font-bold tracking-tight lg:flex lg:text-2xl">K.E.D.B</h1>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            placeholder="Filter entries..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={statuses}
            />
          )}
          {table.getColumn("expertise_level") && (
            <DataTableFacetedFilter
              column={table.getColumn("expertise_level")}
              title="Expertise"
              options={expertiseLevels}
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
