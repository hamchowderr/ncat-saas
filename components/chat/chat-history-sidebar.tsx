"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageSquarePlus, Trash2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ListChatsResponse } from "@/lib/types/chat";

interface ChatHistorySidebarProps {
  onLoadChat: (chatId: string) => void;
  onNewChat: () => void;
  currentChatId: string | null;
}

export function ChatHistorySidebar({
  onLoadChat,
  onNewChat,
  currentChatId
}: ChatHistorySidebarProps) {
  const [chats, setChats] = useState<ListChatsResponse["chats"]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch chat history
  const loadChats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/chat/sessions");
      if (response.ok) {
        const data: ListChatsResponse = await response.json();
        setChats(data.chats);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  // Delete a chat
  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${chatId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setChats((prev) => prev.filter((chat) => chat.id !== chatId));

        // If we deleted the current chat, start a new one
        if (chatId === currentChatId) {
          onNewChat();
        }
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  return (
    <div className="flex h-full w-72 flex-col border-r bg-background">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-base font-semibold">Chat History</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewChat}
          title="New Chat"
          className="h-8 gap-2 px-3"
        >
          <MessageSquarePlus className="size-4" />
          <span className="text-xs">New</span>
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="text-muted-foreground text-sm">Loading chats...</div>
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-6 pt-12">
            <div className="bg-muted/50 rounded-full p-4">
              <MessageSquarePlus className="text-muted-foreground size-8" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Start a new chat to see it here
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`hover:bg-accent group relative rounded-lg transition-colors ${
                  chat.id === currentChatId ? "bg-accent" : ""
                }`}
              >
                <button
                  onClick={() => onLoadChat(chat.id)}
                  className="w-full p-3 text-left"
                  title={chat.title || "Untitled Chat"}
                >
                  <div className="mb-1.5 line-clamp-2 pr-8 text-sm font-medium leading-tight">
                    {chat.title || "Untitled Chat"}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <Clock className="size-3" />
                    <span className="truncate">
                      {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                    </span>
                    <span>•</span>
                    <span>{chat.messageCount} msgs</span>
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 size-7 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  title="Delete chat"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
