/**
 * Group Chat Type Definitions
 *
 * TypeScript interfaces and types for the workspace group chat system.
 * These types extend the existing chat system to support both 1-on-1
 * and group conversations.
 */

import { Database } from "../database.types";

// Database table types
type WorkspaceConversationRow = Database["public"]["Tables"]["workspace_conversations"]["Row"];
type WorkspaceMessageRow = Database["public"]["Tables"]["workspace_messages"]["Row"];
type UserProfileRow = Database["public"]["Tables"]["user_profiles"]["Row"];

/**
 * Participant role in a conversation
 */
export type ParticipantRole = "creator" | "member";

/**
 * Conversation participant with profile information
 */
export interface ConversationParticipant {
  user_id: string;
  role: ParticipantRole;
  joined_at: string;
  user_profile: UserProfileRow;
}

/**
 * Extended conversation type with group support
 */
export interface WorkspaceConversation extends Omit<WorkspaceConversationRow, "participant_1_id" | "participant_2_id" | "last_message_at" | "name" | "created_by" | "avatar_url"> {
  is_group: boolean;
  name?: string | null;
  created_by?: string | null;
  avatar_url?: string | null;
  participants: ConversationParticipant[];
  last_message?: WorkspaceMessage | null;
  last_message_at: string | null;
  unread_count?: number;
  other_participant?: UserProfileRow; // For 1-on-1 chats (backward compatibility)
}

/**
 * Message with sender information
 */
export interface WorkspaceMessage extends WorkspaceMessageRow {
  sender: UserProfileRow;
  is_read?: boolean;
  read_by_other?: boolean;
}

/**
 * Message read receipt with user information
 */
export interface MessageReceipt {
  message_id: string;
  user_id: string;
  read_at: string;
  user_profile: UserProfileRow;
}

/**
 * Request payload for creating a group conversation
 */
export interface CreateGroupConversationRequest {
  workspace_id: string;
  name: string;
  participant_ids: string[]; // User IDs to add to the group
}

/**
 * Request payload for creating a 1-on-1 conversation
 */
export interface CreateDirectConversationRequest {
  workspace_id: string;
  other_user_id: string;
}

/**
 * Request payload for adding a participant to a group
 */
export interface AddParticipantRequest {
  user_id: string;
}

/**
 * Response type for participant operations
 */
export interface ParticipantOperationResponse {
  success: boolean;
  participants?: ConversationParticipant[];
  error?: string;
}

/**
 * Conversation summary for list views
 */
export interface ConversationSummary {
  id: string;
  workspace_id: string;
  is_group: boolean;
  name?: string | null;
  avatar_url?: string | null;
  participants: ConversationParticipant[];
  last_message_preview?: string;
  last_message_at?: string;
  unread_count: number;
  created_at: string;
}

/**
 * Message attachment metadata types
 */
export interface MessageAttachmentMetadata {
  file_name?: string;
  size?: string;
  duration?: string;
  images?: string[];
  [key: string]: any; // Allow additional properties
}

/**
 * Message type enum
 */
export type MessageType = "text" | "image" | "video" | "audio" | "file";

/**
 * Send message request payload
 */
export interface SendMessageRequest {
  conversation_id: string;
  content: string;
  message_type?: MessageType;
  attachment_url?: string;
  attachment_metadata?: MessageAttachmentMetadata;
}

/**
 * Conversation context for UI components
 */
export interface ConversationContext {
  conversation: WorkspaceConversation;
  currentUserId: string;
  isCreator: boolean;
  canManageParticipants: boolean;
}
