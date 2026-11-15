"use client";

import { useEffect, useRef } from "react";
import useChatStore from "../useChatStore";
import { useWorkspaceMessages, WorkspaceMessage } from "@/hooks/use-workspace-messages";
import { useUser } from "@/hooks/use-user";
import { useRealtimePresenceRoom } from "@/hooks/use-realtime-presence-room";

import { ChatHeader, ChatBubble, ChatFooter, UserDetailSheet, GroupInfoSheet } from "./index";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export function ChatContent() {
  const { selectedConversation } = useChatStore();
  const { data: user } = useUser();
  const { messages, loading, markAllAsRead, sendMessage, sending } = useWorkspaceMessages(
    selectedConversation?.id || null
  );

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Track presence in the conversation room
  useRealtimePresenceRoom(
    selectedConversation ? `conversation:${selectedConversation.id}` : ""
  );

  // Auto-scroll to bottom ONLY when new messages arrive (not on every render)
  useEffect(() => {
    // Only scroll if messages were actually added (length increased)
    if (messages.length > prevMessagesLengthRef.current) {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }
    // Update the ref for next comparison
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    // Early return if no conversation or no messages
    if (!selectedConversation || messages.length === 0) {
      return;
    }

    // Only mark as read if there are actually unread messages
    // This prevents unnecessary database operations
    const hasUnreadMessages = messages.some(
      (msg: WorkspaceMessage) => !msg.is_read && msg.sender_id !== user?.id
    );

    if (hasUnreadMessages) {
      markAllAsRead();
    }
    // Only run when conversation changes or new messages arrive, not when markAllAsRead changes
  }, [selectedConversation?.id, messages.length, user?.id]);

  if (!selectedConversation) {
    return (
      <figure className="hidden h-full items-center justify-center text-center lg:flex">
        <Image
          width={200}
          height={200}
          className="block max-w-sm dark:hidden"
          src={`/not-selected-chat.svg`}
          alt="Select a conversation"
          unoptimized
        />
        <Image
          width={200}
          height={200}
          className="hidden max-w-sm dark:block"
          src={`/not-selected-chat-light.svg`}
          alt="Select a conversation"
        />
      </figure>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ChatHeader conversation={selectedConversation} />

      <div className="flex-1 overflow-y-auto lg:px-4">
        {loading ? (
          <div className="space-y-4 py-8">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-16 w-2/3 ml-auto" />
            <Skeleton className="h-16 w-3/4" />
          </div>
        ) : (
          <div ref={messagesContainerRef}>
            <div className="flex flex-col items-start space-y-4 py-8">
              {messages.length === 0 ? (
                <div className="text-muted-foreground w-full text-center text-sm">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message: WorkspaceMessage) => (
                  <ChatBubble
                    message={message}
                    type={message.message_type}
                    own_message={message.sender_id === user?.id}
                    key={message.id}
                    isGroup={selectedConversation.is_group}
                    showSenderName={selectedConversation.is_group && message.sender_id !== user?.id}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <ChatFooter sendMessage={sendMessage} sending={sending} />

      {!selectedConversation.is_group && selectedConversation.other_participant && (
        <UserDetailSheet
          user={{
            id: Number(selectedConversation.other_participant.id) || 0,
            name: selectedConversation.other_participant.full_name || "Unknown User",
            avatar: selectedConversation.other_participant.avatar_url || undefined
          }}
        />
      )}

      {selectedConversation.is_group && <GroupInfoSheet />}
    </div>
  );
}
