-- =====================================================
-- Workspace Chat System Migration
-- =====================================================
-- This migration creates the complete team chat system with:
-- - 1-on-1 direct messaging between workspace members
-- - Real-time message delivery
-- - File attachments support
-- - Read receipts tracking
-- - Online status/presence tracking
-- - Full-text search capabilities
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

-- Message types
CREATE TYPE message_type AS ENUM (
  'text',
  'image',
  'video',
  'audio',
  'file'
);

-- Online status
CREATE TYPE online_status AS ENUM (
  'online',
  'away',
  'offline'
);

-- =====================================================
-- TABLES
-- =====================================================

-- 1. Workspace Conversations (1-on-1 chats)
-- =====================================================
CREATE TABLE workspace_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  participant_1_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure participants are different
  CONSTRAINT different_participants CHECK (participant_1_id != participant_2_id),

  -- Ensure unique conversation per workspace (with ordered participants)
  CONSTRAINT unique_conversation UNIQUE (workspace_id, participant_1_id, participant_2_id)
);

COMMENT ON TABLE workspace_conversations IS 'Direct message conversations between two workspace members';
COMMENT ON COLUMN workspace_conversations.participant_1_id IS 'First participant (should be ordered lower UUID)';
COMMENT ON COLUMN workspace_conversations.participant_2_id IS 'Second participant (should be ordered higher UUID)';
COMMENT ON COLUMN workspace_conversations.last_message_at IS 'Timestamp of most recent message for sorting';

-- 2. Workspace Messages
-- =====================================================
CREATE TABLE workspace_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES workspace_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type message_type NOT NULL DEFAULT 'text',
  attachment_url TEXT,
  attachment_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE workspace_messages IS 'Chat messages in workspace conversations';
COMMENT ON COLUMN workspace_messages.content IS 'Message text content';
COMMENT ON COLUMN workspace_messages.attachment_url IS 'URL to file in Supabase Storage (chat-attachments bucket)';
COMMENT ON COLUMN workspace_messages.attachment_metadata IS 'JSON metadata: file_name, size, duration, etc.';

-- 3. Message Read Receipts
-- =====================================================
CREATE TABLE workspace_message_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES workspace_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One receipt per user per message
  CONSTRAINT unique_receipt UNIQUE (message_id, user_id)
);

COMMENT ON TABLE workspace_message_receipts IS 'Track when users read messages';

-- 4. User Presence (Online Status)
-- =====================================================
CREATE TABLE user_presence (
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  status online_status NOT NULL DEFAULT 'offline',
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One presence record per user per workspace
  PRIMARY KEY (user_id, workspace_id)
);

COMMENT ON TABLE user_presence IS 'Track user online status per workspace';
COMMENT ON COLUMN user_presence.last_seen_at IS 'Last activity timestamp for "Last seen X ago"';

-- =====================================================
-- INDEXES
-- =====================================================

-- Conversations
CREATE INDEX idx_conversations_workspace ON workspace_conversations(workspace_id);
CREATE INDEX idx_conversations_participant1 ON workspace_conversations(participant_1_id);
CREATE INDEX idx_conversations_participant2 ON workspace_conversations(participant_2_id);
CREATE INDEX idx_conversations_last_message ON workspace_conversations(last_message_at DESC);

-- Messages
CREATE INDEX idx_messages_conversation ON workspace_messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON workspace_messages(sender_id);
CREATE INDEX idx_messages_created ON workspace_messages(created_at DESC);

-- Full-text search on message content
CREATE INDEX idx_messages_content_fts ON workspace_messages
  USING gin(to_tsvector('english', content));

-- Receipts
CREATE INDEX idx_receipts_message ON workspace_message_receipts(message_id);
CREATE INDEX idx_receipts_user ON workspace_message_receipts(user_id);

-- Presence
CREATE INDEX idx_presence_workspace ON user_presence(workspace_id, status);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get or create conversation between two users
-- =====================================================
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_workspace_id UUID,
  p_user_1_id UUID,
  p_user_2_id UUID
) RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_participant_1 UUID;
  v_participant_2 UUID;
BEGIN
  -- Order participants to ensure consistency
  IF p_user_1_id < p_user_2_id THEN
    v_participant_1 := p_user_1_id;
    v_participant_2 := p_user_2_id;
  ELSE
    v_participant_1 := p_user_2_id;
    v_participant_2 := p_user_1_id;
  END IF;

  -- Try to find existing conversation
  SELECT id INTO v_conversation_id
  FROM workspace_conversations
  WHERE workspace_id = p_workspace_id
    AND participant_1_id = v_participant_1
    AND participant_2_id = v_participant_2;

  -- Create if doesn't exist
  IF v_conversation_id IS NULL THEN
    INSERT INTO workspace_conversations (
      workspace_id,
      participant_1_id,
      participant_2_id
    ) VALUES (
      p_workspace_id,
      v_participant_1,
      v_participant_2
    )
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_or_create_conversation IS 'Get existing or create new conversation between two users';

