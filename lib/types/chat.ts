import { type Tables, type TablesInsert, type TablesUpdate } from "@/lib/database.types";

// Database types from generated schema (Mastra tables)
export type MastraThread = Tables<"mastra_threads">;
export type MastraThreadInsert = TablesInsert<"mastra_threads">;
export type MastraThreadUpdate = TablesUpdate<"mastra_threads">;
export type MastraMessage = Tables<"mastra_messages">;
export type MastraMessageInsert = TablesInsert<"mastra_messages">;
export type MastraResource = Tables<"mastra_resources">;
export type MastraWorkingMemory = Tables<"mastra_working_memory">;

// Metadata structure for tracking conversation info
export interface ChatMetadata {
  model?: string;
  totalTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  lastUpdated?: string;
  messageCount?: number;
}

// Model settings for controlling LLM behavior
export interface ModelSettings {
  temperature?: number;        // 0-2, controls randomness/creativity
  frequencyPenalty?: number;   // -2 to 2, reduces repetition of tokens
  presencePenalty?: number;    // -2 to 2, encourages topic diversity
  topP?: number;               // 0-1, nucleus sampling
  topK?: number;               // Limits vocabulary to top K tokens
  maxRetries?: number;         // Max retry attempts for failed requests
  stopSequences?: string[];    // Array of strings to stop generation
}

// Provider-specific options
export interface ProviderOptions {
  openai?: {
    reasoningEffort?: "low" | "medium" | "high"; // For o1 models
    [key: string]: any;
  };
  anthropic?: {
    [key: string]: any;
  };
  [key: string]: any;
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
  modelSettings?: ModelSettings;
  maxSteps?: number;
  maxTokens?: number;
  providerOptions?: ProviderOptions;
}

export interface UpdateChatRequest {
  title?: string;
  messages: UIMessage[];
  metadata?: ChatMetadata;
  modelSettings?: ModelSettings;
  maxSteps?: number;
  maxTokens?: number;
  providerOptions?: ProviderOptions;
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
