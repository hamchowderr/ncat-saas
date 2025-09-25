"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  File,
  UploadIcon,
  FolderPlus,
  ChevronDownIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  XIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { FileUploadDialog } from "../../file-manager/components/file-upload-dialog";
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

export function FileManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [allFileItems, setAllFileItems] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchError, setLastFetchError] = useState<string | null>(null);
  const supabase = createClient();

  const isMobile = useIsMobile();

  const fetchFiles = async (retryCount = 0, showLoading = true) => {
    if (showLoading && retryCount === 0) {
      setIsLoading(true);
      setLastFetchError(null);
    }

    try {
      // Get session to ensure proper authentication for RLS
      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        setLastFetchError("Session error - please refresh the page");
        setIsLoading(false);
        return;
      }

      if (!session?.user) {
        console.error("No authenticated session");
        setLastFetchError("Not authenticated - please log in again");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error fetching files:", error);

        // Retry logic for production consistency issues
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(`Retrying file fetch in ${delay}ms (attempt ${retryCount + 1}/3)`);
          setTimeout(() => {
            fetchFiles(retryCount + 1, false);
          }, delay);
        } else {
          setLastFetchError(`Failed to load files: ${error.message}`);
          setIsLoading(false);
        }
      } else if (data) {
        setAllFileItems(data);
        setLastFetchError(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Fetch files error:", error);

      // Retry logic for network/connection errors
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`Retrying file fetch in ${delay}ms (attempt ${retryCount + 1}/3)`);
        setTimeout(() => {
          fetchFiles(retryCount + 1, false);
        }, delay);
      } else {
        setLastFetchError(
          `Failed to load files: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const sortItems = (items: FileItem[]): FileItem[] => {
    return [...items].sort((a, b) => {
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
  };

  const filteredItems = allFileItems.filter((item) =>
    item.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sortedAndFilteredItems = sortItems(filteredItems);

  useEffect(() => {
    setSelectedItem(null);
    setShowMobileDetails(false);
  }, []);

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

  const FileDetailContent = ({ selectedItem }: { selectedItem: FileItem }) => {
    return (
      <div className="space-y-6 px-4">
        <div className="flex flex-col items-center space-y-8 py-4">
          <div className="flex items-center">
            <div className="scale-[3]">{getFileIcon(selectedItem.mime_type)}</div>
          </div>
          <h2 className="text-foreground text-center">{selectedItem.file_name}</h2>
        </div>

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

        <div>
          <h3 className="text-foreground mb-4 text-xs font-semibold tracking-wider uppercase">
            Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-foreground text-sm">File Sharing</span>
              <Switch checked={true} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground text-sm">Backup</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground text-sm">Sync</span>
              <Switch />
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

          <div className="border-border flex items-center justify-between gap-2">
            <FileUploadDialog
              onUploadSuccess={(uploadedFiles) => {
                // Optimistic update: immediately add uploaded files to the UI
                if (uploadedFiles && uploadedFiles.length > 0) {
                  setAllFileItems((prev) => [...uploadedFiles, ...prev]);
                }

                // Background refresh to ensure consistency with delay for production
                setTimeout(() => {
                  fetchFiles(0, false);
                }, 500);
              }}
            />
          </div>
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
                      <DropdownMenuItem>Compress</DropdownMenuItem>
                      <DropdownMenuItem>Archive</DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Move</DropdownMenuItem>
                      <DropdownMenuItem>Copy</DropdownMenuItem>
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
                      <DropdownMenuItem>Compress</DropdownMenuItem>
                      <DropdownMenuItem>Archive</DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Move</DropdownMenuItem>
                      <DropdownMenuItem>Copy</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600!">Delete</DropdownMenuItem>
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
                  <div>
                    <FileUploadDialog
                      onUploadSuccess={(uploadedFiles) => {
                        // Optimistic update: immediately add uploaded files to the UI
                        if (uploadedFiles && uploadedFiles.length > 0) {
                          setAllFileItems((prev) => [...uploadedFiles, ...prev]);
                        }

                        // Background refresh to ensure consistency with delay for production
                        setTimeout(() => {
                          fetchFiles(0, false);
                        }, 500);
                      }}
                    />
                  </div>
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
    </div>
  );
}
