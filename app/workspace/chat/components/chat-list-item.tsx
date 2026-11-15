import { cn, generateAvatarFallback } from "@/lib/utils";
import useChatStore from "../useChatStore";
import { Conversation } from "@/hooks/use-workspace-conversations";
import { Ellipsis, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { ChatUserDropdown } from "./index";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ChatListItem({ conversation, active }: { conversation: Conversation; active: boolean | null }) {
  const { setSelectedConversation } = useChatStore();

  const handleClick = () => {
    setSelectedConversation(conversation);
  };

  const timeAgo = conversation.last_message_at
    ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })
    : "";

  // Determine display name and avatar based on conversation type
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
    <div
      className={cn(
        "group/item hover:bg-muted relative flex min-w-0 cursor-pointer items-center gap-4 px-6 py-4",
        { "dark:bg-muted! bg-gray-200!": active }
      )}
      onClick={handleClick}
    >
      <div className="relative">
        <Avatar className="overflow-visible md:size-10">
          <AvatarImage src={avatarUrl || ""} alt="avatar image" />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        {conversation.is_group && (
          <div className="bg-primary text-primary-foreground absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full">
            <Users className="h-3 w-3" />
          </div>
        )}
      </div>
      <div className="min-w-0 grow">
        <div className="flex items-center justify-between">
          <span className="truncate text-sm font-medium">{displayName}</span>
          <span className="text-muted-foreground flex-none text-xs">{timeAgo}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground truncate text-start text-sm">
            {conversation.is_group && memberCount && `${memberCount} members • `}
            {conversation.last_message?.content || "No messages yet"}
          </span>
          {conversation.unread_count > 0 && (
            <div className="ms-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-sm text-white">
              {conversation.unread_count}
            </div>
          )}
        </div>
      </div>
      <div
        className={cn(
          "absolute end-0 top-0 bottom-0 flex items-center bg-linear-to-l from-50% px-4 opacity-0 group-hover/item:opacity-100",
          { "from-muted": !active },
          { "dark:from-muted from-gray-200": active }
        )}
      >
        <ChatUserDropdown>
          <Button size="icon" variant="outline" className="rounded-full">
            <Ellipsis />
          </Button>
        </ChatUserDropdown>
      </div>
    </div>
  );
}
