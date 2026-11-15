import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";

/**
 * POST /api/workspace/messages/[id]/read
 * Mark a message as read by creating a read receipt
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    // Verify message exists
    const { data: message, error: msgError } = await supabase
      .from("workspace_messages")
      .select("id, conversation_id, sender_id")
      .eq("id", messageId)
      .single();

    if (msgError || !message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Verify user is a participant (works for both 1-on-1 and groups)
    const { data: isParticipant } = await supabase.rpc("is_conversation_participant", {
      p_conversation_id: message.conversation_id,
      p_user_id: user.id
    });

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Not authorized to mark this message as read" },
        { status: 403 }
      );
    }

    // Don't create receipt for own messages
    if (message.sender_id === user.id) {
      return NextResponse.json({ success: true, message: "Own message, no receipt needed" });
    }

    // Create read receipt (or do nothing if already exists due to unique constraint)
    const { error: insertError } = await supabase
      .from("workspace_message_receipts")
      .insert({
        message_id: messageId,
        user_id: user.id
      });

    // Ignore unique constraint violations (already read)
    if (insertError && insertError.code !== "23505") {
      throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error marking message as read:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
