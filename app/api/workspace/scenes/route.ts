import { createClient } from "@/lib/server";
import { NextRequest, NextResponse } from "next/server";

// GET all scenes for the authenticated user
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

    // Get scenes with story join (scenes belong to user's stories)
    const { data: scenes, error: scenesError } = await supabase
      .from("scenes")
      .select(`
        *,
        stories (
          id,
          title,
          user_id
        )
      `)
      .eq("stories.user_id", user.id)
      .order("created_at", { ascending: false });

    if (scenesError) {
      console.error("Error fetching scenes:", scenesError);
      return NextResponse.json({ error: "Failed to fetch scenes" }, { status: 500 });
    }

    return NextResponse.json(scenes);
  } catch (error) {
    console.error("Error in GET /api/workspace/scenes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new scene
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
      story_id,
      title,
      description,
      sequence_number,
      duration_seconds,
      status = "planned",
      scene_script,
      approved = false,
      settings = {},
      generated_content = {}
    } = body;

    // Validate required fields
    if (!story_id || !title || sequence_number === undefined) {
      return NextResponse.json(
        { error: "story_id, title, and sequence_number are required" },
        { status: 400 }
      );
    }

    // Verify story exists and user owns it
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .select("id, user_id")
      .eq("id", story_id)
      .eq("user_id", user.id)
      .single();

    if (storyError || !story) {
      return NextResponse.json({ error: "Story not found or access denied" }, { status: 404 });
    }

    // Insert scene
    const { data: scene, error: insertError } = await supabase
      .from("scenes")
      .insert({
        story_id,
        title,
        description,
        sequence_number,
        duration_seconds,
        status,
        scene_script,
        approved,
        settings,
        generated_content
      })
      .select(`
        *,
        stories (
          id,
          title,
          user_id
        )
      `)
      .single();

    if (insertError) {
      console.error("Error creating scene:", insertError);
      return NextResponse.json({ error: "Failed to create scene" }, { status: 500 });
    }

    return NextResponse.json(scene, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/workspace/scenes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
