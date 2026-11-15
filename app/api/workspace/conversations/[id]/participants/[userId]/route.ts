import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";

/**
 * DELETE /api/workspace/conversations/[id]/participants/[userId]
 * Remove a participant from a group conversation
 * - Creator can remove any member
 * - Any participant can remove themselves (leave group)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const supabase = await createClient();
  const { id: conversationId, userId: userIdToRemove } = await params;

  // Get current user
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Use helper function to remove participant (checks permissions automatically)
    const { data: success, error } = await supabase.rpc("remove_participant_from_conversation", {
      p_conversation_id: conversationId,
      p_user_id: userIdToRemove,
      p_removed_by: user.id
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
    console.error("Error removing participant:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
