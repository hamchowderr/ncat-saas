"use client";

import { useState, useRef, useEffect, memo } from "react";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Folder, Search, Loader2, FileX, Check, Upload, X } from "lucide-react";
import { useMediaFiles } from "@/hooks/use-media-files";
import { getPublicFileUrl } from "@/hooks/use-file-url";
import { getAcceptLabel, getMediaIcon, formatFileSize, getMediaCategory } from "@/lib/media-types";
import { cn } from "@/lib/utils";
import { staggerFadeInUp } from "@/lib/animations";
import { type SupabaseTableData } from "@/hooks/use-infinite-query";

type FileRecord = SupabaseTableData<"files">;

interface MediaFilePickerProps {
  accept?: string; // MIME type pattern (e.g., "video/*")
  onSelect: (url: string, fileId: string) => void; // NEW: Now passes both URL and file ID
  onClear?: () => void; // Callback to clear the current selection
  currentValue?: string; // Currently selected URL
  placeholder?: string;
  buttonVariant?: "default" | "outline" | "ghost";
  buttonClassName?: string; // Custom className for the button
  multiple?: boolean; // Future: support multiple file selection
  disabled?: boolean;
}

/**
 * MediaFilePicker Component
 *
 * A popover-based file picker that allows users to select files from their
 * Supabase storage. Features search, MIME type filtering, and infinite scroll.
 *
 * @example
 * <MediaFilePicker
 *   accept="video/*"
 *   onSelect={(url) => setVideoUrl(url)}
 *   currentValue={videoUrl}
 * />
 */
