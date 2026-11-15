"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { File, ImageIcon, Video, Music, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { type SupabaseTableData } from "@/hooks/use-infinite-query";
import { liftUp, liftDown, popIn, pulse } from "@/lib/animations";

type FileRecord = SupabaseTableData<"files">;

interface MediaFileItemProps {
  file: FileRecord;
  selectionMode?: boolean;
  onSelect?: (file: FileRecord) => void;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return ext;
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) {
    return <File className="h-5 w-5 text-gray-500" />;
  }
  if (mimeType.startsWith("image/")) {
    return <ImageIcon className="h-5 w-5 text-blue-500" />;
  }
  if (mimeType.startsWith("video/")) {
    return <Video className="h-5 w-5 text-purple-500" />;
  }
  if (mimeType.startsWith("audio/")) {
    return <Music className="h-5 w-5 text-green-500" />;
  }
  return <File className="h-5 w-5 text-gray-500" />;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function MediaFileItem({ file, selectionMode = false, onSelect }: MediaFileItemProps) {
  const [copied, setCopied] = useState(false);
  const supabase = createClient();
  const itemRef = useRef<HTMLDivElement>(null);
  const checkIconRef = useRef<SVGSVGElement>(null);

  const handleCopyUrl = async () => {
    try {
      const bucket = file.bucket || "files";
      const { data } = supabase.storage.from(bucket).getPublicUrl(file.file_path);

      await navigator.clipboard.writeText(data.publicUrl);

      setCopied(true);
      toast.success("URL copied to clipboard!");

      // Animate the success checkmark
      if (checkIconRef.current) {
        popIn(checkIconRef.current as unknown as HTMLElement, {
          duration: 400,
          ease: "spring(1, 80, 10, 0)"
        });
      }

      // Add a subtle pulse to the whole item
      if (itemRef.current) {
        pulse(itemRef.current, {
          duration: 600
        });
      }

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying URL:", error);
      toast.error("Failed to copy URL");
    }
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(file);
      // Add a subtle animation feedback
      if (itemRef.current) {
        pulse(itemRef.current, {
          duration: 400
        });
      }
    }
  };

  // Hover animations
  const handleMouseEnter = () => {
    if (itemRef.current) {
      liftUp(itemRef.current, {
        duration: 200
      });
    }
  };

  const handleMouseLeave = () => {
    if (itemRef.current) {
      liftDown(itemRef.current, {
        duration: 200
      });
    }
  };

  const fileExtension = getFileExtension(file.original_name);

  return (
    <div
      ref={itemRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
        "hover:bg-accent hover:border-accent-foreground/20"
      )}
      style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}
    >
      {/* File Icon */}
      <div className="flex-shrink-0">{getFileIcon(file.mime_type)}</div>

      {/* File Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.original_name}</p>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span>{formatFileSize(file.file_size)}</span>
          {fileExtension && (
            <>
              <span>•</span>
              <span className="uppercase">{fileExtension}</span>
            </>
          )}
          {file.created_at && (
            <>
              <span>•</span>
              <span>{formatDate(file.created_at)}</span>
            </>
          )}
        </div>
      </div>

      {/* Action Button - Select or Copy URL */}
      <Button
        variant={selectionMode ? "default" : "ghost"}
        size="sm"
        onClick={selectionMode ? handleSelect : handleCopyUrl}
        className={cn(
          "flex-shrink-0 transition-opacity",
          selectionMode ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          copied && !selectionMode && "opacity-100"
        )}
      >
        {selectionMode ? (
          <>
            <Check className="mr-1 h-4 w-4" />
            <span className="text-xs">Select</span>
          </>
        ) : copied ? (
          <>
            <Check ref={checkIconRef} className="mr-1 h-4 w-4 text-green-600" />
            <span className="text-xs">Copied</span>
          </>
        ) : (
          <>
            <Copy className="mr-1 h-4 w-4" />
            <span className="text-xs">Copy URL</span>
          </>
        )}
      </Button>
    </div>
  );
}
