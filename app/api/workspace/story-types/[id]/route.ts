import { createClient } from "@/lib/server";
import { NextRequest, NextResponse } from "next/server";

// GET single story type
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: storyType, error } = await supabase
      .from("story_types")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching story type:", error);
      return NextResponse.json({ error: "Story type not found" }, { status: 404 });
    }

    return NextResponse.json(storyType);
  } catch (error) {
    console.error("Error in GET /api/workspace/story-types/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update story type
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Get story type to check ownership
    const { data: storyType, error: fetchError } = await supabase
      .from("story_types")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !storyType) {
      return NextResponse.json({ error: "Story type not found" }, { status: 404 });
    }

    // Parse request body
    const body = await req.json();

    // Extract all possible fields
    const {
      name,
      description,
      width,
      height,
      aspect_ratio,
      is_active,
      // Automation flags
      auto_run_image_action,
      auto_run_audio_action,
      auto_run_video_action,
      // Approval flags
      auto_approve_story_gen,
      auto_approve_shots,
      auto_approve_scenes,
      auto_approve_story,
      auto_approve_source,
      // Voice/caption settings
      voice_id,
      captions_enabled,
      // AI prompt templates
      story_prompt_system,
      story_prompt_user,
      scene_generation_prompt,
      shot_generation_system_prompt,
      shot_generation_user_prompt,
      image_prompt_generation_prompt,
      video_prompt_generation_prompt
    } = body;

    // Check workspace membership (applies to all story types in workspace)
    // If workspace_id is NULL (system defaults/starter templates), allow updates for any authenticated user
    if (storyType.workspace_id) {
      const { data: workspaceMember, error: memberError } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("workspace_member_id", user.id)
        .eq("workspace_id", storyType.workspace_id)
        .single();

      if (memberError || !workspaceMember) {
        return NextResponse.json({
          error: "You can only update story types in your workspace",
          debug: { memberError: memberError?.message, userId: user.id, workspaceId: storyType.workspace_id }
        }, { status: 403 });
      }
    }
    // else: workspace_id is NULL (system default), allow authenticated user to update

    // Build update object with all provided fields
    const updates: any = {};

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (is_active !== undefined) updates.is_active = is_active;

    // Automation flags
    if (auto_run_image_action !== undefined) updates.auto_run_image_action = auto_run_image_action;
    if (auto_run_audio_action !== undefined) updates.auto_run_audio_action = auto_run_audio_action;
    if (auto_run_video_action !== undefined) updates.auto_run_video_action = auto_run_video_action;

    // Approval flags
    if (auto_approve_story_gen !== undefined) updates.auto_approve_story_gen = auto_approve_story_gen;
    if (auto_approve_shots !== undefined) updates.auto_approve_shots = auto_approve_shots;
    if (auto_approve_scenes !== undefined) updates.auto_approve_scenes = auto_approve_scenes;
    if (auto_approve_story !== undefined) updates.auto_approve_story = auto_approve_story;
    if (auto_approve_source !== undefined) updates.auto_approve_source = auto_approve_source;

    // Voice/caption settings
    if (voice_id !== undefined) updates.voice_id = voice_id;
    if (captions_enabled !== undefined) updates.captions_enabled = captions_enabled;

    // AI prompt templates
    if (story_prompt_system !== undefined) updates.story_prompt_system = story_prompt_system;
    if (story_prompt_user !== undefined) updates.story_prompt_user = story_prompt_user;
    if (scene_generation_prompt !== undefined) updates.scene_generation_prompt = scene_generation_prompt;
    if (shot_generation_system_prompt !== undefined) updates.shot_generation_system_prompt = shot_generation_system_prompt;
    if (shot_generation_user_prompt !== undefined) updates.shot_generation_user_prompt = shot_generation_user_prompt;
    if (image_prompt_generation_prompt !== undefined) updates.image_prompt_generation_prompt = image_prompt_generation_prompt;
    if (video_prompt_generation_prompt !== undefined) updates.video_prompt_generation_prompt = video_prompt_generation_prompt;

    // Update dimensions if provided (keeping existing settings structure)
    if (width !== undefined || height !== undefined) {
      updates.width = width;
      updates.height = height;
    }

    // Perform update
    const { data: updated, error: updateError } = await supabase
      .from("story_types")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating story type:", updateError);
      if (updateError.code === "23505") {
        return NextResponse.json({ error: "Story type with this name already exists" }, { status: 409 });
      }
      return NextResponse.json({ error: "Failed to update story type" }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error in PATCH /api/workspace/story-types/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete story type (user-created only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Get story type to check ownership
    const { data: storyType, error: fetchError } = await supabase
      .from("story_types")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !storyType) {
      return NextResponse.json({ error: "Story type not found" }, { status: 404 });
    }

    // Check workspace membership
    if (storyType.workspace_id) {
      const { data: workspaceMember, error: memberError } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("workspace_member_id", user.id)
        .eq("workspace_id", storyType.workspace_id)
        .single();

      if (memberError || !workspaceMember) {
        return NextResponse.json({ error: "You can only delete story types in your workspace" }, { status: 403 });
      }
    }

    // Delete story type
    const { error: deleteError } = await supabase.from("story_types").delete().eq("id", id);

    if (deleteError) {
      console.error("Error deleting story type:", deleteError);
      return NextResponse.json({ error: "Failed to delete story type" }, { status: 500 });
    }

    return NextResponse.json({ message: "Story type deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/workspace/story-types/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
