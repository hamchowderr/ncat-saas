"use client";

import { useState, useRef } from "react";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { useWorkspaceConversations } from "@/hooks/use-workspace-conversations";
import { createClient } from "@/lib/client";
import { useUser } from "@/hooks/use-user";
import { useQuery } from "@tanstack/react-query";
import useChatStore from "../useChatStore";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, X, Users } from "lucide-react";
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

export function NewChatDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {

  const supabase = createClient();
  const { activeWorkspace } = useWorkspaceContext();
  const { data: currentUser } = useUser();
  const { createConversation, createGroupConversation } = useWorkspaceConversations();
  const { setSelectedConversation } = useChatStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [creating, setCreating] = useState(false);

  // Group chat state
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Fetch workspace members
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["workspace-members", activeWorkspace?.id],
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
        .eq("workspace_id", activeWorkspace.id)
        .neq("workspace_member_id", currentUser?.id || "");

      if (error) throw error;
      return data as unknown as WorkspaceMember[];
    },
    enabled: !!activeWorkspace?.id && !!currentUser?.id && open
  });

  // Filter members based on search
  const filteredMembers = members.filter((member) =>
    member.user_profiles.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateChat = async (memberId: string) => {
    try {
      setCreating(true);
      const conversation = await createConversation(memberId);
      toast.success("Chat started!");
      // First set the conversation (this will render ChatContent)
      setSelectedConversation(conversation);
      // Then close the dialog after a short delay to let the conversation render
      setTimeout(() => {
        onOpenChange(false);
      }, 50);
    } catch (error) {
      console.error("[NewChatDialog] Error creating chat:", error);
      toast.error("Failed to start chat");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    if (selectedMembers.length < 2) {
      toast.error("Please select at least 2 members");
      return;
    }

    try {
      console.log("[NewChatDialog] Starting group creation:", { name: groupName, members: selectedMembers });
      setCreating(true);

      console.log("[NewChatDialog] Calling createGroupConversation...");
      const conversation = await createGroupConversation({
        name: groupName.trim(),
        participantIds: selectedMembers
      });
      console.log("[NewChatDialog] Group created:", conversation);

      console.log("[NewChatDialog] Group creation success!");
      toast.success("Group created!");

      // First set the conversation (this will render ChatContent)
      console.log("[NewChatDialog] Setting selected conversation...");
      setSelectedConversation(conversation);

      // Then close the dialog and reset state after a short delay
      setTimeout(() => {
        console.log("[NewChatDialog] Closing dialog and resetting state...");
        onOpenChange(false);
        setGroupName("");
        setSelectedMembers([]);
      }, 50);
    } catch (error) {
      console.error("[NewChatDialog] Error creating group:", error);
      toast.error("Failed to create group");
    } finally {
      console.log("[NewChatDialog] Cleanup - setCreating(false)");
      setCreating(false);
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>Start a direct message or create a group</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="direct" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct">Direct Message</TabsTrigger>
            <TabsTrigger value="group">
              <Users className="mr-2 h-4 w-4" />
              New Group
            </TabsTrigger>
          </TabsList>

          {/* Direct Message Tab */}
          <TabsContent value="direct" className="space-y-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-[300px] space-y-2 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center text-sm">
                  {searchTerm ? "No members found" : "No other members in workspace"}
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleCreateChat(member.workspace_member_id)}
                    disabled={creating}
                    className="hover:bg-muted flex w-full items-center gap-3 rounded-lg p-3 transition-colors disabled:opacity-50"
                  >
                    <Avatar>
                      <AvatarImage src={member.user_profiles.avatar_url || undefined} />
                      <AvatarFallback>
                        {generateAvatarFallback(member.user_profiles.full_name || "Unknown")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{member.user_profiles.full_name || "Unknown User"}</div>
                      <div className="text-muted-foreground text-xs capitalize">{member.workspace_member_role}</div>
                    </div>
                    {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  </button>
                ))
              )}
            </div>
          </TabsContent>

          {/* New Group Tab */}
          <TabsContent value="group" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map((memberId) => {
                  const member = members.find((m) => m.workspace_member_id === memberId);
                  if (!member) return null;
                  return (
                    <Badge key={memberId} variant="secondary" className="gap-1">
                      {member.user_profiles.full_name}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => toggleMemberSelection(memberId)}
                      />
                    </Badge>
                  );
                })}
              </div>
            )}

            <div className="space-y-2">
              <Label>Select Members (at least 2)</Label>
              <div className="relative">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="max-h-[200px] space-y-2 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center text-sm">
                  {searchTerm ? "No members found" : "No other members in workspace"}
                </div>
              ) : (
                filteredMembers.map((member) => {
                  const isSelected = selectedMembers.includes(member.workspace_member_id);
                  return (
                    <button
                      key={member.id}
                      onClick={() => toggleMemberSelection(member.workspace_member_id)}
                      className={`hover:bg-muted flex w-full items-center gap-3 rounded-lg p-3 transition-colors ${
                        isSelected ? "bg-muted" : ""
                      }`}
                    >
                      <Avatar>
                        <AvatarImage src={member.user_profiles.avatar_url || undefined} />
                        <AvatarFallback>
                          {generateAvatarFallback(member.user_profiles.full_name || "Unknown")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{member.user_profiles.full_name || "Unknown User"}</div>
                        <div className="text-muted-foreground text-xs capitalize">{member.workspace_member_role}</div>
                      </div>
                      {isSelected && <Badge>Selected</Badge>}
                    </button>
                  );
                })
              )}
            </div>

            <Button
              className="w-full"
              onClick={handleCreateGroup}
              disabled={creating || !groupName.trim() || selectedMembers.length < 2}
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                `Create Group (${selectedMembers.length} members)`
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
