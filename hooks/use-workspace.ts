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

        // Get the user's workspace with their membership role
        const { data, error } = await supabase
          .from("workspaces")
          .select(
            `
            id,
            slug,
            name,
            created_at,
            workspace_members!inner(workspace_member_role),
            workspace_application_settings(membership_type)
          `
          )
          .eq("id", user.id)
          .eq("workspace_members.workspace_member_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching workspace:", error);
          setError(error.message);
          return;
        }

        if (data) {
          const workspaceData: WorkspaceWithMembership = {
            id: data.id,
            slug: data.slug,
            name: data.name,
            created_at: data.created_at,
            workspace_member_role: Array.isArray(data.workspace_members)
              ? data.workspace_members[0]?.workspace_member_role
              : undefined,
            membership_type: Array.isArray(data.workspace_application_settings)
              ? data.workspace_application_settings[0]?.membership_type
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
        .from("workspaces")
        .select(
          `
          id,
          slug,
          name,
          created_at,
          workspace_members!inner(workspace_member_role),
          workspace_application_settings(membership_type)
        `
        )
        .eq("id", user.id)
        .eq("workspace_members.workspace_member_id", user.id)
        .single();

      if (error) {
        setError(error.message);
        return;
      }

      if (data) {
        const workspaceData: WorkspaceWithMembership = {
          id: data.id,
          slug: data.slug,
          name: data.name,
          created_at: data.created_at,
          workspace_member_role: Array.isArray(data.workspace_members)
            ? data.workspace_members[0]?.workspace_member_role
            : undefined,
          membership_type: Array.isArray(data.workspace_application_settings)
            ? data.workspace_application_settings[0]?.membership_type
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
