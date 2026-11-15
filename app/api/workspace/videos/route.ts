import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      video_url,
      source_file_id,
      clip_width,
      clip_height,
      videos_to_create,
      description,
      active_video
    } = body;

    // Validate required fields
    if (!video_url || !clip_width || !clip_height || !videos_to_create) {
      return NextResponse.json(
        {
          message: "Missing required fields: video_url, clip_width, clip_height, videos_to_create"
        },
        { status: 400 }
      );
    }

    // Insert video into database
    const { data: video, error: insertError } = await supabase
      .from("videos")
      .insert({
        user_id: user.id,
        video_url,
        source_file_id: source_file_id || null,
        clip_width,
        clip_height,
        videos_to_create,
        description: description || null,
        active_video: active_video || false
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("Error inserting video:", insertError);
      return NextResponse.json(
        { message: "Failed to create video", error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/workspace/videos:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch all videos for the user
    const { data: videos, error: fetchError } = await supabase
      .from("videos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching videos:", fetchError);
      return NextResponse.json(
        { message: "Failed to fetch videos", error: fetchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(videos || [], { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/workspace/videos:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