const MediaFilePickerComponent = ({
  accept,
  onSelect,
  onClear,
  currentValue = "",
  placeholder,
  buttonVariant = "outline",
  buttonClassName,
  disabled = false
}: MediaFilePickerProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();
  const filesListRef = useRef<HTMLDivElement>(null);

  const { files, isLoading, isFetching, hasMore, fetchMore, isEmpty, allFiles, error } =
    useMediaFiles({
      accept,
      searchQuery,
      enabled: open // Only fetch files when popover is open
    });

  // Debug logging - DISABLED (uncomment for debugging)
  // useEffect(() => {
  //   console.log("MediaFilePicker Debug:", {
  //     popoverOpen: open,
  //     accept,
  //     searchQuery,
  //     isLoading,
  //     allFilesCount: allFiles.length,
  //     filteredFilesCount: files.length,
  //     isEmpty,
  //     error
  //   });

  //   // Debug: Show MIME types of all files when popover opens
  //   if (open && allFiles.length > 0) {
  //     console.log("📁 All files with MIME types:");
  //     allFiles.forEach((file, index) => {
  //       console.log(
  //         `  ${index + 1}. ${file.original_name} - MIME: "${file.mime_type}" (${file.mime_type ? "valid" : "NULL"})`
  //       );
  //     });

  //     if (accept && files.length === 0 && allFiles.length > 0) {
  //       console.warn(
  //         `⚠️ FILTER MISMATCH: ${allFiles.length} files found but 0 match pattern "${accept}"`
  //       );
  //       console.warn(
  //         "   This usually means files have incorrect or missing MIME types in database"
  //       );
  //     }
  //   }
  // }, [
  //   open,
  //   accept,
  //   searchQuery,
  //   isLoading,
  //   files.length,
  //   allFiles.length,
  //   isEmpty,
  //   error
  // ]);

  // Animate file items when they appear - DISABLED FOR DEBUGGING
  // useEffect(() => {
  //   if (!filesListRef.current || files.length === 0) return;

  //   const fileElements = filesListRef.current.querySelectorAll("[data-file-item]");
  //   if (fileElements.length > 0) {
  //     staggerFadeInUp(fileElements as unknown as HTMLElement[], {
  //       stagger: 30,
  //       delay: 50,
  //       duration: 300
  //     });
  //   }
  // }, [files]);

  const handleSelectFile = (file: FileRecord) => {
    try {
      const publicUrl = getPublicFileUrl(file);
      onSelect(publicUrl, file.id); // Pass both URL and file ID
      setOpen(false);
      setSearchQuery(""); // Reset search
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  const isFileSelected = (file: FileRecord): boolean => {
    if (!currentValue) return false;
    const publicUrl = getPublicFileUrl(file);
    return currentValue === publicUrl;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const MediaIcon = ({ mimeType }: { mimeType: string | null }) => {
    const { name, color } = getMediaIcon(mimeType);
    const IconComponent = {
      Video: () => (
        <svg className={cn("h-5 w-5", color)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
      Music: () => (
        <svg className={cn("h-5 w-5", color)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      ),
      Image: () => (
        <svg className={cn("h-5 w-5", color)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      File: () => (
        <svg className={cn("h-5 w-5", color)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      )
    }[name];

    return <IconComponent />;
  };

  const acceptLabel = accept ? getAcceptLabel(accept) : "All Files";
  const hasSelection = !!currentValue;

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClear) {
      onClear();
    } else {
      onSelect("", ""); // Fallback to clearing via onSelect if onClear not provided
    }
  };

  return (
    <div className="flex gap-1">
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            variant={buttonVariant}
            size="icon"
            type="button"
            className={cn("flex-shrink-0", buttonClassName)}
            title={placeholder || `Select from ${acceptLabel.toLowerCase()}`}
            disabled={disabled}
          >
            <Folder className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[400px] p-0"
          align="end"
          onOpenAutoFocus={(e) => e.preventDefault()}
          style={{ pointerEvents: "auto" }}
        >
          {/* Header */}
          <div className="border-b p-4">
            <h4 className="mb-3 text-sm font-semibold">Select File</h4>

            {/* Search Input */}
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="pl-9"
              />
            </div>

            {/* File Type Badge */}
            {accept && (
              <div className="mt-2">
                <span className="bg-muted inline-flex items-center rounded-md px-2 py-1 text-xs font-medium">
                  {acceptLabel} ({files.length})
                </span>
              </div>
            )}
          </div>

          {/* File List */}
          <div
            className="h-[300px] overflow-y-auto p-2"
            ref={filesListRef}
            style={{ pointerEvents: "auto" }}
            onWheel={(e) => {
              // Manually handle wheel scrolling since Radix Popover prevents default behavior
              const target = e.currentTarget;
              target.scrollTop += e.deltaY;
            }}
          >
                {isLoading ? (
                <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
                  <Loader2 className="mb-2 h-8 w-8 animate-spin" />
                  <p className="text-sm">Loading files...</p>
                </div>
              ) : isEmpty ? (
                <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
                  <FileX className="mb-3 h-12 w-12 opacity-50" />
                  <p className="text-sm font-medium">No files found</p>
                  <p className="mt-1 text-xs">
                    {searchQuery
                      ? "Try a different search term"
                      : accept
                        ? `No ${acceptLabel.toLowerCase()} uploaded yet`
                        : "Upload some files to get started"}
                  </p>
                </div>
              ) : (
                <>
                  {files.map((file, index) => {
                    const selected = isFileSelected(file);
                    return (
                      <button
                        key={file.id}
                        type="button"
                        data-file-item
                        data-file-index={index}
                        style={{ pointerEvents: "auto" }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors",
                          "hover:bg-accent focus:bg-accent focus:ring-ring focus:ring-2 focus:outline-none",
                          selected && "bg-accent border-primary border-2"
                        )}
                        onClick={() => handleSelectFile(file)}
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          <MediaIcon mimeType={file.mime_type} />
                        </div>

                        {/* File Info */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{file.original_name}</p>
                          <div className="text-muted-foreground flex items-center gap-2 text-xs">
                            <span>{formatFileSize(file.file_size)}</span>
                            {file.created_at && (
                              <>
                                <span>•</span>
                                <span>{formatDate(file.created_at)}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Selected Indicator */}
                        {selected && (
                          <div className="flex-shrink-0">
                            <Check className="text-primary h-5 w-5" />
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="p-2">
                      <Button
                        variant="outline"
                        onClick={() => fetchMore()}
                        disabled={isFetching}
                        className="w-full"
                        size="sm"
                      >
                        {isFetching ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Load More"
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
          </div>

          {/* Footer with Upload Button */}
          <div className="bg-muted/50 border-t p-3">
            <p className="text-muted-foreground text-center text-xs">
              Need to upload a file?{" "}
              <a href="/workspace/file-manager" className="text-primary hover:underline">
                Go to File Manager
              </a>
            </p>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear button - only shown when file is selected */}
      {hasSelection && (
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={handleClear}
          className="text-muted-foreground hover:text-destructive flex-shrink-0"
          title="Clear selection"
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

// Memoize component to prevent re-renders when props haven't changed
export const MediaFilePicker = memo(MediaFilePickerComponent);
