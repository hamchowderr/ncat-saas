import { createClient } from "@/lib/server";
import { NextRequest, NextResponse } from "next/server";

// GET all stories for the authenticated user
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

    // Get stories with story_types join
    const { data: stories, error: storiesError } = await supabase
      .from("stories")
      .select(`
        *,
        story_types (
          id,
          name,
          description
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (storiesError) {
      console.error("Error fetching stories:", storiesError);
      return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
    }

    return NextResponse.json(stories);
  } catch (error) {
    console.error("Error in GET /api/workspace/stories:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new story
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
      title,
      description,
      story_type_id,
      status = "draft",
      active_story = false,
      settings = {},
      metadata = {}
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
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

    // If setting active_story to true, unset other active stories first
    if (active_story) {
      await supabase
        .from("stories")
        .update({ active_story: false })
        .eq("user_id", user.id)
        .eq("active_story", true);
    }

    // Insert story
    const { data: story, error: insertError } = await supabase
      .from("stories")
      .insert({
        title,
        description,
        story_type_id,
        user_id: user.id,
        status,
        active_story,
        settings,
        metadata
      })
      .select(`
        *,
        story_types (
          id,
          name,
          description
        )
      `)
      .single();

    if (insertError) {
      console.error("Error creating story:", insertError);
      return NextResponse.json({ error: "Failed to create story" }, { status: 500 });
    }

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/workspace/stories:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
