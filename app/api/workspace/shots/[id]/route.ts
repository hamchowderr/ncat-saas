import { createClient } from "@/lib/server";
import { NextRequest, NextResponse } from "next/server";

// GET single shot
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

    // Get shot with scene and story joins (verify ownership)
    const { data: shot, error: shotError } = await supabase
      .from("shots")
      .select(`
        *,
        scenes (
          id,
          title,
          sequence_number,
          stories (
            id,
            title,
            user_id
          )
        )
      `)
      .eq("id", id)
      .single();

    if (shotError || !shot || shot.scenes?.stories?.user_id !== user.id) {
      return NextResponse.json({ error: "Shot not found" }, { status: 404 });
    }

    return NextResponse.json(shot);
  } catch (error) {
    console.error("Error in GET /api/workspace/shots/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update shot
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

    // Verify shot ownership
    const { data: existingShot, error: existingError } = await supabase
      .from("shots")
      .select(`
        id,
        scenes!inner(
          id,
          stories!inner(user_id)
        )
      `)
      .eq("id", id)
      .single();

    // Type assertion: nested !inner joins return single objects
    const shotScene = existingShot?.scenes as unknown as { stories: { user_id: string } } | null;

    if (existingError || !existingShot || shotScene?.stories?.user_id !== user.id) {
      return NextResponse.json({ error: "Shot not found or access denied" }, { status: 404 });
    }

    // Parse request body
    const body = await req.json();
    const {
      scene_id,
      title,
      description,
      sequence_number,
      duration_seconds,
      shot_type,
      camera_angle,
      status,
      image_url,
      audio_url,
      video_url,
      final_shot_url,
      thumbnail_url,
      shot_script,
      image_prompt,
      audio_prompt,
      video_prompt,
      approved,
      image_go,
      audio_go,
      video_go,
      settings,
      generated_content
    } = body;

    // Build update object (only include provided fields)
    const updates: any = {};
    if (scene_id !== undefined) updates.scene_id = scene_id;
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (sequence_number !== undefined) updates.sequence_number = sequence_number;
    if (duration_seconds !== undefined) updates.duration_seconds = duration_seconds;
    if (shot_type !== undefined) updates.shot_type = shot_type;
    if (camera_angle !== undefined) updates.camera_angle = camera_angle;
    if (status !== undefined) updates.status = status;
    if (image_url !== undefined) updates.image_url = image_url;
    if (audio_url !== undefined) updates.audio_url = audio_url;
    if (video_url !== undefined) updates.video_url = video_url;
    if (final_shot_url !== undefined) updates.final_shot_url = final_shot_url;
    if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url;
    if (shot_script !== undefined) updates.shot_script = shot_script;
    if (image_prompt !== undefined) updates.image_prompt = image_prompt;
    if (audio_prompt !== undefined) updates.audio_prompt = audio_prompt;
    if (video_prompt !== undefined) updates.video_prompt = video_prompt;
    if (approved !== undefined) updates.approved = approved;
    if (image_go !== undefined) updates.image_go = image_go;
    if (audio_go !== undefined) updates.audio_go = audio_go;
    if (video_go !== undefined) updates.video_go = video_go;
    if (settings !== undefined) updates.settings = settings;
    if (generated_content !== undefined) updates.generated_content = generated_content;

    // If scene_id is being changed, verify new scene exists and user owns it
    if (scene_id) {
      const { data: scene, error: sceneError } = await supabase
        .from("scenes")
        .select(`
          id,
          stories!inner (
            id,
            user_id
          )
        `)
        .eq("id", scene_id)
        .single();

      // Type assertion: stories is a single object when using !inner join
      const sceneStory = scene?.stories as unknown as { user_id: string } | null;

      if (sceneError || !scene || sceneStory?.user_id !== user.id) {
        return NextResponse.json({ error: "Invalid scene" }, { status: 400 });
      }
    }

    // Update shot
    const { data: shot, error: updateError } = await supabase
      .from("shots")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        scenes (
          id,
          title,
          sequence_number,
          stories (
            id,
            title,
            user_id
          )
        )
      `)
      .single();

    if (updateError || !shot) {
      console.error("Error updating shot:", updateError);
      return NextResponse.json({ error: "Failed to update shot" }, { status: 500 });
    }

    return NextResponse.json(shot);
  } catch (error) {
    console.error("Error in PATCH /api/workspace/shots/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete shot
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

    // Verify shot ownership before deleting
    const { data: existingShot, error: existingError } = await supabase
      .from("shots")
      .select(`
        id,
        scenes!inner(
          id,
          stories!inner(user_id)
        )
      `)
      .eq("id", id)
      .single();

    // Type assertion: nested !inner joins return single objects
    const deleteShotScene = existingShot?.scenes as unknown as { stories: { user_id: string } } | null;

    if (existingError || !existingShot || deleteShotScene?.stories?.user_id !== user.id) {
      return NextResponse.json({ error: "Shot not found or access denied" }, { status: 404 });
    }

    // Delete shot
    const { error: deleteError } = await supabase.from("shots").delete().eq("id", id);

    if (deleteError) {
      console.error("Error deleting shot:", deleteError);
      return NextResponse.json({ error: "Failed to delete shot" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/workspace/shots/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
