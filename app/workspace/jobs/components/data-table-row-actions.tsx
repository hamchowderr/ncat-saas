"use client";

import { Row } from "@tanstack/react-table";
import { Copy, ExternalLink, MoreHorizontal, Trash, Info } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Job } from "../data/schema";
import { toast } from "sonner";
import { JobResultViewer } from "./job-result-viewer";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  const job = row.original as Job;
  const [showResultDialog, setShowResultDialog] = useState(false);

  const handleCopyJobId = () => {
    if (job.nca_job_id) {
      navigator.clipboard.writeText(job.nca_job_id);
      toast.success("Job ID copied to clipboard");
    }
  };

  const handleOpenResult = () => {
    const message = job.nca_message;
    const isUrl = message && (message.startsWith("http://") || message.startsWith("https://"));

    if (isUrl) {
      window.open(message, "_blank");
    } else {
      toast.error("No result URL available");
    }
  };

  const handleViewDetails = () => {
    if (job.processing_status === "completed" && job.nca_endpoint) {
      setShowResultDialog(true);
    } else {
      toast.info("Detailed results are only available for completed jobs");
    }
  };

  const handleDelete = async () => {
    // TODO: Implement delete functionality
    toast.info("Delete functionality coming soon");
  };

  const hasResultUrl =
    job.nca_message &&
    (job.nca_message.startsWith("http://") || job.nca_message.startsWith("https://"));
  const canViewDetails = job.processing_status === "completed" && job.nca_endpoint;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="data-[state=open]:bg-muted size-8">
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem onClick={handleCopyJobId}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Job ID
          </DropdownMenuItem>
          {canViewDetails && (
            <DropdownMenuItem onClick={handleViewDetails}>
              <Info className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          )}
          {hasResultUrl && (
            <DropdownMenuItem onClick={handleOpenResult}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Result
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            <Trash className="mr-2 h-4 w-4" />
            Delete Job
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Result Details</DialogTitle>
            <DialogDescription>Detailed results for job {job.nca_job_id}</DialogDescription>
          </DialogHeader>
          <JobResultViewer
            jobId={job.id}
            endpoint={job.nca_endpoint || ""}
            status={job.processing_status || ""}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
