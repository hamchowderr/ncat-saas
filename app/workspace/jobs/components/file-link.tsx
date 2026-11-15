"use client";

import { ExternalLink, FileIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface FileLinkProps {
  fileId: string;
  fileName: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  showIcon?: boolean;
  showSize?: boolean;
  className?: string;
}

export function FileLink({
  fileId,
  fileName,
  fileUrl,
  fileSize,
  mimeType,
  showIcon = true,
  showSize = false,
  className = ""
}: FileLinkProps) {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileTypeIcon = (mimeType?: string) => {
    if (!mimeType) return null;
    if (mimeType.startsWith("video/")) return "🎬";
    if (mimeType.startsWith("audio/")) return "🎵";
    if (mimeType.startsWith("image/")) return "🖼️";
    return "📄";
  };

  const content = (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {showIcon && (
        <span className="text-base">{getFileTypeIcon(mimeType) || <FileIcon className="h-3 w-3" />}</span>
      )}
      <span className="max-w-[150px] truncate text-xs">{fileName}</span>
      {showSize && fileSize && (
        <Badge variant="secondary" className="text-[10px] h-4 px-1">
          {formatFileSize(fileSize)}
        </Badge>
      )}
    </div>
  );

  if (fileUrl) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
          >
            {content}
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
          </a>
        </TooltipTrigger>
        <TooltipContent className="max-w-md">
          <div className="space-y-1">
            <p className="text-xs font-medium">File Details</p>
            <p className="text-xs">Name: {fileName}</p>
            {mimeType && <p className="text-xs">Type: {mimeType}</p>}
            {fileSize && <p className="text-xs">Size: {formatFileSize(fileSize)}</p>}
            <p className="text-muted-foreground text-xs break-all">ID: {fileId}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="cursor-help">{content}</div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">File ID: {fileId}</p>
      </TooltipContent>
    </Tooltip>
  );
}
