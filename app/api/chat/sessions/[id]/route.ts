import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";
import type { UpdateChatRequest, GetChatResponse } from "@/lib/types/chat";

export const maxDuration = 30;

// GET /api/chat/sessions/[id] - Get a specific chat session
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the specific chat
    const { data: chat, error } = await supabase
      .from("chats")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !chat) {
      console.error("Error fetching chat:", error);
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const response: GetChatResponse = {
      id: chat.id,
      title: chat.title,
      messages: (chat.messages as any) || [],
      metadata: (chat.metadata as any) || null,
      createdAt: chat.created_at,
      updatedAt: chat.updated_at
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/chat/sessions/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/chat/sessions/[id] - Update a chat session with new messages
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as UpdateChatRequest;
    const { title, messages, metadata } = body;

    // Update the chat
    const { data: chat, error } = await supabase
      .from("chats")
      .update({
        title: title !== undefined ? title : undefined,
        messages: messages as any,
        metadata: metadata as any
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error || !chat) {
      console.error("Error updating chat:", error);
      return NextResponse.json({ error: "Failed to update chat" }, { status: 500 });
    }

    return NextResponse.json({
      id: chat.id,
      title: chat.title,
      messages: chat.messages,
      metadata: chat.metadata,
      createdAt: chat.created_at,
      updatedAt: chat.updated_at
    });
  } catch (error) {
    console.error("Error in PUT /api/chat/sessions/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/chat/sessions/[id] - Delete a chat session
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the chat
    const { error } = await supabase.from("chats").delete().eq("id", id).eq("user_id", user.id);

    if (error) {
      console.error("Error deleting chat:", error);
      return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/chat/sessions/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
