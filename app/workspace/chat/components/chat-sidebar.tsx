"use client";

import React from "react";
import { Search } from "lucide-react";
import useChatStore from "../useChatStore";
import { Conversation } from "@/hooks/use-workspace-conversations";

import { Input } from "@/components/ui/input";
import { ChatListItem } from "./chat-list-item";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ActionDropdown } from "./action-dropdown";

export function ChatSidebar({ conversations }: { conversations: Conversation[] }) {
  const { selectedConversation } = useChatStore();
  const [searchTerm, setSearchTerm] = React.useState("");

  // Use useMemo to filter conversations instead of useEffect + useState
  // This prevents unnecessary re-renders and is more performant
  const filteredConversations = React.useMemo(() => {
    if (!searchTerm.trim()) {
      return conversations;
    }

    const lowerSearch = searchTerm.trim().toLowerCase();
    return conversations.filter((conversation) => {
      // For groups, search by group name
      if (conversation.is_group && conversation.name) {
        return conversation.name.toLowerCase().includes(lowerSearch);
      }
      // For 1-on-1, search by participant name
      return conversation.other_participant?.full_name?.toLowerCase().includes(lowerSearch);
    });
  }, [conversations, searchTerm]);

  const changeHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Card className="w-full pb-0 lg:w-96">
      <CardHeader>
        <CardTitle className="font-display text-xl lg:text-2xl">Chats</CardTitle>
        <CardAction>
          <ActionDropdown />
        </CardAction>
        <CardDescription className="relative col-span-2 mt-4 flex w-full items-center">
          <Search className="text-muted-foreground absolute start-4 size-4" />
          <Input
            type="text"
            className="ps-10"
            placeholder="Chats search..."
            onChange={changeHandle}
          />
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto p-0">
        <div className="block min-w-0 divide-y">
          {filteredConversations.length ? (
            filteredConversations.map((conversation) => (
              <ChatListItem
                conversation={conversation}
                key={conversation.id}
                active={selectedConversation?.id === conversation.id}
              />
            ))
          ) : (
            <div className="text-muted-foreground mt-4 text-center text-sm">No conversations found</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
