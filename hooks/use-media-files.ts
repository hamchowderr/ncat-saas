"use client";

import { useMemo } from "react";
import { useInfiniteQuery, type SupabaseTableData } from "@/hooks/use-infinite-query";
import { matchesMimeType } from "@/lib/media-types";

type FileRecord = SupabaseTableData<"files">;

interface UseMediaFilesOptions {
  accept?: string; // MIME type pattern (e.g., "video/*")
  searchQuery?: string; // Search by filename
  pageSize?: number;
  enabled?: boolean; // Control when query runs
}

/**
 * Custom hook for fetching and filtering media files
 *
 * Features:
 * - Automatic MIME type filtering
 * - Client-side search
 * - Infinite scroll support
 * - Sorted by most recent first
 *
 * @example
 * const { files, isLoading, hasMore, fetchMore } = useMediaFiles({
 *   accept: "video/*",
 *   searchQuery: "intro"
 * });
 */
export function useMediaFiles(options: UseMediaFilesOptions = {}) {
  const { accept, searchQuery = "", pageSize = 20, enabled = true } = options;

  // Fetch files with infinite query
  const { data, isLoading, isFetching, hasMore, fetchNextPage, error } =
    useInfiniteQuery<FileRecord>({
      tableName: "files",
      columns: "*",
      pageSize,
      enabled,
      trailingQuery: (query) => {
        return query.order("created_at", { ascending: false });
      }
    });

  // Filter files by MIME type and search query
  const filteredFiles = useMemo(() => {
    let filtered = data;

    // Filter by MIME type if accept pattern provided
    if (accept) {
      filtered = filtered.filter((file) => {
        return matchesMimeType(file.mime_type, accept);
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (file) =>
          file.file_name.toLowerCase().includes(query) ||
          file.original_name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [data, accept, searchQuery]);

  return {
    files: filteredFiles,
    allFiles: data,
    isLoading,
    isFetching,
    hasMore,
    fetchMore: fetchNextPage,
    error,
    isEmpty: !isLoading && filteredFiles.length === 0,
    totalCount: filteredFiles.length
  };
}
