"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/hooks/use-user";
import { useFileUrl } from "@/hooks/use-file-url";
import { cn } from "@/lib/utils";
import { getMediaCategory } from "@/lib/media-types";
import {
  File,
  FolderPlus,
  ChevronDownIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  XIcon,
  Download,
  ExternalLink
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUploadDialog } from "@/components/file-upload-dialog";

import { createClient } from "@/lib/client";
import { Database } from "@/lib/database.types";
import FileManagerPagination from "./pagination";

// Use the proper database type for file records
export type FileItem = Database["public"]["Tables"]["files"]["Row"];

function formatFileSize(bytes: number | null): string {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) {
    return <File className="h-5 w-5 text-gray-500" />;
  }
  if (mimeType.startsWith("image/")) {
    return <File className="h-5 w-5 text-blue-500" />;
  }
  if (mimeType.startsWith("video/")) {
    return <File className="h-5 w-5 text-purple-500" />;
  }
  if (mimeType.startsWith("audio/")) {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded bg-green-600 text-xs font-bold text-white">
        ♪
      </div>
    );
  }
  switch (mimeType) {
    case "application/pdf":
      return (
        <div className="flex h-5 w-5 items-center justify-center rounded bg-red-600 text-xs font-bold text-white">
          <FileTextIcon className="size-3" />
        </div>
      );
    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return (
        <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-xs font-bold text-white">
          W
        </div>
      );
    default:
      return <File className="h-5 w-5 text-gray-500" />;
  }
}

type SortOption = "name" | "date" | "size";
type SortDirection = "asc" | "desc";

/**
 * File Manager Component
 *
 * Manages user files with advanced features including:
 * - File listing with search and sorting
 * - Upload, rename, and delete operations
 * - File details panel
 * - Selection and batch operations
 *
 * Uses React Query for all data operations with automatic caching and retry logic.
 */
