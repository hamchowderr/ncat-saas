import { createClient } from "@/lib/server";
import { NextRequest, NextResponse } from "next/server";

// GET all shots for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get shots with scene and story joins (shots belong to user's stories)
    const { data: shots, error: shotsError } = await supabase
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
      .eq("scenes.stories.user_id", user.id)
      .order("created_at", { ascending: false });

    if (shotsError) {
      console.error("Error fetching shots:", shotsError);
      return NextResponse.json({ error: "Failed to fetch shots" }, { status: 500 });
    }

    return NextResponse.json(shots);
  } catch (error) {
    console.error("Error in GET /api/workspace/shots:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new shot
export async function POST(req: NextRequest) {
  try {
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
      scene_id,
      title,
      description,
      sequence_number,
      duration_seconds,
      shot_type,
      camera_angle,
      status = "pending",
      shot_script,
      image_prompt,
      audio_prompt,
      video_prompt,
      approved = false,
      image_go = false,
      audio_go = false,
      video_go = false,
      settings = {},
      generated_content = {}
    } = body;

    // Validate required fields
    if (!scene_id || !title || sequence_number === undefined) {
      return NextResponse.json(
        { error: "scene_id, title, and sequence_number are required" },
        { status: 400 }
      );
    }

    // Verify scene exists and user owns it (via story)
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
      return NextResponse.json({ error: "Scene not found or access denied" }, { status: 404 });
    }

    // Insert shot
    const { data: shot, error: insertError } = await supabase
      .from("shots")
      .insert({
        scene_id,
        title,
        description,
        sequence_number,
        duration_seconds,
        shot_type,
        camera_angle,
        status,
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
      })
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

    if (insertError) {
      console.error("Error creating shot:", insertError);
      return NextResponse.json({ error: "Failed to create shot" }, { status: 500 });
    }

    return NextResponse.json(shot, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/workspace/shots:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
