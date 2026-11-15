"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { createClient } from "@/lib/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2, FileX } from "lucide-react";
import { useInfiniteQuery, type SupabaseTableData } from "@/hooks/use-infinite-query";
import { MediaFileItem } from "./media-file-item";
import { cn } from "@/lib/utils";
import { staggerFadeInUp, fadeIn } from "@/lib/animations";
import { useUser } from "@/hooks/use-user";

type FileRecord = SupabaseTableData<"files">;

type MediaType = "all" | "video" | "audio" | "image";

interface MediaFilesSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectionMode?: boolean;
  onFileSelect?: (file: FileRecord) => void;
}

export function MediaFilesSidebar({ open, onOpenChange, selectionMode = false, onFileSelect }: MediaFilesSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<MediaType>("all");
  const supabase = createClient();
  const filesContainerRef = useRef<HTMLDivElement>(null);
  const previousFilesCountRef = useRef<number>(0);
  const { data: user } = useUser();

  // Fetch files with infinite query
  const { data, isLoading, isFetching, hasMore, fetchNextPage } = useInfiniteQuery<FileRecord>({
    tableName: "files",
    columns: "*",
    pageSize: 20,
    enabled: !!user?.id, // Only fetch when user is available
    queryKey: [user?.id], // Force refetch when user loads
    trailingQuery: (query) => {
      console.log("🔍 MediaFilesSidebar trailingQuery called with user?.id:", user?.id);
      let modifiedQuery = query
        .eq("user_id", user?.id) // Filter by current user
        .order("created_at", { ascending: false });

      // Filter by media type if not "all"
      if (selectedType !== "all") {
        modifiedQuery = modifiedQuery.ilike("mime_type", `${selectedType}/%`);
      }

      return modifiedQuery;
    }
  });

  // Debug logging
  useEffect(() => {
    console.log("📊 MediaFilesSidebar state:", {
      userLoaded: !!user,
      userId: user?.id,
      dataLength: data.length,
      isLoading,
      isFetching,
      hasMore
    });
  }, [user, data, isLoading, isFetching, hasMore]);

  // Client-side search filtering
  const filteredFiles = useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(
      (file) =>
        file.file_name.toLowerCase().includes(query) ||
        file.original_name.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  const mediaTypeFilters: { label: string; value: MediaType }[] = [
    { label: "All Files", value: "all" },
    { label: "Videos", value: "video" },
    { label: "Audio", value: "audio" },
    { label: "Images", value: "image" }
  ];

  // Animate files when they load or change
  useEffect(() => {
    if (!filesContainerRef.current || filteredFiles.length === 0) return;

    const fileElements = filesContainerRef.current.querySelectorAll("[data-file-item]");

    // Only animate new files (not re-renders)
    if (filteredFiles.length > previousFilesCountRef.current) {
      const newItems = Array.from(fileElements).slice(previousFilesCountRef.current);
      if (newItems.length > 0) {
        staggerFadeInUp(newItems as unknown as HTMLElement[], {
          stagger: 50,
          delay: 100
        });
      }
    } else if (filteredFiles.length !== previousFilesCountRef.current) {
      // Files changed (filter applied), animate all
      fadeIn(fileElements as unknown as HTMLElement[], {
        stagger: 30,
        delay: 50
      });
    }

    previousFilesCountRef.current = filteredFiles.length;
  }, [filteredFiles]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:w-[440px] sm:max-w-[440px]">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>{selectionMode ? "Select a File" : "My Media Files"}</SheetTitle>
          <p className="text-muted-foreground text-sm">
            {selectionMode
              ? "Choose a file to share in the chat"
              : "Browse and copy URLs from your uploaded files"}
          </p>
        </SheetHeader>

        {/* Search and Filters */}
        <div className="space-y-4 border-b px-6 py-4">
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

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            {mediaTypeFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={selectedType === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(filter.value)}
                className={cn("text-xs", selectedType === filter.value && "pointer-events-none")}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Files List */}
        <ScrollArea className="flex-1">
          <div className="px-6 py-4">
            {isLoading ? (
              <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
                <Loader2 className="mb-2 h-8 w-8 animate-spin" />
                <p className="text-sm">Loading files...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
                <FileX className="mb-3 h-12 w-12 opacity-50" />
                <p className="text-sm font-medium">No files found</p>
                <p className="mt-1 text-xs">
                  {searchQuery
                    ? "Try a different search term"
                    : selectedType !== "all"
                      ? `No ${selectedType} files uploaded yet`
                      : "Upload some files to get started"}
                </p>
              </div>
            ) : (
              <div ref={filesContainerRef} className="space-y-2">
                {filteredFiles.map((file) => (
                  <div key={file.id} data-file-item style={{ opacity: 0 }}>
                    <MediaFileItem
                      file={file}
                      selectionMode={selectionMode}
                      onSelect={onFileSelect}
                    />
                  </div>
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      onClick={() => fetchNextPage()}
                      disabled={isFetching}
                      className="w-full"
                    >
                      {isFetching ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        `Load More (${data.length} of ${data.length + 20}+ files)`
                      )}
                    </Button>
                  </div>
                )}

                {/* File Count */}
                {!hasMore && filteredFiles.length > 0 && (
                  <p className="text-muted-foreground pt-4 text-center text-xs">
                    Showing all {filteredFiles.length} file{filteredFiles.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
