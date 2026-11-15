import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";

/**
 * DELETE /api/cookies/[id]
 * Delete a cookie entry
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify cookie exists and belongs to user
    const { data: cookie, error: fetchError } = await supabase
      .from("user_cookies")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !cookie) {
      return NextResponse.json({ error: "Cookie not found or access denied" }, { status: 404 });
    }

    // Delete the cookie
    const { error: deleteError } = await supabase
      .from("user_cookies")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting cookie:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Create audit log
    const { error: auditError } = await supabase.from("cookie_audit_logs").insert({
      user_id: user.id,
      cookie_id: id,
      action: "deleted",
      ip_address: req.headers.get("x-forwarded-for"),
      user_agent: req.headers.get("user-agent")
    });

    if (auditError) {
      console.error("Error creating audit log:", auditError);
      // Don't fail the request if audit log fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/cookies/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
