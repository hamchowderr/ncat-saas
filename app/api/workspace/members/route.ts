import { createClient, createServiceRoleClient } from "@/lib/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get workspace ID from query parameters
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
    }

    // Check if user is app admin
    const { data: isAdmin } = await supabase.rpc("is_application_admin", {
      user_id: user.id
    });

    let userRole = "readonly"; // Default for impersonating admin

    // Try to get user's membership in THIS workspace
    const { data: workspaceMember } = await supabase
      .from("workspace_members")
      .select("workspace_id, workspace_member_role")
      .eq("workspace_member_id", user.id)
      .eq("workspace_id", workspaceId)
      .single();

    if (workspaceMember) {
      // User is a member of this workspace
      userRole = workspaceMember.workspace_member_role;
    } else if (!isAdmin) {
      // User is NOT a member and NOT an admin - they shouldn't access this
      return NextResponse.json({ error: "Could not find workspace" }, { status: 404 });
    }
    // If isAdmin && !workspaceMember, user is impersonating - continue with readonly access

    // Get all members of the workspace
    const { data: workspaceMembers, error: membersError } = await supabase
      .from("workspace_members")
      .select(
        `
        id,
        workspace_member_role,
        added_at,
        workspace_member_id,
        user_profiles:workspace_member_id (
          id,
          full_name,
          avatar_url
        )
      `
      )
      .eq("workspace_id", workspaceId)
      .order("added_at", { ascending: false });

    if (membersError) {
      return NextResponse.json({ error: membersError.message }, { status: 500 });
    }

    // Use service role client to get user emails from auth.users
    const supabaseAdmin = createServiceRoleClient();

    const membersWithEmails = await Promise.all(
      (workspaceMembers || []).map(async (member) => {
        const { data: authData } = await supabaseAdmin.auth.admin.getUserById(
          member.workspace_member_id
        );

        return {
          ...member,
          email: authData?.user?.email || null
        };
      })
    );

    // Filter out the current user if they're an admin impersonating
    // (admin shouldn't appear in the members list when impersonating)
    const isImpersonating = isAdmin && !workspaceMember;
    const filteredMembers = isImpersonating
      ? membersWithEmails.filter((member) => member.workspace_member_id !== user.id)
      : membersWithEmails;

    return NextResponse.json({
      members: filteredMembers,
      currentUserRole: userRole
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
