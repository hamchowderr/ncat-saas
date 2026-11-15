"use client";

import React from "react";
import { ArrowLeft, Ellipsis, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateAvatarFallback } from "@/lib/utils";
import useChatStore from "../useChatStore";
import { RealtimeAvatarStack } from "@/components/realtime-avatar-stack";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CallDialog, ChatUserDropdown, VideoCallDialog } from "./index";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Conversation } from "@/hooks/use-workspace-conversations";

export function ChatHeader({ conversation }: { conversation: Conversation | null }) {
  const { setSelectedConversation, setShowProfileSheet } = useChatStore();

  if (!conversation) return null;

  // Determine display values based on conversation type
  const displayName = conversation.is_group
    ? conversation.name || "Group Chat"
    : conversation.other_participant?.full_name || "Unknown User";

  const avatarUrl = conversation.is_group
    ? conversation.avatar_url
    : conversation.other_participant?.avatar_url;

  const avatarFallback = conversation.is_group
    ? generateAvatarFallback(conversation.name || "Group")
    : generateAvatarFallback(conversation.other_participant?.full_name || "User");

  const memberCount = conversation.is_group ? conversation.participants?.length || 0 : null;

  return (
    <div className="flex justify-between gap-4 lg:px-4">
      <div className="flex gap-4">
        <Button
          size="sm"
          variant="outline"
          className="flex size-10 p-0 lg:hidden"
          onClick={() => setSelectedConversation(null)}
        >
          <ArrowLeft />
        </Button>
        <div className="relative">
          <Avatar className="overflow-visible lg:size-10">
            <AvatarImage src={avatarUrl || ""} alt="avatar image" />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          {conversation.is_group && (
            <div className="bg-primary text-primary-foreground absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full">
              <Users className="h-3 w-3" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{displayName}</span>
            <RealtimeAvatarStack roomName={`conversation:${conversation.id}`} />
          </div>
          {conversation.is_group ? (
            <span className="text-muted-foreground text-xs">{memberCount} members</span>
          ) : (
            <span className="text-muted-foreground text-xs">Active</span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {conversation.is_group && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowProfileSheet(true)}
                >
                  <Info className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Group Info</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {!conversation.is_group && (
          <div className="hidden lg:flex lg:gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <VideoCallDialog />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">Start Video Chat</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <CallDialog />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">Start Call</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        <ChatUserDropdown>
          <Button size="icon" variant="ghost">
            <Ellipsis />
          </Button>
        </ChatUserDropdown>
      </div>
    </div>
  );
}
