import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";

/**
 * GET /api/workspace/conversations/[id]/messages
 * Fetch messages for a specific conversation with pagination
 * Query params: limit (default 50), offset (default 0)
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id: conversationId } = await params;
  const { searchParams } = new URL(request.url);

  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  // Get current user
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify conversation exists
    const { data: conversation, error: convError } = await supabase
      .from("workspace_conversations")
      .select("id")
      .eq("id", conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Verify user is a participant (works for both 1-on-1 and groups)
    const { data: isParticipant } = await supabase.rpc("is_conversation_participant", {
      p_conversation_id: conversationId,
      p_user_id: user.id
    });

    if (!isParticipant) {
      return NextResponse.json({ error: "Not authorized to view this conversation" }, { status: 403 });
    }

    // Get messages with sender info and read receipts
    const { data: messages, error } = await supabase
      .from("workspace_messages")
      .select(
        `
        id,
        conversation_id,
        sender_id,
        content,
        message_type,
        attachment_url,
        attachment_metadata,
        created_at,
        sender:user_profiles!workspace_messages_sender_id_fkey(
          id,
          full_name,
          avatar_url
        ),
        receipts:workspace_message_receipts(
          id,
          user_id,
          read_at
        )
      `
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Format messages with read status
    const formattedMessages = messages?.map((msg) => ({
      id: msg.id,
      conversation_id: msg.conversation_id,
      sender_id: msg.sender_id,
      sender: msg.sender,
      content: msg.content,
      message_type: msg.message_type,
      attachment_url: msg.attachment_url,
      attachment_metadata: msg.attachment_metadata,
      created_at: msg.created_at,
      is_read: msg.receipts?.some((r: any) => r.user_id === user.id) || false,
      read_by_other: msg.receipts?.some(
        (r: any) => r.user_id !== user.id
      ) || false
    }));

    return NextResponse.json({ messages: formattedMessages || [] });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
