import { createClient } from "@/lib/server";
import { NextRequest, NextResponse } from "next/server";

// GET all story types (system defaults + user's workspace story types)
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

    // Get user's workspace
    const { data: workspaceMember, error: workspaceError } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("workspace_member_id", user.id)
      .single();

    if (workspaceError || !workspaceMember) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Get story types (system defaults + workspace's custom types)
    const { data: storyTypes, error: storyTypesError } = await supabase
      .from("story_types")
      .select("*")
      .or(`is_system_default.eq.true,workspace_id.eq.${workspaceMember.workspace_id}`)
      .order("is_system_default", { ascending: false })
      .order("name", { ascending: true });

    if (storyTypesError) {
      console.error("Error fetching story types:", storyTypesError);
      return NextResponse.json({ error: "Failed to fetch story types" }, { status: 500 });
    }

    return NextResponse.json(storyTypes);
  } catch (error) {
    console.error("Error in GET /api/workspace/story-types:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new story type
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

    // Get user's workspace
    const { data: workspaceMember, error: workspaceError } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("workspace_member_id", user.id)
      .single();

    if (workspaceError || !workspaceMember) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Parse request body
    const body = await req.json();
    const { name, description, width, height, aspect_ratio } = body;

    // Validate required fields
    if (!name || !width || !height || !aspect_ratio) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create settings object with dimensions
    const settings = {
      dimensions: {
        width,
        height,
        aspect_ratio
      },
      structure: {
        scenes_count: 3,
        shots_per_scene: 3,
        shot_duration_range: [4, 6]
      },
      style: {
        visual: "default",
        tone: "neutral",
        color_palette: "natural"
      },
      ai_models: {
        image: "dall-e-3",
        audio: "elevenlabs",
        voice_id: "default"
      },
      captions: {
        font: "Arial",
        size: 32,
        color: "#FFFFFF",
        position: "bottom",
        background: "rgba(0,0,0,0.7)"
      }
    };

    // Insert story type
    const { data: storyType, error: insertError } = await supabase
      .from("story_types")
      .insert({
        name,
        description,
        settings,
        is_active: true,
        is_system_default: false,
        created_by_user_id: user.id,
        workspace_id: workspaceMember.workspace_id
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating story type:", insertError);
      if (insertError.code === "23505") {
        return NextResponse.json({ error: "Story type with this name already exists" }, { status: 409 });
      }
      return NextResponse.json({ error: "Failed to create story type" }, { status: 500 });
    }

    return NextResponse.json(storyType, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/workspace/story-types:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
