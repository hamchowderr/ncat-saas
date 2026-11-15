"use client";

import { createClient } from "@/lib/client";
import { useEffect, useMemo, useRef } from "react";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { useUser } from "@/hooks/use-user";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WorkspaceConversation, ConversationParticipant } from "@/lib/types/group-chat";

export interface LastMessage {
  id: string;
  content: string;
  message_type: string;
  created_at: string;
  sender_id: string;
}

// Extend the WorkspaceConversation type for compatibility
export interface Conversation extends Omit<WorkspaceConversation, "last_message" | "unread_count"> {
  last_message: LastMessage | null;
  unread_count: number;
}

/**
 * Hook to manage workspace conversations with real-time updates
 * Uses React Query for data fetching and subscribes to real-time changes
 */
export function useWorkspaceConversations() {
  const { activeWorkspace } = useWorkspaceContext();
  const { data: user } = useUser();
  const queryClient = useQueryClient();

  // Memoize queryKey to prevent infinite re-renders in useEffect
  const queryKey = useMemo(
    () => ["workspace-conversations", activeWorkspace?.id],
    [activeWorkspace?.id]
  );

  // Fetch conversations using React Query
  const {
    data: conversations = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!activeWorkspace?.id || !user?.id) return [];

      const response = await fetch(
        `/api/workspace/conversations?workspace_id=${activeWorkspace.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();
      return data.conversations || [];
    },
    enabled: !!activeWorkspace?.id && !!user?.id,
    staleTime: 30000 // Cache stays fresh for 30s, prevents immediate refetches
  });

  // useRef to persist timeout across renders (prevents infinite loop)
  const invalidationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionsRef = useRef<{ conversations: any; messages: any } | null>(null);

  // Subscribe to real-time broadcast updates for conversations
  useEffect(() => {
    if (!activeWorkspace?.id || !user?.id) return;

    // Prevent duplicate subscriptions
    if (subscriptionsRef.current) return;

    // Debounce invalidations to prevent rapid-fire refetches
    const debouncedInvalidate = () => {
      if (invalidationTimeoutRef.current) {
        clearTimeout(invalidationTimeoutRef.current);
      }
      invalidationTimeoutRef.current = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey });
      }, 1000); // 1000ms debounce (increased to prevent rapid-fire invalidations)
    };
    // Create Supabase client inside useEffect to avoid stale auth tokens
    const supabase = createClient();

    // Subscribe to conversations channel for conversation-level changes
    const conversationsChannel = supabase
      .channel(`workspace:${activeWorkspace.id}:conversations`)
      .on(
        "broadcast",
        { event: "INSERT" },
        () => {
          // New conversation created
          debouncedInvalidate();
        }
      )
      .on(
        "broadcast",
        { event: "DELETE" },
        () => {
          // Conversation deleted
          debouncedInvalidate();
        }
      )
      .on(
        "broadcast",
        { event: "PARTICIPANT_INSERT" },
        () => {
          // Participant added to conversation
          debouncedInvalidate();
        }
      )
      .on(
        "broadcast",
        { event: "PARTICIPANT_DELETE" },
        () => {
          // Participant removed from conversation
          debouncedInvalidate();
        }
      )
      .on(
        "broadcast",
        { event: "RECEIPT_INSERT" },
        () => {
          // Message marked as read (updates unread count)
          debouncedInvalidate();
        }
      )
      .subscribe();

    // Subscribe to messages channel for last_message updates
    const messagesChannel = supabase
      .channel(`workspace:${activeWorkspace.id}:messages`)
      .on(
        "broadcast",
        { event: "INSERT" },
        () => {
          // New message sent (updates last_message and last_message_at)
          debouncedInvalidate();
        }
      )
      .subscribe();

    // Store subscriptions in ref
    subscriptionsRef.current = { conversations: conversationsChannel, messages: messagesChannel };

    return () => {
      // Clear any pending invalidation
      if (invalidationTimeoutRef.current) {
        clearTimeout(invalidationTimeoutRef.current);
        invalidationTimeoutRef.current = null;
      }
      // Remove channel subscriptions
      if (subscriptionsRef.current) {
        supabase.removeChannel(subscriptionsRef.current.conversations);
        supabase.removeChannel(subscriptionsRef.current.messages);
        subscriptionsRef.current = null;
      }
    };
  }, [activeWorkspace?.id, user?.id, queryClient, queryKey]);

  // Create or get conversation with another user
  const createConversationMutation = useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!activeWorkspace?.id) throw new Error("No workspace selected");

      console.log("[useWorkspaceConversations] Creating 1-on-1 conversation with user:", otherUserId);

      const response = await fetch("/api/workspace/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: activeWorkspace.id,
          other_user_id: otherUserId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("[useWorkspaceConversations] Failed to create 1-on-1:", error);
        throw new Error(error.error || "Failed to create conversation");
      }

      const data = await response.json();
      console.log("[useWorkspaceConversations] 1-on-1 conversation created:", data.conversation);
      return data.conversation as Conversation;
    },
    onSuccess: (newConversation) => {
      // Immediately add the conversation to the cache
      queryClient.setQueryData<Conversation[]>(queryKey, (old = []) => {
        // Check if conversation already exists in cache
        const exists = old.some(conv => conv.id === newConversation.id);
        if (exists) {
          return old;
        }
        // Add new conversation at the top of the list
        return [newConversation, ...old];
      });
    }
  });

  // Create group conversation
  const createGroupConversationMutation = useMutation({
    mutationFn: async ({ name, participantIds }: { name: string; participantIds: string[] }) => {
      if (!activeWorkspace?.id) throw new Error("No workspace selected");

      console.log("[useWorkspaceConversations] Creating group conversation:", { name, participantIds });

      const response = await fetch("/api/workspace/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: activeWorkspace.id,
          is_group: true,
          name,
          participant_ids: participantIds
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("[useWorkspaceConversations] Failed to create group:", error);
        throw new Error(error.error || "Failed to create group conversation");
      }

      const data = await response.json();
      console.log("[useWorkspaceConversations] Group conversation created:", data.conversation);
      return data.conversation as Conversation;
    },
    onSuccess: (newConversation) => {
      // Immediately add the conversation to the cache
      queryClient.setQueryData<Conversation[]>(queryKey, (old = []) => {
        // Check if conversation already exists in cache
        const exists = old.some((conv) => conv.id === newConversation.id);
        if (exists) {
          return old;
        }
        // Add new conversation at the top of the list
        return [newConversation, ...old];
      });
    }
  });

  return {
    conversations,
    loading,
    error: error ? (error as Error).message : null,
    createConversation: createConversationMutation.mutateAsync,
    createGroupConversation: createGroupConversationMutation.mutateAsync
  };
}
