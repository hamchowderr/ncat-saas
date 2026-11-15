-- Migration: Realtime Broadcast for Chat System
-- Description: Replace postgres_changes with broadcast triggers for production-ready chat
-- This follows Supabase best practices for scalable real-time applications

-- ============================================================================
-- BROADCAST FUNCTIONS
-- ============================================================================

-- Function to broadcast workspace conversation changes
CREATE OR REPLACE FUNCTION broadcast_workspace_conversation_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Determine which record to use (NEW for INSERT/UPDATE, OLD for DELETE)
  DECLARE
    record_data RECORD;
    workspace_id_value UUID;
  BEGIN
    IF TG_OP = 'DELETE' THEN
      record_data := OLD;
      workspace_id_value := OLD.workspace_id;
    ELSE
      record_data := NEW;
      workspace_id_value := NEW.workspace_id;
    END IF;

    -- Broadcast to workspace-specific channel with minimal payload
    -- Clients will refetch full data via React Query invalidation
    PERFORM realtime.send(
      jsonb_build_object(
        'conversation_id', record_data.id,
        'workspace_id', workspace_id_value,
        'operation', TG_OP,
        'timestamp', CURRENT_TIMESTAMP
      ),
      TG_OP, -- Event type: 'INSERT', 'UPDATE', or 'DELETE'
      'workspace:' || workspace_id_value::text || ':conversations',
      true -- private channel (requires RLS authorization)
    );

    RETURN record_data;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to broadcast workspace message changes
CREATE OR REPLACE FUNCTION broadcast_workspace_message_changes()
RETURNS TRIGGER AS $$
BEGIN
  DECLARE
    record_data RECORD;
    conversation_workspace_id UUID;
  BEGIN
    IF TG_OP = 'DELETE' THEN
      record_data := OLD;
    ELSE
      record_data := NEW;
    END IF;

    -- Get workspace_id from conversation
    SELECT workspace_id INTO conversation_workspace_id
    FROM workspace_conversations
    WHERE id = record_data.conversation_id;

    -- Broadcast to workspace-specific channel
    PERFORM realtime.send(
      jsonb_build_object(
        'message_id', record_data.id,
        'conversation_id', record_data.conversation_id,
        'operation', TG_OP,
        'timestamp', CURRENT_TIMESTAMP
      ),
      TG_OP,
      'workspace:' || conversation_workspace_id::text || ':messages',
      true -- private channel
    );

    -- Also broadcast to conversation-specific channel for real-time message display
    PERFORM realtime.send(
      jsonb_build_object(
        'message_id', record_data.id,
        'sender_id', record_data.sender_id,
        'operation', TG_OP,
        'timestamp', CURRENT_TIMESTAMP
      ),
      TG_OP,
      'conversation:' || record_data.conversation_id::text || ':messages',
      true -- private channel
    );

    RETURN record_data;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to broadcast conversation participant changes
CREATE OR REPLACE FUNCTION broadcast_conversation_participant_changes()
RETURNS TRIGGER AS $$
BEGIN
  DECLARE
    record_data RECORD;
    conversation_workspace_id UUID;
  BEGIN
    IF TG_OP = 'DELETE' THEN
      record_data := OLD;
    ELSE
      record_data := NEW;
    END IF;

    -- Get workspace_id from conversation
    SELECT workspace_id INTO conversation_workspace_id
    FROM workspace_conversations
    WHERE id = record_data.conversation_id;

    -- Broadcast participant changes to workspace channel
    PERFORM realtime.send(
      jsonb_build_object(
        'conversation_id', record_data.conversation_id,
        'user_id', record_data.user_id,
        'operation', TG_OP,
        'timestamp', CURRENT_TIMESTAMP
      ),
      'PARTICIPANT_' || TG_OP,
      'workspace:' || conversation_workspace_id::text || ':conversations',
      true -- private channel
    );

    RETURN record_data;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to broadcast message receipt changes
CREATE OR REPLACE FUNCTION broadcast_message_receipt_changes()
RETURNS TRIGGER AS $$
BEGIN
  DECLARE
    record_data RECORD;
    conversation_workspace_id UUID;
    message_conversation_id UUID;
  BEGIN
    IF TG_OP = 'DELETE' THEN
      record_data := OLD;
    ELSE
      record_data := NEW;
    END IF;

    -- Get conversation_id from message, then workspace_id from conversation
    SELECT conversation_id INTO message_conversation_id
    FROM workspace_messages
    WHERE id = record_data.message_id;

    SELECT workspace_id INTO conversation_workspace_id
    FROM workspace_conversations
    WHERE id = message_conversation_id;

    -- Broadcast receipt changes (for unread count updates)
    PERFORM realtime.send(
      jsonb_build_object(
        'message_id', record_data.message_id,
        'user_id', record_data.user_id,
        'operation', TG_OP,
        'timestamp', CURRENT_TIMESTAMP
      ),
      'RECEIPT_' || TG_OP,
      'workspace:' || conversation_workspace_id::text || ':conversations',
      true -- private channel
    );

    RETURN record_data;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger for workspace_conversations table
DROP TRIGGER IF EXISTS on_workspace_conversation_change ON workspace_conversations;
CREATE TRIGGER on_workspace_conversation_change
  AFTER INSERT OR UPDATE OR DELETE ON workspace_conversations
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_workspace_conversation_changes();

-- Trigger for workspace_messages table
DROP TRIGGER IF EXISTS on_workspace_message_change ON workspace_messages;
CREATE TRIGGER on_workspace_message_change
  AFTER INSERT OR UPDATE OR DELETE ON workspace_messages
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_workspace_message_changes();

-- Trigger for workspace_conversation_participants table
DROP TRIGGER IF EXISTS on_conversation_participant_change ON workspace_conversation_participants;
CREATE TRIGGER on_conversation_participant_change
  AFTER INSERT OR UPDATE OR DELETE ON workspace_conversation_participants
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_conversation_participant_changes();

-- Trigger for workspace_message_receipts table
DROP TRIGGER IF EXISTS on_message_receipt_change ON workspace_message_receipts;
CREATE TRIGGER on_message_receipt_change
  AFTER INSERT OR UPDATE OR DELETE ON workspace_message_receipts
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_message_receipt_changes();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION broadcast_workspace_conversation_changes() IS
  'Broadcasts conversation changes to workspace-specific realtime channel using Supabase Broadcast';

COMMENT ON FUNCTION broadcast_workspace_message_changes() IS
  'Broadcasts message changes to workspace and conversation-specific realtime channels';

COMMENT ON FUNCTION broadcast_conversation_participant_changes() IS
  'Broadcasts participant changes (add/remove) to workspace realtime channel';

COMMENT ON FUNCTION broadcast_message_receipt_changes() IS
  'Broadcasts message receipt changes (read status) to workspace realtime channel';
