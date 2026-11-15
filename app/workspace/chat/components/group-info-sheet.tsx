"use client";

import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useConversationParticipants } from "@/hooks/use-conversation-participants";
import { createClient } from "@/lib/client";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { useQuery } from "@tanstack/react-query";
import { Conversation } from "@/hooks/use-workspace-conversations";
import useChatStore from "../useChatStore";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, UserPlus, LogOut, Search, UserMinus, Loader2, Crown } from "lucide-react";
import { generateAvatarFallback } from "@/lib/utils";
import { toast } from "sonner";

interface WorkspaceMember {
  id: string;
  workspace_member_id: string;
  workspace_member_role: string;
  user_profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function GroupInfoSheet() {
  const supabase = createClient();
  const { selectedConversation, showProfileSheet, setShowProfileSheet } = useChatStore();
  const { data: currentUser } = useUser();
  const { activeWorkspace } = useWorkspaceContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  // Only fetch participants if this is a group conversation
  const {
    participants,
    isLoading: loadingParticipants,
    addParticipant,
    removeParticipant
  } = useConversationParticipants(
    selectedConversation?.is_group ? selectedConversation.id : null
  );

  // Fetch workspace members for adding
  const { data: workspaceMembers = [], isLoading: loadingMembers } = useQuery({
    queryKey: ["workspace-members-add", activeWorkspace?.id],
    queryFn: async () => {
      if (!activeWorkspace?.id) return [];

      const { data, error } = await supabase
        .from("workspace_members")
        .select(`
          id,
          workspace_member_id,
          workspace_member_role,
          user_profiles!inner(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("workspace_id", activeWorkspace.id);

      if (error) throw error;
      return data as unknown as WorkspaceMember[];
    },
    enabled: !!activeWorkspace?.id && showAddMember
  });

  if (!selectedConversation || !selectedConversation.is_group) {
    return null;
  }

  const isCreator =
    selectedConversation.created_by === currentUser?.id ||
    participants.some((p) => p.user_id === currentUser?.id && p.role === "creator");

  const participantIds = participants.map((p) => p.user_id);
  const availableMembers = workspaceMembers.filter(
    (m) => !participantIds.includes(m.workspace_member_id) && m.workspace_member_id !== currentUser?.id
  );

  const filteredAvailableMembers = availableMembers.filter((m) =>
    m.user_profiles.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMember = async (userId: string) => {
    try {
      await addParticipant(userId);
      toast.success("Member added to group");
      setShowAddMember(false);
      setSearchTerm("");
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      setIsRemoving(userId);
      await removeParticipant(userId);
      toast.success("Member removed from group");
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    } finally {
      setIsRemoving(null);
    }
  };

  const handleLeaveGroup = async () => {
    if (!currentUser?.id) return;
    if (isCreator) {
      toast.error("Group creators cannot leave their own group");
      return;
    }

    try {
      setIsRemoving(currentUser.id);
      await removeParticipant(currentUser.id);
      toast.success("You left the group");
      setShowProfileSheet(false);
    } catch (error) {
      console.error("Error leaving group:", error);
      toast.error("Failed to leave group");
    } finally {
      setIsRemoving(null);
    }
  };

  return (
    <Sheet open={showProfileSheet} onOpenChange={setShowProfileSheet}>
      <SheetContent>
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedConversation.avatar_url || undefined} />
                <AvatarFallback>
                  {generateAvatarFallback(selectedConversation.name || "Group")}
                </AvatarFallback>
              </Avatar>
              <div className="bg-primary text-primary-foreground absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div>
              <SheetTitle>{selectedConversation.name}</SheetTitle>
              <SheetDescription>{participants.length} members</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Add Member Section (Creator Only) */}
          {isCreator && (
            <div>
              {!showAddMember ? (
                <Button variant="outline" className="w-full" onClick={() => setShowAddMember(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <Input
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="max-h-[200px] space-y-2 overflow-y-auto">
                    {loadingMembers ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    ) : filteredAvailableMembers.length === 0 ? (
                      <div className="text-muted-foreground py-4 text-center text-sm">
                        {searchTerm ? "No members found" : "All workspace members are already in this group"}
                      </div>
                    ) : (
                      filteredAvailableMembers.map((member) => (
                        <button
                          key={member.id}
                          onClick={() => handleAddMember(member.workspace_member_id)}
                          className="hover:bg-muted flex w-full items-center gap-3 rounded-lg p-2 transition-colors"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.user_profiles.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {generateAvatarFallback(member.user_profiles.full_name || "Unknown")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 text-left text-sm">
                            {member.user_profiles.full_name || "Unknown User"}
                          </div>
                          <UserPlus className="h-4 w-4" />
                        </button>
                      ))
                    )}
                  </div>
                  <Button variant="ghost" className="w-full" onClick={() => setShowAddMember(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Participants List */}
          <div className="space-y-3">
            <h3 className="font-semibold">Members</h3>
            {loadingParticipants ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {participants.map((participant) => {
                  const isCurrentUser = participant.user_id === currentUser?.id;
                  const canRemove = isCreator && !isCurrentUser && participant.role !== "creator";

                  return (
                    <div key={participant.user_id} className="flex items-center gap-3 rounded-lg p-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={participant.user_profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {generateAvatarFallback(participant.user_profile?.full_name || "Unknown")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {participant.user_profile?.full_name || "Unknown User"}
                          </span>
                          {isCurrentUser && <Badge variant="secondary">You</Badge>}
                          {participant.role === "creator" && (
                            <Crown className="text-primary h-4 w-4" />
                          )}
                        </div>
                        {participant.role === "creator" && (
                          <div className="text-muted-foreground text-xs">Group Creator</div>
                        )}
                      </div>
                      {canRemove && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveMember(participant.user_id)}
                          disabled={isRemoving === participant.user_id}
                        >
                          {isRemoving === participant.user_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserMinus className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Leave Group (Non-Creator Only) */}
          {!isCreator && (
            <>
              <Separator />
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLeaveGroup}
                disabled={isRemoving === currentUser?.id}
              >
                {isRemoving === currentUser?.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Leaving...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Leave Group
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
