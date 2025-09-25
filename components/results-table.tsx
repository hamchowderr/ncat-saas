"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ResultsTableProps {
  data: any[];
  onRowClick?: (row: any) => void;
}

export function ResultsTable({ data, onRowClick }: ResultsTableProps) {
  if (!data || data.length === 0) {
    return <p className="p-4 text-center">The query returned no results.</p>;
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {headers.map((header) => (
              <TableHead className="first:pl-6 last:pr-6 lg:first:pl-8 lg:last:pr-8" key={header}>
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={cn(onRowClick && "hover:bg-muted/50 group cursor-pointer")}
            >
              {headers.map((header) => (
                <TableCell
                  className="text-muted-foreground group-hover:text-foreground min-w-[8rem] text-xs first:pl-6 last:pr-6 lg:first:pl-8 lg:last:pr-8"
                  key={`${rowIndex}-${header}`}
                >
                  <div className="w-fit max-w-96 truncate font-mono text-xs">
                    {JSON.stringify(row[header]).replace(/^"|"$/g, "")}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
