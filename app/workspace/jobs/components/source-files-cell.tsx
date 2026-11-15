"use client";

import { useContext } from "react";
import { Files } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileLink } from "./file-link";
import { JobFilesContext } from "./data-table";

interface SourceFilesCellProps {
  jobId: string;
}

interface FileData {
  id: string;
  file_name: string;
  url: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export function SourceFilesCell({ jobId }: SourceFilesCellProps) {
  const jobFilesMap = useContext(JobFilesContext);
  const files = jobFilesMap[jobId] || [];

  if (files.length === 0) {
    return <span className="text-muted-foreground text-xs">No source files</span>;
  }

  if (files.length === 1) {
    const file = files[0];
    return (
      <FileLink
        fileId={file.id}
        fileName={file.file_name}
        fileUrl={file.url}
        fileSize={file.file_size}
        mimeType={file.mime_type}
        showIcon={true}
      />
    );
  }

  // Multiple files - show popover
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
          <Files className="h-3 w-3" />
          {files.length} Files
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-2">
          <div className="text-xs font-medium">Source Files</div>
          <div className="space-y-1.5">
            {files.map((file) => (
              <div key={file.id} className="hover:bg-accent rounded-md p-2">
                <FileLink
                  fileId={file.id}
                  fileName={file.file_name}
                  fileUrl={file.url}
                  fileSize={file.file_size}
                  mimeType={file.mime_type}
                  showIcon={true}
                  showSize={true}
                />
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
