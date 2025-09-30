-- Migration 6: AI/Chat System Tables
-- Create chat-related tables for AI chat functionality with AI SDK 5 support

-- Chats Table
CREATE TABLE IF NOT EXISTS "public"."chats" (
"id" "text" PRIMARY KEY NOT NULL,
"user_id" "uuid" NOT NULL REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE,
"project_id" "uuid" REFERENCES "public"."projects"("id") ON DELETE CASCADE,
"title" "text",
"messages" "jsonb",
"metadata" "jsonb",
"created_at" timestamp WITH time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
"updated_at" timestamp WITH time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);

-- Add performance indexes for efficient queries
CREATE INDEX IF NOT EXISTS "idx_chats_user_id_updated_at" ON "public"."chats" ("user_id", "updated_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_chats_user_id_created_at" ON "public"."chats" ("user_id", "created_at" DESC);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION "public"."update_chats_updated_at"()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trigger_update_chats_updated_at"
  BEFORE UPDATE ON "public"."chats"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."update_chats_updated_at"();

-- Chat Files Junction Table (many-to-many relationship between chats and files)
CREATE TABLE IF NOT EXISTS "public"."chat_files" (
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  "chat_id" "text" NOT NULL REFERENCES "public"."chats"("id") ON DELETE CASCADE,
  "file_id" "uuid" NOT NULL REFERENCES "public"."files"("id") ON DELETE CASCADE,
  "created_at" timestamp WITH time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
  UNIQUE("chat_id", "file_id")
);

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS "idx_chat_files_chat_id" ON "public"."chat_files" ("chat_id");
CREATE INDEX IF NOT EXISTS "idx_chat_files_file_id" ON "public"."chat_files" ("file_id");

-- Add helpful comments
COMMENT ON TABLE "public"."chats" IS 'Stores AI chat conversations with UIMessage[] format from AI SDK 5';
COMMENT ON COLUMN "public"."chats"."messages" IS 'Array of UIMessage objects from AI SDK 5 (role, parts, etc.)';
COMMENT ON COLUMN "public"."chats"."metadata" IS 'JSON metadata including model name, token counts, timestamps, etc.';
COMMENT ON COLUMN "public"."chats"."title" IS 'User-friendly title for the chat session';
COMMENT ON TABLE "public"."chat_files" IS 'Junction table linking files (uploaded or generated) with chat sessions';

-- Enable RLS for chat_files
ALTER TABLE "public"."chat_files" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_files
CREATE POLICY "Users can view their own chat files"
  ON "public"."chat_files"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "public"."chats"
      WHERE "chats"."id" = "chat_files"."chat_id"
      AND "chats"."user_id" = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own chat files"
  ON "public"."chat_files"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "public"."chats"
      WHERE "chats"."id" = "chat_files"."chat_id"
      AND "chats"."user_id" = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own chat files"
  ON "public"."chat_files"
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "public"."chats"
      WHERE "chats"."id" = "chat_files"."chat_id"
      AND "chats"."user_id" = auth.uid()
    )
  );
