"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Mail, Calendar, Shield, UserPlus, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { useWorkspaceContext } from "@/lib/workspace-context";

interface WorkspaceMember {
  id: string;
  workspace_member_role: "owner" | "admin" | "member" | "readonly";
  added_at: string;
  workspace_member_id: string;
  email: string | null;
  user_profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface PendingInvitation {
  id: string;
  invitee_user_email: string;
  invitee_user_role: string;
  status: string;
  created_at: string;
}

/**
 * Members Page Component
 *
 * Manages workspace team members and invitations.
 * Uses React Query for data fetching and mutations with automatic cache invalidation.
 *
 * Features:
 * - List active workspace members with roles
 * - Send email invitations to new members
 * - View and cancel pending invitations
 * - Role-based access control for invite permissions
 */
export default function MembersPage() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const { activeWorkspaceId, activeWorkspace } = useWorkspaceContext();

  // Fetch workspace members and current user role
  const {
    data: membersData,
    isLoading: membersLoading,
    error: membersError
  } = useQuery({
    queryKey: ["workspaceMembers", activeWorkspaceId],
    queryFn: async () => {
      if (!activeWorkspaceId) {
        throw new Error("No active workspace selected");
      }

      const response = await fetch(`/api/workspace/members?workspaceId=${activeWorkspaceId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load members");
      }

      return {
        members: data.members as WorkspaceMember[],
        currentUserRole: data.currentUserRole as string
      };
    },
    enabled: !!activeWorkspaceId,
    retry: 1,
    staleTime: 2 * 60 * 1000
  });

  // Fetch pending invitations
  const {
    data: invitations = [],
    isLoading: invitationsLoading
  } = useQuery({
    queryKey: ["workspaceInvitations", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const supabase = createClient();

      const { data: workspaceMember } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("workspace_member_id", user.id)
        .single();

      if (!workspaceMember) return [];

      const { data: pendingInvitations } = await supabase
        .from("workspace_invitations")
        .select("*")
        .eq("workspace_id", workspaceMember.workspace_id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      return (pendingInvitations || []) as PendingInvitation[];
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 2 * 60 * 1000
  });

  // Mutation: Send invitation
  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const response = await fetch("/api/workspace/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, role })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invitation");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaceMembers"] });
      queryClient.invalidateQueries({ queryKey: ["workspaceInvitations"] });
      toast({
        title: "Success",
        description: "Invitation sent successfully"
      });
      setInviteEmail("");
      setInviteRole("member");
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invitation",
        variant: "destructive"
      });
    }
  });

  // Mutation: Cancel invitation
  const cancelInviteMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("workspace_invitations")
        .update({ status: "inactive" })
        .eq("id", invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaceInvitations"] });
      toast({
        title: "Success",
        description: "Invitation cancelled"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel invitation",
        variant: "destructive"
      });
    }
  });

  function handleInvite() {
    if (!inviteEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  }

  function handleCancelInvite(invitationId: string) {
    cancelInviteMutation.mutate(invitationId);
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200";
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200";
      case "member":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200";
      case "readonly":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
      case "admin":
        return <Shield className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const members = membersData?.members || [];
  const currentUserRole = membersData?.currentUserRole || null;
  const canInvite = currentUserRole === "owner" || currentUserRole === "admin";
  const loading = membersLoading || invitationsLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-[250px]" />
            <Skeleton className="h-4 w-[400px]" />
          </div>
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 py-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[300px]" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (membersError) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>
              {membersError instanceof Error ? membersError.message : "Failed to load members"}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {activeWorkspace ? `${activeWorkspace.name} Members` : "Team Members"}
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage workspace members and invitations
            {activeWorkspace && ` for ${activeWorkspace.name}`}.
          </p>
        </div>
        {canInvite && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation email to add a new member to your workspace.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="readonly">Read Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={inviteMutation.isPending}>
                  {inviteMutation.isPending && (
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>Members ({members.length})</CardTitle>
            </div>
          </div>
          <CardDescription>Active members of your workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => {
              const profile = member.user_profiles;
              const email = member.email || "No email";
              const fullName = profile?.full_name || (email !== "No email" ? email.split("@")[0] : "User");
              const initials = profile?.full_name
                ? profile.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : email.slice(0, 2).toUpperCase();

              return (
                <div
                  key={member.id}
                  className="border-b last:border-b-0 flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={profile?.avatar_url || undefined}
                        alt={fullName}
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium leading-none">{fullName}</p>
                        <Badge
                          className={getRoleBadgeColor(member.workspace_member_role)}
                          variant="outline"
                        >
                          <div className="flex items-center gap-1">
                            {getRoleIcon(member.workspace_member_role)}
                            <span className="capitalize">{member.workspace_member_role}</span>
                          </div>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Joined {formatDistanceToNow(new Date(member.added_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations ({invitations.length})</CardTitle>
            <CardDescription>Users who have been invited but have not joined yet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="border-b last:border-b-0 flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {invitation.invitee_user_email.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium leading-none">{invitation.invitee_user_email}</p>
                        <Badge
                          className={getRoleBadgeColor(invitation.invitee_user_role)}
                          variant="outline"
                        >
                          <div className="flex items-center gap-1">
                            {getRoleIcon(invitation.invitee_user_role)}
                            <span className="capitalize">{invitation.invitee_user_role}</span>
                          </div>
                        </Badge>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          Pending
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Invited {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {canInvite && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCancelInvite(invitation.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
