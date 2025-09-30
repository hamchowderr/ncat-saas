import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";
import { generateId } from "ai";
import type { CreateChatRequest, ListChatsResponse } from "@/lib/types/chat";

export const maxDuration = 30;

// GET /api/chat/sessions - List all chat sessions for the current user
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all chats for the user, ordered by most recent first
    const { data: chats, error } = await supabase
      .from("chats")
      .select("id, title, messages, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching chats:", error);
      return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
    }

    // Transform data to include message count
    const response: ListChatsResponse = {
      chats: chats.map((chat) => ({
        id: chat.id,
        title: chat.title,
        messageCount: Array.isArray(chat.messages) ? chat.messages.length : 0,
        createdAt: chat.created_at,
        updatedAt: chat.updated_at
      }))
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/chat/sessions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/chat/sessions - Create a new chat session
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as CreateChatRequest;
    const { title, messages, metadata, projectId } = body;

    // Generate unique ID for the chat
    const chatId = generateId();

    // Generate default title from first user message if not provided
    const chatTitle =
      title ||
      (messages.length > 0
        ? messages[0].parts.find((p) => p.type === "text")?.text?.slice(0, 50) || "New Chat"
        : "New Chat");

    // Insert chat into database
    const { data: chat, error } = await supabase
      .from("chats")
      .insert({
        id: chatId,
        user_id: user.id,
        title: chatTitle,
        messages: messages as any,
        metadata: metadata as any,
        project_id: projectId || null
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating chat:", error);
      return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
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
    console.error("Error in POST /api/chat/sessions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
