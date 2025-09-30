import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";
import { createClient } from "@/lib/server";
import type { ChatMetadata, UIMessage } from "@/lib/types/chat";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, chatId } = await req.json();

  // Get authenticated user for saving chat
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: "You are a helpful AI assistant. Provide clear, concise, and accurate responses.",
    messages: convertToModelMessages(messages),
    onFinish: async ({ text, usage, finishReason }) => {
      // Auto-save chat after completion if user is authenticated
      if (!user || !chatId) return;

      try {
        // Build updated messages array with the new assistant response
        const updatedMessages: UIMessage[] = [
          ...messages,
          {
            id: Date.now().toString(),
            role: "assistant" as const,
            parts: [{ type: "text", text }]
          }
        ];

        // Build metadata for tracking
        const metadata: ChatMetadata = {
          model: "gpt-4o-mini",
          totalTokens: usage.totalTokens || 0,
          promptTokens: usage.inputTokens || 0,
          completionTokens: usage.outputTokens || 0,
          lastUpdated: new Date().toISOString(),
          messageCount: updatedMessages.length
        };

        // Update the chat in the database
        const { error } = await supabase
          .from("chats")
          .update({
            messages: updatedMessages as any,
            metadata: metadata as any
          })
          .eq("id", chatId)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error saving chat:", error);
        }
      } catch (error) {
        console.error("Error in onFinish callback:", error);
      }
    }
  });

  return result.toUIMessageStreamResponse();
}