-- Get unread message count for a conversation
-- =====================================================
CREATE OR REPLACE FUNCTION get_unread_count(
  p_conversation_id UUID,
  p_user_id UUID
) RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM workspace_messages wm
    WHERE wm.conversation_id = p_conversation_id
      AND wm.sender_id != p_user_id
      AND NOT EXISTS (
        SELECT 1
        FROM workspace_message_receipts wmr
        WHERE wmr.message_id = wm.id
          AND wmr.user_id = p_user_id
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_unread_count IS 'Count unread messages for user in conversation';

-- Search messages with full-text search
-- =====================================================
CREATE OR REPLACE FUNCTION search_workspace_messages(
  p_workspace_id UUID,
  p_user_id UUID,
  p_search_query TEXT,
  p_limit INTEGER DEFAULT 50
) RETURNS TABLE (
  message_id UUID,
  conversation_id UUID,
  sender_id UUID,
  sender_name TEXT,
  content TEXT,
  message_type message_type,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wm.id,
    wm.conversation_id,
    wm.sender_id,
    p.full_name,
    wm.content,
    wm.message_type,
    wm.created_at,
    ts_rank(to_tsvector('english', wm.content), plainto_tsquery('english', p_search_query)) as rank
  FROM workspace_messages wm
  INNER JOIN workspace_conversations wc ON wm.conversation_id = wc.id
  INNER JOIN user_profiles p ON wm.sender_id = p.id
  WHERE wc.workspace_id = p_workspace_id
    AND (wc.participant_1_id = p_user_id OR wc.participant_2_id = p_user_id)
    AND to_tsvector('english', wm.content) @@ plainto_tsquery('english', p_search_query)
  ORDER BY rank DESC, wm.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION search_workspace_messages IS 'Full-text search across user''s messages';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update conversation last_message_at on new message
-- =====================================================
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE workspace_conversations
  SET last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON workspace_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_conversations_updated_at
  BEFORE UPDATE ON workspace_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_messages_updated_at
  BEFORE UPDATE ON workspace_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_presence_updated_at
  BEFORE UPDATE ON user_presence
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE workspace_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_message_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can see conversations they're part of
-- =====================================================
CREATE POLICY "Users can view their own conversations"
  ON workspace_conversations
  FOR SELECT
  USING (
    participant_1_id = auth.uid()
    OR participant_2_id = auth.uid()
  );

CREATE POLICY "Users can create conversations with workspace members"
  ON workspace_conversations
  FOR INSERT
  WITH CHECK (
    (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_conversations.workspace_id
        AND wm.workspace_member_id = auth.uid()
    )
  );

-- Messages: Users can see messages from their conversations
-- =====================================================
CREATE POLICY "Users can view messages in their conversations"
  ON workspace_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_conversations wc
      WHERE wc.id = workspace_messages.conversation_id
        AND (wc.participant_1_id = auth.uid() OR wc.participant_2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON workspace_messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM workspace_conversations wc
      WHERE wc.id = workspace_messages.conversation_id
        AND (wc.participant_1_id = auth.uid() OR wc.participant_2_id = auth.uid())
    )
  );

-- Receipts: Users can mark their own messages as read
-- =====================================================
CREATE POLICY "Users can view read receipts for their conversations"
  ON workspace_message_receipts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_messages wm
      INNER JOIN workspace_conversations wc ON wm.conversation_id = wc.id
      WHERE wm.id = workspace_message_receipts.message_id
        AND (wc.participant_1_id = auth.uid() OR wc.participant_2_id = auth.uid())
    )
  );

CREATE POLICY "Users can create their own read receipts"
  ON workspace_message_receipts
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Presence: Users can see presence of workspace members
-- =====================================================
CREATE POLICY "Users can view presence in their workspaces"
  ON user_presence
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = user_presence.workspace_id
        AND wm.workspace_member_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own presence"
  ON user_presence
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- STORAGE BUCKET FOR CHAT ATTACHMENTS
-- =====================================================

-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat attachments
CREATE POLICY "Users can upload to their own conversation folders"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view attachments from their conversations"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'chat-attachments');

CREATE POLICY "Users can delete their own attachments"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'chat-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- SEED DATA (for local development only)
-- =====================================================

-- Note: Seed data is handled separately in seed files
-- This migration only creates the schema

COMMENT ON SCHEMA public IS 'Workspace Chat System - Complete team messaging with real-time, file attachments, read receipts, and presence tracking';
