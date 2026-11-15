"use client";

import { createClient } from "@/lib/client";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useUser } from "@/hooks/use-user";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Create stable Supabase client at module level (not inside hook)

export interface MessageSender {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}
export interface AttachmentMetadata {
  file_name?: string;
  file_type?: string;
  size?: string;
  duration?: string;
  images?: string[]; // For image messages with multiple images
}

export interface WorkspaceMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender: MessageSender;
  content: string;
  message_type: string;
  attachment_url: string | null;
  attachment_metadata: AttachmentMetadata | null;
  created_at: string;
  is_read: boolean;
  read_by_other: boolean;
}

/**
 * Hook to manage messages in a conversation with real-time updates
 * Uses React Query for data fetching and real-time subscriptions
 */
export function useWorkspaceMessages(conversationId: string | null) {
  const { data: user } = useUser();
  const queryClient = useQueryClient();

  // Memoize queryKey to prevent infinite re-renders in useEffect
  const queryKey = useMemo(
    () => ["workspace-messages", conversationId],
    [conversationId]
  );

  // Fetch messages using React Query
  const {
    data: messages = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!conversationId) return [];


      const response = await fetch(
        `/api/workspace/conversations/${conversationId}/messages`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch messages");
    // Create Supabase client inside useEffect to avoid stale auth tokens
    const supabase = createClient();
      }

      const data = await response.json();
      return data.messages || [];
    },
    enabled: !!conversationId,
    staleTime: 30000 // Cache stays fresh for 30s, prevents immediate refetches
  });

  // useRef to persist timeout across renders (prevents infinite loop)
  const invalidationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);

  // Subscribe to real-time broadcast message updates
  useEffect(() => {
    if (!conversationId) return;

    // Prevent duplicate subscriptions
    if (channelRef.current) return;

    // Cleanup flag to prevent operations after unmount
    let isActive = true;

    const supabase = createClient();

    // Debounce invalidations to prevent rapid-fire refetches
    const debouncedInvalidate = () => {
      if (invalidationTimeoutRef.current) {
        clearTimeout(invalidationTimeoutRef.current);
      }
      invalidationTimeoutRef.current = setTimeout(() => {
        if (!isActive) return; // Don't invalidate if component unmounted
        queryClient.invalidateQueries({ queryKey });
      }, 500); // 500ms debounce (increased to reduce refetch frequency)
    };

    const channel = supabase
      .channel(`conversation:${conversationId}:messages`)
      .on(
        "broadcast",
        { event: "INSERT" },
        async (payload) => {
          if (!isActive) return; // Don't process if component unmounted

          // Option 1: Invalidate and refetch (simpler, ensures consistency)
          debouncedInvalidate();

          // Option 2: Optimistically fetch and add to cache (faster UX)
          // Uncomment if you prefer optimistic updates
          /*
          const messageId = payload.payload?.message_id;
          if (messageId) {
            const { data: newMessage } = await supabase
              .from("workspace_messages")
              .select(
                `
                id,
                conversation_id,
                sender_id,
                content,
                message_type,
                attachment_url,
                attachment_metadata,
                created_at,
                sender:user_profiles!workspace_messages_sender_id_fkey(
                  id,
                  full_name,
                  avatar_url
                )
              `
              )
              .eq("id", messageId)
              .single();

            if (newMessage) {
              const typedMessage = {
                ...newMessage,
                sender: newMessage.sender as unknown as MessageSender,
                is_read: false,
                read_by_other: false
              } as WorkspaceMessage;

              queryClient.setQueryData<WorkspaceMessage[]>(queryKey, (old = []) => {
                const messageExists = old.some(msg => msg.id === typedMessage.id);
                if (messageExists) return old;
                return [...old, typedMessage];
              });
            }
          }
          */
        }
      )
      .subscribe((status) => {
      });

    // Store channel in ref
    channelRef.current = channel;

    return () => {
      isActive = false; // Mark as inactive BEFORE cleanup

      // Clear any pending invalidation
      if (invalidationTimeoutRef.current) {
        clearTimeout(invalidationTimeoutRef.current);
        invalidationTimeoutRef.current = null;
      }
      // Remove channel subscription
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId, queryClient, queryKey]);

  // Send a new message
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      content,
      messageType = "text",
      attachmentUrl,
      attachmentMetadata
    }: {
      content: string;
      messageType?: string;
      attachmentUrl?: string;
      attachmentMetadata?: AttachmentMetadata;
    }) => {
      if (!conversationId || !content.trim()) {
        throw new Error("Missing conversation ID or content");
      }


      const response = await fetch("/api/workspace/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          content: content.trim(),
          message_type: messageType,
          attachment_url: attachmentUrl,
          attachment_metadata: attachmentMetadata
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to send message" }));
        throw new Error(errorData.error || "Failed to send message");
      }

      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      // Immediately update the cache with the sent message
      // Real-time subscription will ensure consistency
      if (data.message) {
        const newMessage: WorkspaceMessage = {
          ...data.message,
          is_read: true, // Message sent by current user is considered read
          read_by_other: false
        };

        queryClient.setQueryData<WorkspaceMessage[]>(queryKey, (old = []) => {
          // Check if message already exists to prevent duplicates
          const messageExists = old.some(msg => msg.id === newMessage.id);
          if (messageExists) {
            return old;
          }
          return [...old, newMessage];
        });
      }
    },
    onError: (error: Error) => {
      // The error is already thrown, so the calling component can handle it
      // This callback ensures the mutation state properly resets
    },
    // Reset mutation state after 1 second to prevent stuck "sending" state
    retry: false
  });

  // Mark message as read
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(`/api/workspace/messages/${messageId}/read`, {
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("Failed to mark message as read");
      }

      return response.json();
    }
  });

  const sendMessage = useCallback(
    async (
      content: string,
      messageType: string = "text",
      attachmentUrl?: string,
      attachmentMetadata?: AttachmentMetadata
    ) => {
      await sendMessageMutation.mutateAsync({
        content,
        messageType,
        attachmentUrl,
        attachmentMetadata
      });
    },
    [sendMessageMutation]
  );

  const markAsRead = useCallback(
    async (messageId: string) => {
      await markAsReadMutation.mutateAsync(messageId);
    },
    [markAsReadMutation]
  );

  // Mark all messages in conversation as read
  const markAllAsRead = useCallback(async () => {
    // Get fresh messages from React Query cache instead of depending on messages prop
    const currentMessages = queryClient.getQueryData<WorkspaceMessage[]>(queryKey) || [];
    const unreadMessages = currentMessages.filter(
      (msg: WorkspaceMessage) => !msg.is_read && msg.sender_id !== user?.id
    );

    await Promise.all(unreadMessages.map((msg: WorkspaceMessage) => markAsRead(msg.id)));
  }, [user?.id, markAsRead, queryClient, queryKey]);

  return {
    messages,
    loading,
    sending: sendMessageMutation.isPending,
    error: error ? (error as Error).message : null,
    sendMessage,
    markAsRead,
    markAllAsRead
  };
}
