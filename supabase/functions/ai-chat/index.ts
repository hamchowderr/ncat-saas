// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { streamText, type CoreMessage } from "ai";
import { openai } from "@ai-sdk/openai";

interface ChatRequest {
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    parts: Array<{ type: string; text?: string; image?: string }>;
  }>;
  chatId?: string;
}

// Add type for Supabase Edge Function handler
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response> | Response): void;
};

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
      }
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization header missing" }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Extract JWT token
    const token = authHeader.replace("Bearer ", "");

    // Create supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    const model = openai.chat('gpt-4-turbo-preview');

    const { messages, chatId } = (await req.json()) as ChatRequest;

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const formattedMessages: CoreMessage[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.parts.map(part => part.text || '').join('\n'),
    }));

    const result = await streamText({
      model,
      messages: formattedMessages,
      temperature: 0.7,
    });

    // Save usage to database if needed
    // const { data, error } = await supabase
    //   .from("chat_usage")
    //   .insert([
    //     {
    //       chat_id: chatId,
    //       prompt_tokens: result.usage?.prompt?.tokens,
    //       completion_tokens: result.usage?.completion?.tokens,
    //       total_tokens: (result.usage?.prompt?.tokens || 0) + (result.usage?.completion?.tokens || 0),
    //     },
    //   ]);

    // Update the chat in the database
    const { error } = await supabase
      .from("chats")
      .update({
        messages: [
          ...messages,
          {
            id: Date.now().toString(),
            role: "assistant" as const,
            parts: [{ type: "text", text: result.text }]
          }
        ],
        metadata: {
          model: "gpt-4o",
          totalTokens: 0, // These values would be available in the response
          promptTokens: 0, // You can calculate these based on the response
          completionTokens: 0,
          lastUpdated: new Date().toISOString(),
          messageCount: messages.length + 1
        }
      })
      .eq("id", chatId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error saving chat:", error);
      return new Response(
        JSON.stringify({ error: "Failed to save chat" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Convert the result to a stream response
    const stream = await result.toTextStreamResponse();
    return new Response(stream.body, {
      status: 200,
      headers: {
        ...Object.fromEntries(stream.headers.entries()),
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to process chat" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      }
    );
  }
});
