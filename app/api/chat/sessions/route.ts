import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";
import { generateId } from "ai";
import type { CreateChatRequest, ListChatsResponse } from "@/lib/types/chat";

export const maxDuration = 30;

// GET /api/chat/sessions - List all chat sessions (threads) for the current user
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch threads with message counts using optimized database function
    // This replaces N+1 query pattern (1 + thread_count queries) with a single aggregated query
    const { data: threadsWithCounts, error: threadsError } = await supabase
      .rpc('get_threads_with_message_counts', { p_user_id: user.id });

    if (threadsError) {
      console.error("Error fetching threads:", threadsError);
      return NextResponse.json({ error: "Failed to fetch chat sessions" }, { status: 500 });
    }

    // Transform database result to API response format
    const formattedThreads = (threadsWithCounts || []).map((thread: any) => ({
      id: thread.id,
      title: thread.title || "Untitled Chat",
      messageCount: thread.message_count || 0,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt
    }));

    const response: ListChatsResponse = {
      chats: formattedThreads
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/chat/sessions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/chat/sessions - Create a new chat session (thread)
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

    // Generate unique ID for the thread
    const threadId = generateId();

    // Generate default title from first user message if not provided
    const threadTitle =
      title ||
      (messages && messages.length > 0
        ? messages[0].parts.find((p) => p.type === "text")?.text?.slice(0, 50) || "New Chat"
        : "New Chat");

    // Create thread in Mastra
    const { data: thread, error: threadError } = await supabase
      .from("mastra_threads")
      .insert({
        id: threadId,
        resourceId: user.id,
        title: threadTitle,
        metadata: {
          ...metadata,
          project_id: projectId || null,
          created_via: "api"
        }
      })
      .select()
      .single();

    if (threadError) {
      console.error("Error creating thread:", threadError);
      return NextResponse.json({ error: "Failed to create chat session" }, { status: 500 });
    }

    // Create resource entry if it doesn't exist
    await supabase
      .from("mastra_resources")
      .upsert(
        {
          id: user.id,
          metadata: {},
          updatedAt: new Date().toISOString()
        },
        { onConflict: "id", ignoreDuplicates: true }
      );

    // NOTE: Message insertion removed - Mastra automatically handles message persistence
    // via the memory.savePerStep option when agent.stream() is called in /api/chat
    // This prevents duplicate message insertion and ensures consistent message format

    return NextResponse.json({
      id: thread.id,
      title: thread.title,
      messages: messages || [],
      metadata: thread.metadata,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt
    });
  } catch (error) {
    console.error("Error in POST /api/chat/sessions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
