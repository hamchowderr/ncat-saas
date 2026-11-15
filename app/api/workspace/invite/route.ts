import { createClient, createServiceRoleClient } from "@/lib/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, role = "member" } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate role - only member and readonly can be invited
    const validRoles = ["member", "readonly"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Only 'member' and 'readonly' roles can be assigned through invitations." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user's workspace
    const { data: workspaceMember, error: workspaceError } = await supabase
      .from("workspace_members")
      .select("workspace_id, workspace_member_role")
      .eq("workspace_member_id", user.id)
      .single();

    if (workspaceError || !workspaceMember) {
      return NextResponse.json({ error: "Could not find workspace" }, { status: 404 });
    }

    // Check if user is admin or owner
    if (!["admin", "owner"].includes(workspaceMember.workspace_member_role)) {
      return NextResponse.json(
        { error: "You don't have permission to invite users" },
        { status: 403 }
      );
    }

    // Check if user is already invited
    const { data: existingInvite } = await supabase
      .from("workspace_invitations")
      .select("id, status")
      .eq("invitee_user_email", email)
      .eq("workspace_id", workspaceMember.workspace_id)
      .eq("status", "active")
      .single();

    if (existingInvite) {
      return NextResponse.json({ error: "User already has a pending invitation" }, { status: 400 });
    }

    // Check if user with this email already exists and is a member
    const supabaseAdmin = createServiceRoleClient();

    // Look up user by email
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = usersData?.users.find((u) => u.email === email);

    if (existingUser) {
      // Check if this user is already a workspace member
      const { data: memberCheck } = await supabase
        .from("workspace_members")
        .select("id")
        .eq("workspace_id", workspaceMember.workspace_id)
        .eq("workspace_member_id", existingUser.id)
        .maybeSingle();

      if (memberCheck) {
        return NextResponse.json({ error: "User is already a member" }, { status: 400 });
      }
    }

    // Use Supabase Admin API to invite user

    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          workspace_id: workspaceMember.workspace_id,
          workspace_role: role
        },
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?next=/workspace`
      }
    );

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 500 });
    }

    // Create invitation record
    const { data: invitation, error: invitationError } = await supabase
      .from("workspace_invitations")
      .insert({
        inviter_user_id: user.id,
        invitee_user_email: email,
        workspace_id: workspaceMember.workspace_id,
        invitee_user_role: role,
        status: "active"
      })
      .select()
      .single();

    if (invitationError) {
      console.error("Error creating invitation record:", invitationError);
      return NextResponse.json(
        { error: "Failed to create invitation record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Invitation sent successfully",
      invitation
    });
  } catch (error) {
    console.error("Error inviting user:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
