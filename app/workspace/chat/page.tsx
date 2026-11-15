"use client";

import { ChatSidebar, ChatContent } from "./components";
import { useWorkspaceConversations } from "@/hooks/use-workspace-conversations";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const { conversations, loading } = useWorkspaceConversations();

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-var(--header-height)-3rem)] w-full">
        <div className="w-full lg:w-96 p-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="grow p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-var(--header-height)-3rem)] w-full">
      <ChatSidebar conversations={conversations} />
      <div className="grow">
        <ChatContent />
      </div>
    </div>
  );
}
