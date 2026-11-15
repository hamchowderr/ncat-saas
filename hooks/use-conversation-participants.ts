"use client";

import { createClient } from "@/lib/client";
import { useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConversationParticipant } from "@/lib/types/group-chat";

// Create stable Supabase client at module level (not inside hook)

/**
 * Hook to manage participants in a conversation
 * Provides real-time updates and mutations for adding/removing participants
 */
export function useConversationParticipants(conversationId: string | null) {
  const queryClient = useQueryClient();

  // Memoize queryKey
  const queryKey = useMemo(
    () => ["conversation-participants", conversationId],
    [conversationId]
  );

  // Fetch participants
  const {
    data: participants = [],
    isLoading,
    error
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!conversationId) return [];

      const supabase = createClient();
      const { data, error } = await supabase
        .from("workspace_conversation_participants")
        .select(
          `
          user_id,
          role,
          joined_at,
          user_profile:user_profiles(
            id,
            full_name,
            avatar_url
          )
        `
        )
        .eq("conversation_id", conversationId)
        .order("role", { ascending: true }); // creator first

      if (error) throw error;

      return (data || []).map((p: any) => ({
        user_id: p.user_id,
        role: p.role,
        joined_at: p.joined_at,
        user_profile: p.user_profile
      })) as ConversationParticipant[];
    },
    enabled: !!conversationId
  });

  // Subscribe to real-time participant changes
  useEffect(() => {
    if (!conversationId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`conversation:${conversationId}:participants`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workspace_conversation_participants",
          filter: `conversation_id=eq.${conversationId}`
        },
        async () => {
          // Invalidate and refetch participants when there's a change
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient, queryKey]);

  // Add participant mutation
  const addParticipantMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!conversationId) throw new Error("No conversation selected");

      const response = await fetch(`/api/workspace/conversations/${conversationId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add participant");
      }

      const data = await response.json();
      return data.participants as ConversationParticipant[];
    },
    onSuccess: (updatedParticipants) => {
      // Update cache with new participants list
      queryClient.setQueryData<ConversationParticipant[]>(queryKey, updatedParticipants);
    }
  });

  // Remove participant mutation
  const removeParticipantMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!conversationId) throw new Error("No conversation selected");

      const response = await fetch(
        `/api/workspace/conversations/${conversationId}/participants/${userId}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove participant");
      }

      const data = await response.json();
      return data.participants as ConversationParticipant[];
    },
    onSuccess: (updatedParticipants) => {
      // Update cache with new participants list
      queryClient.setQueryData<ConversationParticipant[]>(queryKey, updatedParticipants);
    }
  });

  return {
    participants,
    isLoading,
    error: error ? (error as Error).message : null,
    addParticipant: addParticipantMutation.mutateAsync,
    removeParticipant: removeParticipantMutation.mutateAsync
  };
}
