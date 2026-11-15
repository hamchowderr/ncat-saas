import { createClient } from "@/lib/server";
import { NextRequest, NextResponse } from "next/server";

// GET single story
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get story with story_types join
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .select(`
        *,
        story_types (
          id,
          name,
          description
        )
      `)
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (storyError || !story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    return NextResponse.json(story);
  } catch (error) {
    console.error("Error in GET /api/workspace/stories/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update story
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const {
      title,
      description,
      story_type_id,
      status,
      active_story,
      approved,
      settings,
      metadata,
      voiceover_url,
      final_video_url,
      final_video_with_captions_url,
      source_content_url,
      generation_started_at,
      generation_completed_at,
      total_generation_time_seconds
    } = body;

    // Build update object (only include provided fields)
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (story_type_id !== undefined) updates.story_type_id = story_type_id;
    if (status !== undefined) updates.status = status;
    if (approved !== undefined) updates.approved = approved;
    if (settings !== undefined) updates.settings = settings;
    if (metadata !== undefined) updates.metadata = metadata;
    if (voiceover_url !== undefined) updates.voiceover_url = voiceover_url;
    if (final_video_url !== undefined) updates.final_video_url = final_video_url;
    if (final_video_with_captions_url !== undefined)
      updates.final_video_with_captions_url = final_video_with_captions_url;
    if (source_content_url !== undefined) updates.source_content_url = source_content_url;
    if (generation_started_at !== undefined) updates.generation_started_at = generation_started_at;
    if (generation_completed_at !== undefined)
      updates.generation_completed_at = generation_completed_at;
    if (total_generation_time_seconds !== undefined)
      updates.total_generation_time_seconds = total_generation_time_seconds;

    // Handle active_story toggle (only one story can be active at a time)
    if (active_story !== undefined) {
      updates.active_story = active_story;

      if (active_story) {
        // Unset other active stories first
        await supabase
          .from("stories")
          .update({ active_story: false })
          .eq("user_id", user.id)
          .eq("active_story", true)
          .neq("id", id);
      }
    }

    // If story_type_id provided, verify it exists and user has access
    if (story_type_id) {
      const { data: storyType, error: storyTypeError } = await supabase
        .from("story_types")
        .select("id")
        .eq("id", story_type_id)
        .single();

      if (storyTypeError || !storyType) {
        return NextResponse.json({ error: "Invalid story type" }, { status: 400 });
      }
    }

    // Update story
    const { data: story, error: updateError } = await supabase
      .from("stories")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select(`
        *,
        story_types (
          id,
          name,
          description
        )
      `)
      .single();

    if (updateError || !story) {
      console.error("Error updating story:", updateError);
      return NextResponse.json({ error: "Failed to update story" }, { status: 500 });
    }

    return NextResponse.json(story);
  } catch (error) {
    console.error("Error in PATCH /api/workspace/stories/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete story
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete story (cascades to scenes and shots)
    const { error: deleteError } = await supabase
      .from("stories")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting story:", deleteError);
      return NextResponse.json({ error: "Failed to delete story" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/workspace/stories/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
