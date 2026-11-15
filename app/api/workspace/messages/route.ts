import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";

/**
 * POST /api/workspace/messages
 * Send a new message in a conversation
 * Body: {
 *   conversation_id,
 *   content,
 *   message_type (optional, default: 'text'),
 *   attachment_url (optional),
 *   attachment_metadata (optional)
 * }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const {
    conversation_id,
    content,
    message_type = "text",
    attachment_url,
    attachment_metadata
  } = body;

  if (!conversation_id || !content) {
    return NextResponse.json(
      { error: "conversation_id and content are required" },
      { status: 400 }
    );
  }

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
      .eq("id", conversation_id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Verify user is a participant (works for both 1-on-1 and groups)
    const { data: isParticipant } = await supabase.rpc("is_conversation_participant", {
      p_conversation_id: conversation_id,
      p_user_id: user.id
    });

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Not authorized to send messages in this conversation" },
        { status: 403 }
      );
    }

    // Insert message
    const { data: message, error: insertError } = await supabase
      .from("workspace_messages")
      .insert({
        conversation_id,
        sender_id: user.id,
        content,
        message_type,
        attachment_url: attachment_url || null,
        attachment_metadata: attachment_metadata || {}
      })
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
        )
      `
      )
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ message }, { status: 201 });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