export function FileManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState<FileItem | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const supabase = createClient();

  const isMobile = useIsMobile();

  // Fetch files with React Query
  const {
    data: allFileItems = [],
    isLoading,
    error: fetchError
  } = useQuery({
    queryKey: ["files", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const supabase = createClient();
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching files:", error);
        throw error;
      }

      return data as FileItem[];
    },
    enabled: !!user?.id,
    retry: 3,
    // Exponential backoff: 1s, 2s, 4s
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 8000),
    staleTime: 2 * 60 * 1000
  });

  // Memoized sorting and filtering for better performance
  const sortedAndFilteredItems = useMemo(() => {
    const filteredItems = allFileItems.filter((item) =>
      item.file_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...filteredItems].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.file_name.localeCompare(b.file_name);
          break;
        case "date":
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case "size":
          comparison = (a.file_size || 0) - (b.file_size || 0);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [allFileItems, searchQuery, sortBy, sortDirection]);

  // Mutation: Rename file
  const renameMutation = useMutation({
    mutationFn: async ({ fileId, newName }: { fileId: string; newName: string }) => {
      if (!user) throw new Error("User not authenticated");

      const supabase = createClient();
      const { error } = await supabase
        .from("files")
        .update({ file_name: newName.trim() })
        .eq("id", fileId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      setRenameDialogOpen(false);
      setFileToRename(null);
      setNewFileName("");
    },
    onError: (error) => {
      alert(`Failed to rename file: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });

  // Mutation: Delete file
  const deleteMutation = useMutation({
    mutationFn: async (file: FileItem) => {
      if (!user) throw new Error("User not authenticated");

      const supabase = createClient();

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from(file.bucket || "files")
        .remove([file.file_path]);

      if (storageError) throw storageError;

      // Delete file record from database
      const { error: dbError } = await supabase
        .from("files")
        .delete()
        .eq("id", file.id)
        .eq("user_id", user.id);

      if (dbError) throw dbError;

      return file.id;
    },
    onSuccess: (deletedFileId) => {
      queryClient.invalidateQueries({ queryKey: ["files"] });

      // Clear selection if this was the selected item
      if (selectedItem?.id === deletedFileId) {
        setSelectedItem(null);
      }
    },
    onError: (error) => {
      alert(`Failed to delete file: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });

  const handleSortChange = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(option);
      setSortDirection("asc");
    }
  };

  const getSortLabel = () => {
    const directionIcon = sortDirection === "asc" ? "↑" : "↓";
    switch (sortBy) {
      case "name":
        return `Name ${directionIcon}`;
      case "date":
        return `Date ${directionIcon}`;
      case "size":
        return `Size ${directionIcon}`;
    }
  };

  const handleItemClick = (item: FileItem) => {
    setSelectedItem(item);
    setShowMobileDetails(true);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === sortedAndFilteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(sortedAndFilteredItems.map((item) => item.id)));
    }
  };

  const toggleItemSelection = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.add(itemId);
    }
    setSelectedItems(newSelectedItems);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const openRenameDialog = (file: FileItem) => {
    setFileToRename(file);
    setNewFileName(file.file_name);
    setRenameDialogOpen(true);
  };

  const handleRename = () => {
    if (!fileToRename || !newFileName.trim()) return;
    renameMutation.mutate({ fileId: fileToRename.id, newName: newFileName });
  };

  const handleDelete = (file: FileItem) => {
    if (
      !confirm(
        `Are you sure you want to delete "${file.file_name}"? This action cannot be undone.`
      )
    ) {
      return;
    }
    deleteMutation.mutate(file);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-10 w-[140px]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">Failed to load files</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {fetchError instanceof Error ? fetchError.message : "An error occurred"}
          </p>
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["files"] })}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const FileDetailContent = ({ selectedItem }: { selectedItem: FileItem }) => {
    // Generate file URL
    const { url: fileUrl, isLoading: urlLoading } = useFileUrl(selectedItem);

    // Determine media category
    const mediaCategory = getMediaCategory(selectedItem.mime_type);

    // Render preview based on file type
    const renderPreview = () => {
      if (urlLoading) {
        return (
          <div className="flex items-center justify-center h-48 bg-muted rounded">
            <Skeleton className="h-full w-full" />
          </div>
        );
      }

      if (!fileUrl) {
        return (
          <div className="flex items-center justify-center h-48 bg-muted rounded">
            <p className="text-sm text-muted-foreground">Preview unavailable</p>
          </div>
        );
      }

      switch (mediaCategory) {
        case "image":
          return (
            <div className="relative w-full h-48 bg-muted rounded overflow-hidden">
              <Image
                src={fileUrl}
                alt={selectedItem.file_name}
                fill
                className="object-contain"
                sizes="320px"
              />
            </div>
          );

        case "video":
          return (
            <div className="w-full bg-muted rounded overflow-hidden">
              <video
                src={fileUrl}
                controls
                className="w-full h-auto max-h-64"
                preload="metadata"
              >
                Your browser does not support video playback.
              </video>
            </div>
          );

        case "audio":
          return (
            <div className="w-full bg-muted rounded p-4">
              <audio
                src={fileUrl}
                controls
                className="w-full"
                preload="metadata"
              >
                Your browser does not support audio playback.
              </audio>
            </div>
          );

        case "other":
          // Check if it's a PDF
          if (selectedItem.mime_type === "application/pdf") {
            return (
              <div className="w-full h-96 bg-muted rounded overflow-hidden">
                <iframe
                  src={fileUrl}
                  className="w-full h-full"
                  title={selectedItem.file_name}
                />
              </div>
            );
          }

          // Check if it's a document
          if (
            selectedItem.mime_type === "application/msword" ||
            selectedItem.mime_type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            selectedItem.mime_type === "application/vnd.ms-excel" ||
            selectedItem.mime_type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          ) {
            return (
              <div className="flex flex-col items-center justify-center gap-3 h-48 bg-muted rounded p-4">
                <div className="scale-[2]">{getFileIcon(selectedItem.mime_type)}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(fileUrl, "_blank")}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Document
                </Button>
              </div>
            );
          }

          // Default: download button
          return (
            <div className="flex flex-col items-center justify-center gap-3 h-48 bg-muted rounded p-4">
              <div className="scale-[2]">{getFileIcon(selectedItem.mime_type)}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(fileUrl, "_blank")}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download File
              </Button>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div className="space-y-6 px-4">
        {/* File name header */}
        <div className="flex flex-col items-center space-y-4 py-4">
          <h2 className="text-foreground text-center font-medium">{selectedItem.file_name}</h2>
        </div>

        {/* Preview section */}
        <div>
          <h3 className="text-foreground mb-4 text-xs font-semibold tracking-wider uppercase">
            Preview
          </h3>
          {renderPreview()}
        </div>

        {/* Info section */}
        <div>
          <h3 className="text-foreground mb-4 text-xs font-semibold tracking-wider uppercase">
            Info
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Type</span>
              <span className="text-foreground text-sm capitalize">{selectedItem.mime_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Size</span>
              <span className="text-foreground text-sm">
                {formatFileSize(selectedItem.file_size ?? 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Owner</span>
              <span className="text-foreground text-sm">You</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Location</span>
              <span className="text-sm">My Files</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Modified</span>
              <span className="text-foreground text-sm">
                {selectedItem.created_at
                  ? new Date(selectedItem.created_at).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Created</span>
              <span className="text-foreground text-sm">
                {selectedItem.created_at
                  ? new Date(selectedItem.created_at).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex">
      <div className="border-border min-w-0 flex-1 space-y-4">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Files</h1>
          </div>

          <FileUploadDialog
            maxFileSize={1024 * 1024 * 1024}
            allowedMimeTypes={["image/*", "audio/*", "video/*", "application/*", "text/*"]}
            onUploadComplete={() => queryClient.invalidateQueries({ queryKey: ["files"] })}
          />
        </div>

        <div className="flex border-t">
          <div className="min-w-0 grow">
            <div className="flex items-center justify-between border-b p-2 pe-1! lg:p-4">
              <div className="flex grow items-center gap-2">
                <Checkbox
                  checked={
                    selectedItems.size === sortedAndFilteredItems.length &&
                    sortedAndFilteredItems.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
                {selectedItems.size > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <ChevronDownIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600!">Send to Trash</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Input
                    placeholder="Search for files and folders..."
                    className="bg-background w-full border-0 shadow-none focus:ring-0!"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(e.target.value)
                    }
                  />
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">Sort: {getSortLabel()}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSortChange("name")}>
                    <div className="flex w-full items-center justify-between">
                      <span>Name</span>
                      {sortBy === "name" && (
                        <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange("date")}>
                    <div className="flex w-full items-center justify-between">
                      <span>Date</span>
                      {sortBy === "date" && (
                        <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange("size")}>
                    <div className="flex w-full items-center justify-between">
                      <span>Size</span>
                      {sortBy === "size" && (
                        <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {sortedAndFilteredItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "hover:bg-muted flex cursor-pointer items-center justify-between border-b p-2 lg:p-4",
                  selectedItem?.id === item.id && "bg-muted"
                )}
                onClick={() => handleItemClick(item)}
              >
                <div className="flex min-w-0 items-center space-x-4">
                  <Checkbox
                    defaultChecked={selectedItem?.id === item.id}
                    checked={selectedItems.has(item.id)}
                    onClick={(e: React.MouseEvent) => toggleItemSelection(item.id, e)}
                  />
                  <div className="shrink-0">{getFileIcon(item.mime_type)}</div>
                  <div className="min-w-0 truncate">{item.file_name}</div>
                </div>

                <div className="text-muted-foreground flex items-center space-x-4 text-sm">
                  <span className="hidden w-16 text-right lg:inline">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A"}
                  </span>
                  <span className="hidden w-16 text-right lg:inline">
                    {formatFileSize(item.file_size ?? 0)}
                  </span>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="text-xs">U</AvatarFallback>
                  </Avatar>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontalIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          // Generate public URL for viewing
                          const publicUrl = `http://127.0.0.1:54321/storage/v1/object/public/files/${item.file_path}`;
                          window.open(publicUrl, "_blank", "noopener,noreferrer");
                        }}
                      >
                        View File
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          openRenameDialog(item);
                        }}
                      >
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600!"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item);
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            {sortedAndFilteredItems.length === 0 && searchQuery && (
              <div className="text-muted-foreground flex items-center justify-center p-8 text-center">
                No files or folders found matching &#34;{searchQuery}&#34;
              </div>
            )}

            {sortedAndFilteredItems.length === 0 && !searchQuery && (
              <div className="flex h-[calc(100vh-var(--header-height)-3rem)] flex-col items-center justify-center">
                <div className="mx-auto max-w-md space-y-4 text-center">
                  <FolderPlus className="mx-auto size-14 opacity-50" />
                  <h2 className="text-muted-foreground">No files uploaded yet.</h2>
                  <p className="text-muted-foreground text-sm">
                    Click the &#34;Upload Files&#34; button to get started.
                  </p>
                  <FileUploadDialog
                    maxFileSize={1024 * 1024 * 1024}
                    allowedMimeTypes={["image/*", "audio/*", "video/*", "application/*", "text/*"]}
                    onUploadComplete={() => queryClient.invalidateQueries({ queryKey: ["files"] })}
                  />
                </div>
              </div>
            )}

            {sortedAndFilteredItems.length > 0 && (
              <div className="mt-4">
                <FileManagerPagination />
              </div>
            )}
          </div>

          {/* Desktop Right Panel - Details */}
          {selectedItem && !isMobile ? (
            <div className="relative w-80 border-s py-6">
              <Button
                onClick={() => setSelectedItem(null)}
                variant="ghost"
                size="icon"
                className="absolute top-2 right-0"
              >
                <XIcon />
              </Button>
              <FileDetailContent selectedItem={selectedItem} />
            </div>
          ) : null}
        </div>
      </div>

      {selectedItem && isMobile && (
        <Sheet open={showMobileDetails} onOpenChange={setShowMobileDetails}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>File Details</SheetTitle>
            </SheetHeader>
            <FileDetailContent selectedItem={selectedItem} />
          </SheetContent>
        </Sheet>
      )}

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
            <DialogDescription>
              Enter a new name for the file. The file extension will be preserved.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fileName">File Name</Label>
              <Input
                id="fileName"
                value={newFileName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewFileName(e.target.value)
                }
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter" && !renameMutation.isPending) {
                    handleRename();
                  }
                }}
                placeholder="Enter new file name"
                disabled={renameMutation.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRenameDialogOpen(false);
                setFileToRename(null);
                setNewFileName("");
              }}
              disabled={renameMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={renameMutation.isPending || !newFileName.trim()}
            >
              {renameMutation.isPending ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
