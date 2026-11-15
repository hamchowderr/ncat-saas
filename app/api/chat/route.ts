import { createClient } from "@/lib/server";
import { mastra } from "@/src/mastra";
import { RuntimeContext } from "@mastra/core/runtime-context";
import { toAISdkFormat } from "@mastra/ai-sdk";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    chatId,
    agentName,
    workspaceId,
    modelSettings,
    maxSteps,
    maxTokens,
    providerOptions
  } = await req.json();

  // Get authenticated user
  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Use Mastra agent (default to generalChatAgent if not specified)
  const selectedAgentName = agentName && agentName !== "default" ? agentName : "generalChatAgent";
  const agent = mastra.getAgent(selectedAgentName);

  if (!agent) {
    return new Response(
      JSON.stringify({ error: `Agent '${selectedAgentName}' not found` }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  // Get session for runtime context
  const {
    data: { session }
  } = await supabase.auth.getSession();

  // Prepare runtime context for tools that need auth
  const runtimeContext = new RuntimeContext();
  if (session?.access_token) {
    runtimeContext.set("userToken", session.access_token);
  }
  if (user.id) {
    runtimeContext.set("userId", user.id);
  }
  if (workspaceId) {
    runtimeContext.set("workspaceId", workspaceId);
  }

  // Use Mastra memory system with thread and resource IDs
  const threadId = chatId || `thread-${user.id}-${Date.now()}`;
  const resourceId = user.id; // User ID as resource for cross-thread memory

  try {
    // Stream response from Mastra agent with memory
    const stream = await agent.stream(messages, {
      memory: {
        thread: threadId,
        resource: resourceId,
      },
      runtimeContext,
      savePerStep: true, // CRITICAL: Save messages after each step completes
      // Pass model settings if provided (overrides agent defaults)
      ...(modelSettings && { modelSettings }),
      ...(maxSteps !== undefined && { maxSteps }),
      ...(maxTokens !== undefined && { maxTokens }),
      ...(providerOptions && { providerOptions }),
    });

    // Transform Mastra stream to AI SDK format using recommended @mastra/ai-sdk package
    const uiMessageStream = createUIMessageStream({
      execute: async ({ writer }) => {
        for await (const part of toAISdkFormat(stream, { from: "agent" })!) {
          writer.write(part);
        }
      },
    });

    // Return UI message stream response
    return createUIMessageStreamResponse({
      stream: uiMessageStream,
    });
  } catch (error) {
    console.error("Error in Mastra agent stream:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
