import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";

/**
 * GET /api/workspace/messages/[id]/receipts
 * Get all users who have read this message
 * Returns read receipts with user profile information
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id: messageId } = await params;

  // Get current user
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify user is a participant in the conversation
    const { data: message } = await supabase
      .from("workspace_messages")
      .select("conversation_id")
      .eq("id", messageId)
      .single();

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if user is a participant
    const { data: participant } = await supabase
      .from("workspace_conversation_participants")
      .select("user_id")
      .eq("conversation_id", message.conversation_id)
      .eq("user_id", user.id)
      .single();

    if (!participant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all read receipts for this message
    const { data: receipts, error } = await supabase
      .from("workspace_message_receipts")
      .select(
        `
        message_id,
        user_id,
        read_at,
        user_profile:user_profiles(
          id,
          full_name,
          avatar_url
        )
      `
      )
      .eq("message_id", messageId)
      .order("read_at", { ascending: true });

    if (error) throw error;

    const flattenedReceipts = receipts?.map((r: any) => ({
      message_id: r.message_id,
      user_id: r.user_id,
      read_at: r.read_at,
      user_profile: r.user_profile
    }));

    return NextResponse.json({ receipts: flattenedReceipts || [] });
  } catch (error: any) {
    console.error("Error fetching message receipts:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
