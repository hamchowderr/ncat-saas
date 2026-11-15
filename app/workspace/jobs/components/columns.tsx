"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ExternalLink, Loader2, Info, Files } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Job } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { SourceFilesCell } from "./source-files-cell";

// Helper function to parse and format message content in 3-column grid
function parseMessageContent(content: string): React.ReactNode {
  try {
    // Try to parse as JSON
    const parsed = JSON.parse(content);

    // Render in 3-column grid
    return (
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(parsed).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="text-muted-foreground text-xs capitalize">
              {key.replace(/_/g, " ")}
            </div>
            <div className="rounded-md bg-muted/50 px-3 py-2 font-mono text-xs">
              {typeof value === "object" && value !== null
                ? JSON.stringify(value, null, 2)
                : String(value)}
            </div>
          </div>
        ))}
      </div>
    );
  } catch {
    // Not JSON - check if it's a simple key-value format
    const lines = content.split("\n").filter((line) => line.trim());

    // Check if lines contain key-value pairs (key: value format)
    const hasKeyValuePairs = lines.some((line) => line.includes(":"));

    if (hasKeyValuePairs && lines.length > 1) {
      // Convert to object first for 3-column grid
      const dataObject: Record<string, string> = {};
      lines.forEach((line) => {
        const [key, ...valueParts] = line.split(":");
        const value = valueParts.join(":").trim();
        if (key && value) {
          dataObject[key.trim()] = value;
        }
      });

      return (
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(dataObject).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="text-muted-foreground text-xs">{key}</div>
              <div className="rounded-md bg-muted/50 px-3 py-2 font-mono text-xs">{value}</div>
            </div>
          ))}
        </div>
      );
    }

    // Plain text - just display it with proper formatting
    return (
      <div className="text-muted-foreground whitespace-pre-wrap text-xs leading-relaxed">
        {content}
      </div>
    );
  }
}

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
    cell: ({ row }) => {
      const job = row.original;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              <div className="max-w-[100px] cursor-help truncate font-mono text-xs">
                {row.getValue("nca_job_id") || "N/A"}
              </div>
              <Info className="text-muted-foreground h-3 w-3" />
            </div>
          </TooltipTrigger>
          <TooltipContent className="w-96 p-4" side="right" align="start">
            <div className="space-y-3">
              {/* Header */}
              <div className="border-b pb-2">
                <div className="text-sm font-semibold">Job Details</div>
                <div className="text-muted-foreground font-mono text-xs">
                  {job.nca_job_id || "N/A"}
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-1.5">
                <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Status
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    <span className="font-medium">{job.processing_status || "Unknown"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Code:</span>{" "}
                    <span className="font-medium">{job.nca_code || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-1.5">
                <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Performance
                </div>
                {job.processing_status === "processing" &&
                job.nca_queue_time === null &&
                job.nca_run_time === null &&
                job.nca_total_time === null ? (
                  <div className="text-muted-foreground flex items-center gap-2 py-2 text-xs">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Request is being processed by NCAT API...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Queue Time:</span>{" "}
                      <span className="font-medium">
                        {job.nca_queue_time !== null ? `${job.nca_queue_time}s` : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Run Time:</span>{" "}
                      <span className="font-medium">
                        {job.nca_run_time !== null ? `${job.nca_run_time}s` : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Time:</span>{" "}
                      <span className="font-medium">
                        {job.nca_total_time !== null ? `${job.nca_total_time}s` : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Queue Length:</span>{" "}
                      <span className="font-medium">
                        {job.nca_queue_length !== null ? job.nca_queue_length : "N/A"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* System Info */}
              <div className="space-y-1.5">
                <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  System
                </div>
                {job.processing_status === "processing" &&
                !job.nca_build_number &&
                !job.nca_pid &&
                !job.nca_queue_id ? (
                  <div className="text-muted-foreground py-2 text-xs">
                    System information will be available once processing completes
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Build:</span>{" "}
                      <span className="font-medium">{job.nca_build_number || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">PID:</span>{" "}
                      <span className="font-medium">{job.nca_pid || "N/A"}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Queue ID:</span>{" "}
                      <span className="font-mono text-xs">{job.nca_queue_id || "N/A"}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Section */}
              {job.error_message && (
                <div className="space-y-1.5 rounded-md bg-red-50 p-2">
                  <div className="text-xs font-medium tracking-wide text-red-900 uppercase">
                    Error
                  </div>
                  <div className="text-xs break-words text-red-700">{job.error_message}</div>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-muted-foreground border-t pt-2 text-xs">
                <div>Created: {new Date(job.created_at).toLocaleString()}</div>
                <div>Updated: {new Date(job.updated_at).toLocaleString()}</div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    },
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "nca_build_number",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Build Number" />,
    cell: ({ row }) => {
      const buildNumber = row.getValue("nca_build_number") as string | null;
      const status = row.original.processing_status;

      if (!buildNumber && status === "processing") {
        return <div className="text-muted-foreground text-xs">Processing...</div>;
      }

      return <div className="text-xs">{buildNumber ?? "N/A"}</div>;
    }
  },
  {
    accessorKey: "processing_status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("processing_status") as string;

      return (
        <Badge
          className={cn(
            "flex items-center gap-1.5 text-xs",
            status === "completed" && "bg-green-100 text-green-800 hover:bg-green-100",
            status === "failed" && "bg-red-100 text-red-800 hover:bg-red-100",
            status === "error" && "bg-red-100 text-red-800 hover:bg-red-100",
            status === "processing" && "bg-blue-100 text-blue-800 hover:bg-blue-100",
            status === "pending" && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
            !status && "bg-gray-100 text-gray-800 hover:bg-gray-100"
          )}
          variant="outline"
        >
          {status === "processing" && <Loader2 className="h-3 w-3 animate-spin" />}
          {status || "Unknown"}
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
      const status = row.original.processing_status;

      if (!totalTime && status === "processing") {
        return (
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>In progress...</span>
          </div>
        );
      }

      return <div className="text-xs">{totalTime ? `${totalTime}ms` : "N/A"}</div>;
    }
  },
  {
    accessorKey: "nca_endpoint",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Endpoint" />,
    cell: ({ row }) => {
      const endpoint = row.getValue("nca_endpoint") as string;
      const status = row.original.processing_status;

      if (!endpoint) {
        return (
          <div className="text-muted-foreground text-xs">
            {status === "processing" ? "Processing..." : "N/A"}
          </div>
        );
      }

      // Determine badge color based on endpoint type
      const getEndpointColor = (endpoint: string) => {
        if (endpoint.includes("video")) return "bg-blue-100 text-blue-700 border-blue-200";
        if (endpoint.includes("audio")) return "bg-green-100 text-green-700 border-green-200";
        if (endpoint.includes("image")) return "bg-purple-100 text-purple-700 border-purple-200";
        if (
          endpoint.includes("media") ||
          endpoint.includes("convert") ||
          endpoint.includes("transcribe")
        ) {
          return "bg-orange-100 text-orange-700 border-orange-200";
        }
        if (endpoint.includes("code") || endpoint.includes("python")) {
          return "bg-pink-100 text-pink-700 border-pink-200";
        }
        if (endpoint.includes("s3") || endpoint.includes("storage")) {
          return "bg-cyan-100 text-cyan-700 border-cyan-200";
        }
        return "bg-gray-100 text-gray-700 border-gray-200";
      };

      // Extract readable name from endpoint
      const formatEndpointName = (endpoint: string) => {
        // Remove /v1/ prefix and replace dashes with spaces
        return endpoint
          .replace(/^\/v1\//, "")
          .split("/")
          .map((part) => part.replace(/-/g, " "))
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" / ");
      };

      return (
        <Badge className={cn("font-mono text-xs", getEndpointColor(endpoint))} variant="outline">
          {formatEndpointName(endpoint)}
        </Badge>
      );
    }
  },
  {
    id: "source_files",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Source Files" />,
    cell: ({ row }) => <SourceFilesCell jobId={row.original.id} />,
    enableSorting: false
  },
  {
    accessorKey: "nca_message",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Result" />,
    cell: ({ row }) => {
      const message = row.getValue("nca_message") as string;
      const status = row.getValue("processing_status") as string;
      const resultFiles = row.original.nca_result_files as Array<{
        url: string;
        filename: string;
        mime_type: string;
      }> | null;

      // Check if there are multiple result files
      if (status === "completed" && resultFiles && resultFiles.length > 0) {
        // Multiple files - show popover with list
        if (resultFiles.length > 1) {
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
                  <Files className="h-3 w-3" />
                  {resultFiles.length} Files
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3" align="start">
                <div className="space-y-2">
                  <div className="text-xs font-medium">Generated Files</div>
                  <div className="space-y-1.5">
                    {resultFiles.map((file, index) => (
                      <a
                        key={index}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:bg-accent flex items-center gap-2 rounded-md p-2 text-xs"
                      >
                        <ExternalLink className="h-3 w-3 flex-shrink-0 text-blue-600" />
                        <span className="flex-1 truncate text-blue-600 hover:text-blue-800">
                          {file.filename}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {file.mime_type.split("/")[0]}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          );
        }

        // Single file from nca_result_files array
        const file = resultFiles[0];
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="max-w-[150px] truncate">View File</span>
              </a>
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <div className="space-y-1">
                <p className="text-xs font-medium">Click to view file in new tab</p>
                <p className="text-muted-foreground text-xs break-all">{file.url}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      }

      // Fallback to nca_message for backward compatibility (old jobs without nca_result_files)
      const isUrl = message && (message.startsWith("http://") || message.startsWith("https://"));

      if (status === "completed" && isUrl) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={message}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="max-w-[150px] truncate">View File</span>
              </a>
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <div className="space-y-1">
                <p className="text-xs font-medium">Click to view file in new tab</p>
                <p className="text-muted-foreground text-xs break-all">{message}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      }

      // For non-URL messages or non-completed jobs, show with popover
      if (message && message.length > 30) {
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs font-normal">
                <Info className="h-3 w-3" />
                <span className="max-w-[120px] truncate">{message}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[500px] p-4" align="start">
              <div className="space-y-3">
                <div className="border-b pb-2">
                  <div className="text-sm font-semibold">Result Message</div>
                </div>
                {parseMessageContent(message)}
              </div>
            </PopoverContent>
          </Popover>
        );
      }

      // Show helpful message for processing jobs
      if (!message && status === "processing") {
        return (
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Processing request...</span>
          </div>
        );
      }

      return <div className="max-w-[200px] truncate text-xs">{message || "No message"}</div>;
    }
  },
  {
    accessorKey: "error_message",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Error" />,
    cell: ({ row }) => {
      const error = row.getValue("error_message") as string;

      if (error && error.length > 30) {
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs font-normal text-red-600 hover:text-red-700"
              >
                <Info className="h-3 w-3" />
                <span className="max-w-[120px] truncate">{error}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[500px] p-4" align="start">
              <div className="space-y-3">
                <div className="border-b border-red-200 pb-2">
                  <div className="text-sm font-semibold text-red-900">Error Details</div>
                </div>
                <div className="rounded-md bg-red-50 p-3">
                  {parseMessageContent(error)}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
      }

      if (error) {
        return <div className="max-w-[150px] truncate text-xs text-red-600">{error}</div>;
      }

      return <span className="text-muted-foreground text-xs">No errors</span>;
    }
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div className="text-xs">{date.toLocaleString()}</div>;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />
  }
];
