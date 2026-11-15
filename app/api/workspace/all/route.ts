import { createClient, createServiceRoleClient } from "@/lib/server";
import { NextResponse } from "next/server";

/**
 * GET /api/workspace/all
 *
 * Returns ALL workspaces in the system for app admins.
 * For regular users, returns only workspaces they're members of.
 *
 * This endpoint uses the service role client to bypass RLS for admins.
 */
export async function GET() {
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

    // Check if user is app admin
    const { data: isAdmin, error: adminCheckError } = await supabase.rpc("is_application_admin", {
      user_id: user.id
    });

    if (adminCheckError) {
      console.error("Error checking admin status:", adminCheckError);
      return NextResponse.json({ error: "Failed to check admin status" }, { status: 500 });
    }

    let workspaces: any[] = [];
    let userMembershipIds: string[] = [];

    if (isAdmin) {
      // App admin: Fetch ALL workspaces using service role client
      const supabaseAdmin = createServiceRoleClient();
      const { data, error } = await supabaseAdmin
        .from("workspaces")
        .select("id, name, slug, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching all workspaces:", error);
        return NextResponse.json({ error: "Failed to fetch workspaces" }, { status: 500 });
      }

      workspaces = data || [];

      // Also fetch user's actual memberships to detect impersonation
      const { data: memberships } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("workspace_member_id", user.id);

      if (memberships) {
        userMembershipIds = memberships.map((m) => m.workspace_id);
      }
    } else {
      // Regular user: Fetch only workspaces they're members of
      const { data, error } = await supabase
        .from("workspace_members")
        .select(
          `
          workspace_id,
          workspaces!inner(
            id,
            name,
            slug,
            created_at
          )
        `
        )
        .eq("workspace_member_id", user.id)
        .order("workspaces(created_at)", { ascending: false });

      if (error) {
        console.error("Error fetching user workspaces:", error);
        return NextResponse.json({ error: "Failed to fetch workspaces" }, { status: 500 });
      }

      if (data) {
        workspaces = data.map((item: any) => ({
          id: item.workspaces.id,
          name: item.workspaces.name,
          slug: item.workspaces.slug,
          created_at: item.workspaces.created_at
        }));
        userMembershipIds = workspaces.map((w: any) => w.id);
      } else {
        workspaces = [];
      }
    }

    return NextResponse.json({
      workspaces,
      userMembershipIds,
      isAdmin
    });
  } catch (error) {
    console.error("Error in /api/workspace/all:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
