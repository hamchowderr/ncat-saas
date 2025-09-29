"use client";

import { createClient } from "@/lib/client";
import { useEffect, useState } from "react";
import { useUser } from "./use-user";

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

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<WorkspaceWithMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchWorkspace = async () => {
      try {
        const supabase = createClient();

        // Get the user's workspace via workspace_members table
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
          .single();

        if (error) {
          console.error("Error fetching workspace:", error);
          setError(error.message);
          return;
        }

        console.log("🔧 useWorkspace: Raw workspace data received:", data);

        if (data && data.workspaces) {
          const workspaceData: WorkspaceWithMembership = {
            id: data.workspaces.id,
            slug: data.workspaces.slug,
            name: data.workspaces.name,
            created_at: data.workspaces.created_at,
            workspace_member_role: data.workspace_member_role,
            membership_type: Array.isArray(data.workspaces.workspace_application_settings)
              ? data.workspaces.workspace_application_settings[0]?.membership_type
              : undefined
          };
          setWorkspace(workspaceData);
        }
      } catch (err) {
        console.error("Unexpected error fetching workspace:", err);
        setError("Failed to fetch workspace information");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [user]);

  const refreshWorkspace = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

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
        .single();

      if (error) {
        setError(error.message);
        return;
      }

      if (data && data.workspaces) {
        const workspaceData: WorkspaceWithMembership = {
          id: data.workspaces.id,
          slug: data.workspaces.slug,
          name: data.workspaces.name,
          created_at: data.workspaces.created_at,
          workspace_member_role: data.workspace_member_role,
          membership_type: Array.isArray(data.workspaces.workspace_application_settings)
            ? data.workspaces.workspace_application_settings[0]?.membership_type
            : undefined
        };
        setWorkspace(workspaceData);
      }
    } catch (err) {
      setError("Failed to refresh workspace information");
    } finally {
      setLoading(false);
    }
  };

  return {
    workspace,
    loading,
    error,
    refreshWorkspace
  };
}
