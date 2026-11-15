import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";

/**
 * POST /api/workspace/conversations/[id]/participants
 * Add a participant to a group conversation (creator only)
 * Body: { user_id }
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id: conversationId } = await params;
  const body = await request.json();
  const { user_id } = body;

  if (!user_id) {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
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
    // Use helper function to add participant (checks permissions automatically)
    const { data: participant, error } = await supabase.rpc("add_participant_to_conversation", {
      p_conversation_id: conversationId,
      p_user_id: user_id,
      p_added_by: user.id
    });

    if (error) throw error;

    // Get updated participants list
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
      .eq("conversation_id", conversationId)
      .order("role", { ascending: true });

    const flattenedParticipants = participants?.map((p: any) => ({
      user_id: p.user_id,
      role: p.role,
      joined_at: p.joined_at,
      user_profile: p.user_profile
    }));

    return NextResponse.json({
      success: true,
      participants: flattenedParticipants
    });
  } catch (error: any) {
    console.error("Error adding participant:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
