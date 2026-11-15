"use client";

import { STALE_TIMES, RETRY_CONFIG } from "@/lib/query-config";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/client";
import { useToast } from "@/hooks/use-toast";

export interface WorkspaceMembership {
  workspace_id: string;
  workspace_name: string;
  workspace_slug: string;
  workspace_role: "owner" | "admin" | "member" | "readonly";
  workspace_created_at: string;
}

export function useUserWorkspaces() {
  const { toast } = useToast();

  const {
    data: workspaces = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Fetch ALL workspace memberships for user
      const { data, error: fetchError } = await supabase
        .from("workspace_members")
        .select(
          `
          workspace_member_role,
          workspaces!inner(
            id,
            slug,
            name,
            created_at
          )
        `
        )
        .eq("workspace_member_id", user.id)
        .order("workspace_member_role", { ascending: true }); // owner first (alphabetically)

      if (fetchError) {
        console.error("useUserWorkspaces: Error fetching workspaces:", fetchError);
        throw fetchError;
      }

      if (!data || data.length === 0) {
        console.warn("useUserWorkspaces: No workspaces found for user");
        return [];
      }

      // Transform data into WorkspaceMembership array
      const memberships: WorkspaceMembership[] = data.map((item: any) => ({
        workspace_id: item.workspaces.id,
        workspace_name: item.workspaces.name,
        workspace_slug: item.workspaces.slug,
        workspace_role: item.workspace_member_role,
        workspace_created_at: item.workspaces.created_at
      }));

      // Sort: owner first, then admin, then member, then readonly
      const roleOrder = { owner: 0, admin: 1, member: 2, readonly: 3 };
      memberships.sort((a, b) => roleOrder[a.workspace_role] - roleOrder[b.workspace_role]);

      return memberships;
    },
    staleTime: STALE_TIMES.USER_DATA, // 2 minutes - user workspace memberships don't change frequently
    retry: RETRY_CONFIG.DEFAULT
  });

  // Handle errors with toast notification
  useEffect(() => {
    if (error) {
      console.error("useUserWorkspaces: Error:", error);
      toast({
        title: "Error",
        description: "Failed to load your workspaces",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  return {
    workspaces,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch
  };
}
