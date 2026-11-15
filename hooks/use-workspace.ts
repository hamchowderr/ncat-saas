"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/client";
import { useUser } from "./use-user";
import { useWorkspaceContext } from "@/lib/workspace-context";

export interface Workspace {
  id: string;
  slug: string;
  name: string;
  created_at: string;
}

export interface WorkspaceWithMembership extends Workspace {
  workspace_member_role?: string;
  membership_type?: string;
}

/**
 * Hook to fetch current user's workspace
 *
 * Uses React Query with dependent query pattern - only fetches when user is available.
 * Provides automatic caching and refetching capabilities.
 *
 * @returns {Object} React Query result with workspace data
 * @returns {WorkspaceWithMembership | null} data - Current workspace with membership info
 * @returns {boolean} isLoading - True while fetching workspace
 * @returns {Error | null} error - Error if workspace fetch failed
 * @returns {Function} refetch - Function to manually refetch workspace
 *
 * @example
 * ```tsx
 * const { data: workspace, isLoading, refetch } = useWorkspace()
 *
 * if (isLoading) return <Skeleton />
 * if (!workspace) return <div>No workspace found</div>
 *
 * return <div>{workspace.name}</div>
 * ```
 */
export function useWorkspace() {
  const { data: user, isLoading: userLoading } = useUser();
  const queryClient = useQueryClient();
  const { activeWorkspaceId, loading: contextLoading, isImpersonating, isAppAdmin } = useWorkspaceContext();

  const query = useQuery({
    queryKey: ["workspace", activeWorkspaceId, user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      if (!activeWorkspaceId) {
        return null;
      }

      const supabase = createClient();

      // If admin is impersonating (viewing workspace they're not member of),
      // fetch workspace directly instead of through membership
      if (isAppAdmin && isImpersonating) {
        const { data: workspaceData, error: workspaceError } = await supabase
          .from("workspaces")
          .select(
            `
            id,
            slug,
            name,
            created_at,
            workspace_application_settings(membership_type)
          `
          )
          .eq("id", activeWorkspaceId)
          .single();

        if (workspaceError) {
          throw workspaceError;
        }

        if (!workspaceData) {
          return null;
        }

        const workspace: WorkspaceWithMembership = {
          id: workspaceData.id,
          slug: workspaceData.slug,
          name: workspaceData.name,
          created_at: workspaceData.created_at,
          workspace_member_role: "readonly", // Admin has read-only access when impersonating
          membership_type: Array.isArray(workspaceData.workspace_application_settings)
            ? workspaceData.workspace_application_settings[0]?.membership_type
            : undefined
        };

        return workspace;
      }

      // Regular case: Get workspace through membership
      const { data, error } = await supabase
        .from("workspace_members")
        .select(
          `
          workspace_member_role,
          workspaces!inner(
            id,
            slug,
            name,
            created_at,
            workspace_application_settings(membership_type)
          )
        `
        )
        .eq("workspace_member_id", user.id)
        .eq("workspace_id", activeWorkspaceId)
        .limit(1)
        .single();

      if (error) {
        throw error;
      }

      if (!data || !data.workspaces) {
        return null;
      }

      // Type assertion: workspaces is a single object due to !inner join
      const workspace = data.workspaces as unknown as {
        id: string;
        slug: string;
        name: string;
        created_at: string;
        workspace_application_settings: { membership_type: string }[];
      };

      const workspaceData: WorkspaceWithMembership = {
        id: workspace.id,
        slug: workspace.slug,
        name: workspace.name,
        created_at: workspace.created_at,
        workspace_member_role: data.workspace_member_role,
        membership_type: Array.isArray(workspace.workspace_application_settings)
          ? workspace.workspace_application_settings[0]?.membership_type
          : undefined
      };

      return workspaceData;
    },
    // Only run when user and activeWorkspaceId are available
    enabled: !!user?.id && !!activeWorkspaceId && !contextLoading,
    // Retry once on failure
    retry: 1,
    // Keep data fresh for 5 minutes
    staleTime: 5 * 60 * 1000
  });

  // Helper function to refresh workspace (for backwards compatibility)
  const refreshWorkspace = () => {
    queryClient.invalidateQueries({ queryKey: ["workspace", activeWorkspaceId, user?.id] });
  };

  return {
    workspace: query.data ?? null,
    loading: userLoading || query.isLoading || contextLoading,
    error: query.error?.message ?? null,
    refreshWorkspace,
    // Also expose React Query methods
    refetch: query.refetch,
    isLoading: query.isLoading,
    data: query.data ?? null
  };
}
