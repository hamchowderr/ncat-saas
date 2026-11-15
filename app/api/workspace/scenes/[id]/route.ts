import { createClient } from "@/lib/server";
import { NextRequest, NextResponse } from "next/server";

// GET single scene
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

    // Get scene with story join (verify ownership)
    const { data: scene, error: sceneError } = await supabase
      .from("scenes")
      .select(`
        *,
        stories (
          id,
          title,
          user_id
        )
      `)
      .eq("id", id)
      .single();

    if (sceneError || !scene || scene.stories?.user_id !== user.id) {
      return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    }

    return NextResponse.json(scene);
  } catch (error) {
    console.error("Error in GET /api/workspace/scenes/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update scene
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

    // Verify scene ownership
    const { data: existingScene, error: existingError } = await supabase
      .from("scenes")
      .select(`
        id,
        stories!inner(user_id)
      `)
      .eq("id", id)
      .single();

    // Type assertion: stories is a single object when using !inner join
    const sceneStory = existingScene?.stories as unknown as { user_id: string } | null;

    if (existingError || !existingScene || sceneStory?.user_id !== user.id) {
      return NextResponse.json({ error: "Scene not found or access denied" }, { status: 404 });
    }

    // Parse request body
    const body = await req.json();
    const {
      story_id,
      title,
      description,
      sequence_number,
      duration_seconds,
      status,
      audio_url,
      video_url,
      final_scene_url,
      scene_script,
      approved,
      settings,
      generated_content
    } = body;

    // Build update object (only include provided fields)
    const updates: any = {};
    if (story_id !== undefined) updates.story_id = story_id;
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (sequence_number !== undefined) updates.sequence_number = sequence_number;
    if (duration_seconds !== undefined) updates.duration_seconds = duration_seconds;
    if (status !== undefined) updates.status = status;
    if (audio_url !== undefined) updates.audio_url = audio_url;
    if (video_url !== undefined) updates.video_url = video_url;
    if (final_scene_url !== undefined) updates.final_scene_url = final_scene_url;
    if (scene_script !== undefined) updates.scene_script = scene_script;
    if (approved !== undefined) updates.approved = approved;
    if (settings !== undefined) updates.settings = settings;
    if (generated_content !== undefined) updates.generated_content = generated_content;

    // If story_id is being changed, verify new story exists and user owns it
    if (story_id) {
      const { data: story, error: storyError } = await supabase
        .from("stories")
        .select("id, user_id")
        .eq("id", story_id)
        .eq("user_id", user.id)
        .single();

      if (storyError || !story) {
        return NextResponse.json({ error: "Invalid story" }, { status: 400 });
      }
    }

    // Update scene
    const { data: scene, error: updateError } = await supabase
      .from("scenes")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        stories (
          id,
          title,
          user_id
        )
      `)
      .single();

    if (updateError || !scene) {
      console.error("Error updating scene:", updateError);
      return NextResponse.json({ error: "Failed to update scene" }, { status: 500 });
    }

    return NextResponse.json(scene);
  } catch (error) {
    console.error("Error in PATCH /api/workspace/scenes/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete scene
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

    // Verify scene ownership before deleting
    const { data: existingScene, error: existingError } = await supabase
      .from("scenes")
      .select(`
        id,
        stories!inner(user_id)
      `)
      .eq("id", id)
      .single();

    // Type assertion: stories is a single object when using !inner join
    const deleteSceneStory = existingScene?.stories as unknown as { user_id: string } | null;

    if (existingError || !existingScene || deleteSceneStory?.user_id !== user.id) {
      return NextResponse.json({ error: "Scene not found or access denied" }, { status: 404 });
    }

    // Delete scene (cascades to shots)
    const { error: deleteError } = await supabase.from("scenes").delete().eq("id", id);

    if (deleteError) {
      console.error("Error deleting scene:", deleteError);
      return NextResponse.json({ error: "Failed to delete scene" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/workspace/scenes/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
