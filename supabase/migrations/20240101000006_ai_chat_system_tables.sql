-- Migration 6: AI/Chat System Tables
-- Create chat-related tables for AI chat functionality

-- Chats Table
CREATE TABLE IF NOT EXISTS "public"."chats" (
"id" "text" PRIMARY KEY NOT NULL,
"user_id" "uuid" NOT NULL REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE,
"payload" "jsonb",
"created_at" timestamp WITH time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
"project_id" "uuid" NOT NULL REFERENCES "public"."projects"("id") ON DELETE CASCADE
);
