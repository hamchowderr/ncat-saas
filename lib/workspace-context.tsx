"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import { createClient } from "@/lib/client";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

interface WorkspaceContextType {
  activeWorkspaceId: string | null;
  setActiveWorkspace: (id: string) => void;
  isAppAdmin: boolean;
  isImpersonating: boolean;
  workspaceList: Workspace[];
  loading: boolean;
  activeWorkspace: Workspace | null;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const STORAGE_KEY = "activeWorkspaceId";

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(null);
  const [isAppAdmin, setIsAppAdmin] = useState(false);
  const [workspaceList, setWorkspaceList] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [userMembershipIds, setUserMembershipIds] = useState<Set<string>>(new Set());

  // Initialize context on mount
  useEffect(() => {
    const initializeContext = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        // Get current user
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
          // User not authenticated - this is expected on public pages (login, signup, etc.)
          // Silently return without error logging
          setLoading(false);
          return;
        }

        // Fetch workspaces via API endpoint (handles admin vs regular user logic server-side)
        const response = await fetch("/api/workspace/all");
        const data = await response.json();

        if (!response.ok) {
          console.error("WorkspaceContext: Error fetching workspaces:", data.error);
          setLoading(false);
          return;
        }

        const { workspaces, userMembershipIds, isAdmin } = data;

        setIsAppAdmin(isAdmin || false);
        setWorkspaceList(workspaces || []);
        setUserMembershipIds(new Set(userMembershipIds || []));

        // Set active workspace (priority: sessionStorage > user's primary workspace > first available)
        const savedWorkspaceId = sessionStorage.getItem(STORAGE_KEY);
        const validSavedId = savedWorkspaceId && workspaces.some((w: Workspace) => w.id === savedWorkspaceId);

        if (validSavedId) {
          // Use saved workspace if valid
          setActiveWorkspaceIdState(savedWorkspaceId);
        } else {
          // Default to user's primary workspace (where they're owner)
          const { data: primaryWorkspace } = await supabase
            .from("workspace_members")
            .select("workspace_id")
            .eq("workspace_member_id", user.id)
            .eq("workspace_member_role", "owner")
            .limit(1)
            .single();

          const defaultId = primaryWorkspace?.workspace_id || workspaces[0]?.id || null;
          setActiveWorkspaceIdState(defaultId);

          if (defaultId) {
            sessionStorage.setItem(STORAGE_KEY, defaultId);
          }
        }
      } catch (error) {
        console.error("WorkspaceContext: Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeContext();
  }, []);

  // Memoize setActiveWorkspace to prevent recreation on every render
  const setActiveWorkspace = useCallback((id: string) => {
    setActiveWorkspaceIdState(id);
    sessionStorage.setItem(STORAGE_KEY, id);
  }, []); // No dependencies - function is stable

  // Memoize computed derived values to prevent infinite re-renders
  // workspaceList and userMembershipIds have stable references from useState
  const isImpersonating = useMemo(
    () => isAppAdmin && activeWorkspaceId ? !userMembershipIds.has(activeWorkspaceId) : false,
    [isAppAdmin, activeWorkspaceId, userMembershipIds]
  );

  const activeWorkspace = useMemo(
    () => workspaceList.find((w) => w.id === activeWorkspaceId) || null,
    [workspaceList, activeWorkspaceId]
  );

  // Memoize context value to prevent infinite re-renders
  // NOTE: Don't include 'activeWorkspace' in deps since it's derived from workspaceList
  const value = useMemo<WorkspaceContextType>(() => ({
    activeWorkspaceId,
    setActiveWorkspace,
    isAppAdmin,
    isImpersonating,
    workspaceList,
    loading,
    activeWorkspace
  }), [activeWorkspaceId, setActiveWorkspace, isAppAdmin, isImpersonating, workspaceList, loading]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspaceContext must be used within a WorkspaceProvider");
  }
  return context;
}
