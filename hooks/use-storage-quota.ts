import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getWorkspaceStorageQuota, type StorageQuota } from "@/lib/storage-quota";
import { useWorkspace } from "./use-workspace";

/**
 * Hook to fetch and manage storage quota information for the current workspace
 *
 * Uses React Query for automatic caching, background refetching, and real-time updates.
 *
 * @returns Query result with storage quota data, loading state, and error handling
 *
 * @example
 * ```tsx
 * function StorageDisplay() {
 *   const { data: quota, isLoading, error } = useStorageQuota();
 *
 *   if (isLoading) return <Skeleton />;
 *   if (error) return <ErrorMessage />;
 *
 *   return (
 *     <div>
 *       <p>{quota.percentage}% of {formatBytes(quota.quota)} used</p>
 *       <ProgressBar value={quota.percentage} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useStorageQuota(): UseQueryResult<StorageQuota | null, Error> {
  const { data: workspace } = useWorkspace();

  return useQuery({
    queryKey: ["storageQuota", workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) {
        throw new Error("No workspace found");
      }

      const quota = await getWorkspaceStorageQuota(workspace.id);

      if (!quota) {
        throw new Error("Failed to fetch storage quota");
      }

      return quota;
    },
    enabled: !!workspace?.id,
    retry: 2,
    staleTime: 1 * 60 * 1000, // Cache for 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    refetchOnWindowFocus: true // Refetch when user returns to tab
  });
}
