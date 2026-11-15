import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";

/**
 * GET /api/workspace/conversations
 * List all conversations (both 1-on-1 and groups) for the current user in their active workspace
 * Returns conversations with last message preview, unread count, and participant info
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspace_id");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspace_id is required" }, { status: 400 });
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
    // Get all conversations where user is a participant
    const { data: userParticipations, error: participationError } = await supabase
      .from("workspace_conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (participationError) throw participationError;

    const conversationIds = userParticipations?.map((p) => p.conversation_id) || [];

    if (conversationIds.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    // Get all conversations with group metadata
    const { data: conversations, error } = await supabase
      .from("workspace_conversations")
      .select(
        `
        id,
        workspace_id,
        is_group,
        name,
        created_by,
        avatar_url,
        last_message_at,
        created_at,
        participant_1_id,
        participant_2_id
      `
      )
      .eq("workspace_id", workspaceId)
      .in("id", conversationIds)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (error) throw error;

    // For each conversation, get participants, last message, and unread count
    const conversationsWithDetails = await Promise.all(
      (conversations || []).map(async (conv) => {
        // Get all participants
        const { data: participants, error: participantsError } = await supabase
          .from("workspace_conversation_participants")
          .select(
            `
            user_id,
            role,
            joined_at,
            user_profile:user_profiles(
              id,
              full_name,
              avatar_url
            )
          `
          )
          .eq("conversation_id", conv.id)
          .order("role", { ascending: true }); // creator first

        if (participantsError) {
          console.error("Error fetching participants:", participantsError);
        }

        // Flatten the nested user_profile
        const flattenedParticipants = participants?.map((p: any) => ({
          user_id: p.user_id,
          role: p.role,
          joined_at: p.joined_at,
          user_profile: p.user_profile
        }));

        // For backward compatibility with 1-on-1 chats, determine other participant
        let otherParticipant = null;
        if (!conv.is_group && flattenedParticipants) {
          const otherP = flattenedParticipants.find((p) => p.user_id !== user.id);
          otherParticipant = otherP?.user_profile || null;
        }

        // Get last message
        const { data: lastMessage } = await supabase
          .from("workspace_messages")
          .select("id, content, message_type, created_at, sender_id")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Get unread count using helper function
        const { data: unreadCount } = await supabase.rpc("get_unread_count", {
          p_conversation_id: conv.id,
          p_user_id: user.id
        });

        return {
          id: conv.id,
          workspace_id: conv.workspace_id,
          is_group: conv.is_group,
          name: conv.name,
          created_by: conv.created_by,
          avatar_url: conv.avatar_url,
          participants: flattenedParticipants || [],
          other_participant: otherParticipant, // For 1-on-1 backward compatibility
          last_message: lastMessage,
          unread_count: unreadCount || 0,
          last_message_at: conv.last_message_at,
          created_at: conv.created_at
        };
      })
    );

    return NextResponse.json({ conversations: conversationsWithDetails });
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/workspace/conversations
 * Create a new conversation (1-on-1 or group)
 * Body (1-on-1): { workspace_id, other_user_id }
 * Body (group): { workspace_id, is_group: true, name, participant_ids }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { workspace_id, is_group, name, participant_ids, other_user_id } = body;

  if (!workspace_id) {
    return NextResponse.json({ error: "workspace_id is required" }, { status: 400 });
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
    // Branch logic based on conversation type
    if (is_group) {
      // ============= CREATE GROUP CONVERSATION =============
      if (!name || !name.trim()) {
        return NextResponse.json({ error: "Group name is required" }, { status: 400 });
      }

      if (!participant_ids || !Array.isArray(participant_ids) || participant_ids.length < 2) {
        return NextResponse.json(
          { error: "At least 2 participants are required for a group" },
          { status: 400 }
        );
      }

      // Create group conversation using helper function
      const { data: conversation, error: createError } = await supabase.rpc(
        "create_group_conversation",
        {
          p_workspace_id: workspace_id,
          p_name: name.trim(),
          p_creator_id: user.id,
          p_participant_ids: participant_ids
        }
      );

      if (createError) throw createError;

      // Get participants
      const { data: participants } = await supabase
        .from("workspace_conversation_participants")
        .select(
          `
          user_id,
          role,
          joined_at,
          user_profile:user_profiles(
            id,
            full_name,
            avatar_url
          )
        `
        )
        .eq("conversation_id", conversation.id);

      return NextResponse.json({
        conversation: {
          id: conversation.id,
          workspace_id: conversation.workspace_id,
          is_group: true,
          name: conversation.name,
          created_by: conversation.created_by,
          avatar_url: conversation.avatar_url,
          participants: participants?.map((p: any) => ({
            user_id: p.user_id,
            role: p.role,
            joined_at: p.joined_at,
            user_profile: p.user_profile
          })) || [],
          other_participant: null, // Groups don't have a single other participant
          last_message: null,
          unread_count: 0,
          last_message_at: conversation.last_message_at,
          created_at: conversation.created_at
        }
      });
    } else {
      // ============= CREATE 1-ON-1 CONVERSATION =============
      if (!other_user_id) {
        return NextResponse.json({ error: "other_user_id is required" }, { status: 400 });
      }

      // Can't create conversation with yourself
      if (user.id === other_user_id) {
        return NextResponse.json(
          { error: "Cannot create conversation with yourself" },
          { status: 400 }
        );
      }

      // Use helper function to get or create conversation
      const { data: conversationId, error } = await supabase.rpc("get_or_create_conversation", {
        p_workspace_id: workspace_id,
        p_user_1_id: user.id,
        p_user_2_id: other_user_id
      });

      if (error) throw error;

      // Get the full conversation details
      const { data: conversation } = await supabase
        .from("workspace_conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      // Get participants
      const { data: participants } = await supabase
        .from("workspace_conversation_participants")
        .select(
          `
          user_id,
          role,
          joined_at,
          user_profile:user_profiles(
            id,
            full_name,
            avatar_url
          )
        `
        )
        .eq("conversation_id", conversationId);

      const flattenedParticipants = participants?.map((p: any) => ({
        user_id: p.user_id,
        role: p.role,
        joined_at: p.joined_at,
        user_profile: p.user_profile
      }));

      const otherParticipant = flattenedParticipants?.find((p) => p.user_id !== user.id);

      return NextResponse.json({
        conversation: {
          id: conversation.id,
          workspace_id: conversation.workspace_id,
          is_group: false,
          name: null,
          created_by: null,
          avatar_url: null,
          participants: flattenedParticipants,
          other_participant: otherParticipant?.user_profile || null,
          last_message: null,
          unread_count: 0,
          last_message_at: conversation.last_message_at,
          created_at: conversation.created_at
        }
      });
    }
  } catch (error: any) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
