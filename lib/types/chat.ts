import { type Tables, type TablesInsert, type TablesUpdate } from "@/lib/database.types";

// Database types from generated schema
export type ChatSession = Tables<"chats">;
export type ChatSessionInsert = TablesInsert<"chats">;
export type ChatSessionUpdate = TablesUpdate<"chats">;

// Metadata structure for tracking conversation info
export interface ChatMetadata {
  model?: string;
  totalTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  lastUpdated?: string;
  messageCount?: number;
}

// UIMessage type from AI SDK for type safety
export interface UIMessagePart {
  type: string;
  text?: string;
  image?: string;
  [key: string]: any;
}

export interface UIMessage {
  id: string;
  role: "user" | "assistant";
  parts: UIMessagePart[];
  imageUrl?: string;
  imagePrompt?: string;
  [key: string]: any;
}

// Request/Response types for API routes
export interface CreateChatRequest {
  title?: string;
  messages: UIMessage[];
  metadata?: ChatMetadata;
  projectId?: string;
}

export interface UpdateChatRequest {
  title?: string;
  messages: UIMessage[];
  metadata?: ChatMetadata;
}

export interface GetChatResponse {
  id: string;
  title: string | null;
  messages: UIMessage[];
  metadata: ChatMetadata | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListChatsResponse {
  chats: Array<{
    id: string;
    title: string | null;
    messageCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
}
