import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";
import type { UpdateChatRequest, GetChatResponse } from "@/lib/types/chat";

export const maxDuration = 30;

// GET /api/chat/sessions/[id] - Get a specific chat session (thread)
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

    // Fetch the specific thread
    const { data: thread, error: threadError } = await supabase
      .from("mastra_threads")
      .select("*")
      .eq("id", id)
      .eq("resourceId", user.id)
      .single();

    if (threadError || !thread) {
      console.error("Error fetching thread:", threadError);
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
    }

    // Fetch all messages for this thread
    const { data: messages, error: messagesError } = await supabase
      .from("mastra_messages")
      .select("*")
      .eq("thread_id", id)
      .order("createdAt", { ascending: true });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }

    // Convert Mastra messages to UI format (filter out system messages as UI doesn't support them)
    const uiMessages = messages
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .map((msg) => {
        // Mastra stores AI SDK format messages in the content field
        // The content can be a string or an object with the AI SDK structure
        let parts: any[];

        if (msg.metadata?.parts && Array.isArray(msg.metadata.parts)) {
          // If parts are in metadata, use them
          parts = msg.metadata.parts;
        } else if (typeof msg.content === "string") {
          // Try to parse AI SDK format from content string
          try {
            const parsed = JSON.parse(msg.content);
            if (parsed.format === 2 && Array.isArray(parsed.parts)) {
              // Extract parts from AI SDK format
              parts = parsed.parts;
            } else {
              // Plain string content
              parts = [{ type: "text", text: msg.content }];
            }
          } catch {
            // Not JSON, treat as plain text
            parts = [{ type: "text", text: msg.content }];
          }
        } else if (msg.content?.content) {
          // Nested content object
          parts = [{ type: "text", text: msg.content.content }];
        } else {
          // Fallback
          parts = [{ type: "text", text: "" }];
        }

        return {
          id: msg.id,
          role: msg.role as "user" | "assistant",
          parts
        };
      });

    const response: GetChatResponse = {
      id: thread.id,
      title: thread.title || "Untitled Chat",
      messages: uiMessages,
      metadata: thread.metadata || null,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/chat/sessions/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/chat/sessions/[id] - Update a chat session (thread) with new messages
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

    // Update thread title/metadata if provided
    if (title !== undefined || metadata !== undefined) {
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (metadata !== undefined) updateData.metadata = metadata;

      const { error: threadError } = await supabase
        .from("mastra_threads")
        .update(updateData)
        .eq("id", id)
        .eq("resourceId", user.id);

      if (threadError) {
        console.error("Error updating thread:", threadError);
        return NextResponse.json({ error: "Failed to update chat session" }, { status: 500 });
      }
    }

    // Note: In Mastra, messages are typically managed by the agent's stream/generate methods
    // This endpoint is primarily for updating metadata and title
    // If you need to manually add messages, you would insert them into mastra_messages

    // Fetch updated thread
    const { data: thread, error: fetchError } = await supabase
      .from("mastra_threads")
      .select("*")
      .eq("id", id)
      .eq("resourceId", user.id)
      .single();

    if (fetchError || !thread) {
      return NextResponse.json({ error: "Failed to fetch updated chat" }, { status: 500 });
    }

    return NextResponse.json({
      id: thread.id,
      title: thread.title,
      messages: messages || [],
      metadata: thread.metadata,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt
    });
  } catch (error) {
    console.error("Error in PUT /api/chat/sessions/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/chat/sessions/[id] - Delete a chat session (thread)
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

    // Delete the thread (messages will cascade delete due to foreign key)
    const { error } = await supabase
      .from("mastra_threads")
      .delete()
      .eq("id", id)
      .eq("resourceId", user.id);

    if (error) {
      console.error("Error deleting thread:", error);
      return NextResponse.json({ error: "Failed to delete chat session" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/chat/sessions/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
