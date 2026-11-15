-- ============================================================================
-- Migration: Workspace Group Chat Support
-- Description: Extends the workspace chat system to support group conversations
--              while maintaining backward compatibility with 1-on-1 chats
-- ============================================================================

-- ============================================================================
-- STEP 1: Extend workspace_conversations table for group support
-- ============================================================================

ALTER TABLE workspace_conversations
  ADD COLUMN is_group BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN name TEXT,
  ADD COLUMN created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  ADD COLUMN avatar_url TEXT;

-- Make participant_1_id and participant_2_id nullable (groups don't use them)
ALTER TABLE workspace_conversations
  ALTER COLUMN participant_1_id DROP NOT NULL,
  ALTER COLUMN participant_2_id DROP NOT NULL;

-- Add constraint: groups must have a name
ALTER TABLE workspace_conversations
  ADD CONSTRAINT workspace_conversations_group_name_check
  CHECK (
    (is_group = FALSE) OR
    (is_group = TRUE AND name IS NOT NULL AND LENGTH(TRIM(name)) > 0)
  );

-- Add constraint: 1-on-1 conversations must have both participants
ALTER TABLE workspace_conversations
  ADD CONSTRAINT workspace_conversations_1on1_participants_check
  CHECK (
    (is_group = TRUE AND participant_1_id IS NULL AND participant_2_id IS NULL) OR
    (is_group = FALSE AND participant_1_id IS NOT NULL AND participant_2_id IS NOT NULL)
  );

-- Add comment
COMMENT ON COLUMN workspace_conversations.is_group IS 'Whether this is a group conversation (TRUE) or 1-on-1 (FALSE)';
COMMENT ON COLUMN workspace_conversations.name IS 'Group name (required for groups, NULL for 1-on-1)';
COMMENT ON COLUMN workspace_conversations.created_by IS 'User who created the group (NULL for 1-on-1)';
COMMENT ON COLUMN workspace_conversations.avatar_url IS 'Optional group avatar URL';

-- ============================================================================
-- STEP 2: Create conversation_participants table
-- ============================================================================

CREATE TABLE workspace_conversation_participants (
  conversation_id UUID NOT NULL REFERENCES workspace_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('creator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  PRIMARY KEY (conversation_id, user_id)
);

-- Add indexes for performance
CREATE INDEX idx_conversation_participants_user_id ON workspace_conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation_id ON workspace_conversation_participants(conversation_id);

-- Add comments
COMMENT ON TABLE workspace_conversation_participants IS 'Tracks all participants in workspace conversations (both 1-on-1 and groups)';
COMMENT ON COLUMN workspace_conversation_participants.role IS 'Participant role: creator (can manage participants) or member';

-- ============================================================================
-- STEP 3: Migrate existing 1-on-1 conversations to participants table
-- ============================================================================

-- Insert participants for all existing 1-on-1 conversations
INSERT INTO workspace_conversation_participants (conversation_id, user_id, role, joined_at)
SELECT
  id AS conversation_id,
  participant_1_id AS user_id,
  'member' AS role,
  created_at AS joined_at
FROM workspace_conversations
WHERE participant_1_id IS NOT NULL

UNION ALL

SELECT
  id AS conversation_id,
  participant_2_id AS user_id,
  'member' AS role,
  created_at AS joined_at
FROM workspace_conversations
WHERE participant_2_id IS NOT NULL;

-- ============================================================================
-- STEP 4: Create helper functions
-- ============================================================================

-- Function: Create a new group conversation
CREATE OR REPLACE FUNCTION create_group_conversation(
  p_workspace_id UUID,
  p_name TEXT,
  p_creator_id UUID,
  p_participant_ids UUID[]
)
RETURNS workspace_conversations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conversation workspace_conversations;
  v_participant_id UUID;
BEGIN
  -- Validate inputs
  IF p_name IS NULL OR LENGTH(TRIM(p_name)) = 0 THEN
    RAISE EXCEPTION 'Group name is required';
  END IF;

  IF array_length(p_participant_ids, 1) < 2 THEN
    RAISE EXCEPTION 'Group must have at least 2 participants (excluding creator)';
  END IF;

  -- Check if creator is in the workspace
  IF NOT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = p_workspace_id AND workspace_member_id = p_creator_id
  ) THEN
    RAISE EXCEPTION 'Creator must be a member of the workspace';
  END IF;

  -- Create the conversation
  INSERT INTO workspace_conversations (workspace_id, is_group, name, created_by)
  VALUES (p_workspace_id, TRUE, TRIM(p_name), p_creator_id)
  RETURNING * INTO v_conversation;

  -- Add creator as participant with 'creator' role
  INSERT INTO workspace_conversation_participants (conversation_id, user_id, role)
  VALUES (v_conversation.id, p_creator_id, 'creator');

  -- Add other participants as 'member' role
  FOREACH v_participant_id IN ARRAY p_participant_ids
  LOOP
    -- Skip if participant is the creator (already added)
    IF v_participant_id != p_creator_id THEN
      -- Verify participant is in workspace
      IF EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_id = p_workspace_id AND workspace_member_id = v_participant_id
      ) THEN
        INSERT INTO workspace_conversation_participants (conversation_id, user_id, role)
        VALUES (v_conversation.id, v_participant_id, 'member')
        ON CONFLICT (conversation_id, user_id) DO NOTHING;
      END IF;
    END IF;
  END LOOP;

  RETURN v_conversation;
END;
$$;

COMMENT ON FUNCTION create_group_conversation IS 'Creates a new group conversation with specified participants';

-- Function: Add participant to conversation
CREATE OR REPLACE FUNCTION add_participant_to_conversation(
  p_conversation_id UUID,
  p_user_id UUID,
  p_added_by UUID
)
RETURNS workspace_conversation_participants
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_participant workspace_conversation_participants;
  v_is_creator BOOLEAN;
BEGIN
  -- Check if the person adding is the creator
  SELECT (role = 'creator') INTO v_is_creator
  FROM workspace_conversation_participants
  WHERE conversation_id = p_conversation_id AND user_id = p_added_by;

  IF v_is_creator IS NULL THEN
    RAISE EXCEPTION 'User is not a participant in this conversation';
  END IF;

  IF v_is_creator = FALSE THEN
    RAISE EXCEPTION 'Only the group creator can add participants';
  END IF;

  -- Verify conversation is a group
  IF NOT EXISTS (
    SELECT 1 FROM workspace_conversations
    WHERE id = p_conversation_id AND is_group = TRUE
  ) THEN
    RAISE EXCEPTION 'Cannot add participants to 1-on-1 conversations';
  END IF;

  -- Add the participant
  INSERT INTO workspace_conversation_participants (conversation_id, user_id, role)
  VALUES (p_conversation_id, p_user_id, 'member')
  ON CONFLICT (conversation_id, user_id) DO NOTHING
  RETURNING * INTO v_participant;

  RETURN v_participant;
END;
$$;

COMMENT ON FUNCTION add_participant_to_conversation IS 'Adds a participant to a group conversation (creator only)';

-- Function: Remove participant from conversation
CREATE OR REPLACE FUNCTION remove_participant_from_conversation(
  p_conversation_id UUID,
  p_user_id UUID,
  p_removed_by UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_creator BOOLEAN;
  v_target_is_creator BOOLEAN;
BEGIN
  -- Check if target user is the creator
  SELECT (role = 'creator') INTO v_target_is_creator
  FROM workspace_conversation_participants
  WHERE conversation_id = p_conversation_id AND user_id = p_user_id;

  IF v_target_is_creator THEN
    RAISE EXCEPTION 'Cannot remove the group creator';
  END IF;

  -- If removing self, allow
  IF p_user_id = p_removed_by THEN
    DELETE FROM workspace_conversation_participants
    WHERE conversation_id = p_conversation_id AND user_id = p_user_id;
    RETURN TRUE;
  END IF;

  -- Otherwise, check if remover is the creator
  SELECT (role = 'creator') INTO v_is_creator
  FROM workspace_conversation_participants
  WHERE conversation_id = p_conversation_id AND user_id = p_removed_by;

  IF v_is_creator IS NULL THEN
    RAISE EXCEPTION 'User is not a participant in this conversation';
  END IF;

  IF v_is_creator = FALSE THEN
    RAISE EXCEPTION 'Only the group creator can remove participants';
  END IF;

  -- Remove the participant
  DELETE FROM workspace_conversation_participants
  WHERE conversation_id = p_conversation_id AND user_id = p_user_id;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION remove_participant_from_conversation IS 'Removes a participant from a group conversation (creator only, or self-removal)';

-- Function: Get conversation participants
CREATE OR REPLACE FUNCTION get_conversation_participants(p_conversation_id UUID)
RETURNS TABLE (
  user_id UUID,
  role TEXT,
  joined_at TIMESTAMPTZ,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.user_id,
    p.role,
    p.joined_at,
    up.full_name,
    up.email,
    up.avatar_url
  FROM workspace_conversation_participants p
  JOIN user_profiles up ON up.id = p.user_id
  WHERE p.conversation_id = p_conversation_id
  ORDER BY
    CASE WHEN p.role = 'creator' THEN 0 ELSE 1 END,
    p.joined_at ASC;
END;
$$;

COMMENT ON FUNCTION get_conversation_participants IS 'Gets all participants in a conversation with their profile info';

-- Update get_unread_count to work with participants table
CREATE OR REPLACE FUNCTION get_unread_count(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_unread_count INTEGER;
BEGIN
  -- Count messages in conversation that user hasn't read (excluding own messages)
  SELECT COUNT(*)::INTEGER INTO v_unread_count
  FROM workspace_messages m
  WHERE m.conversation_id = p_conversation_id
    AND m.sender_id != p_user_id
    AND NOT EXISTS (
      SELECT 1
      FROM workspace_message_receipts r
      WHERE r.message_id = m.id AND r.user_id = p_user_id
    );

  RETURN COALESCE(v_unread_count, 0);
END;
$$;

-- Helper function to check participation without RLS recursion
CREATE OR REPLACE FUNCTION is_conversation_participant(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM workspace_conversation_participants
    WHERE conversation_id = p_conversation_id
      AND user_id = p_user_id
  );
$$;

COMMENT ON FUNCTION is_conversation_participant IS 'Helper function to check if user is a participant without RLS recursion';

-- Update get_or_create_conversation to work with participants table
DROP FUNCTION IF EXISTS get_or_create_conversation(UUID, UUID, UUID);

CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_workspace_id UUID,
  p_user_1_id UUID,
  p_user_2_id UUID
) RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_participant_1 UUID;
  v_participant_2 UUID;
  v_is_new BOOLEAN := FALSE;
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
    v_is_new := TRUE;

    INSERT INTO workspace_conversations (
      workspace_id,
      participant_1_id,
      participant_2_id,
      is_group,
      name,
      created_by,
      avatar_url
    ) VALUES (
      p_workspace_id,
      v_participant_1,
      v_participant_2,
      FALSE,
      NULL,
      NULL,
      NULL
    )
    RETURNING id INTO v_conversation_id;

    -- Create participant records for both users
    INSERT INTO workspace_conversation_participants (conversation_id, user_id, role)
    VALUES
      (v_conversation_id, v_participant_1, 'member'),
      (v_conversation_id, v_participant_2, 'member');
  END IF;

  -- For existing conversations, ensure participants exist (migration safety)
  IF NOT v_is_new THEN
    INSERT INTO workspace_conversation_participants (conversation_id, user_id, role)
    VALUES
      (v_conversation_id, v_participant_1, 'member'),
      (v_conversation_id, v_participant_2, 'member')
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
  END IF;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_or_create_conversation IS 'Get existing or create new 1-on-1 conversation with participant records';

-- ============================================================================
-- STEP 5: Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on participants table
ALTER TABLE workspace_conversation_participants ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view participants using helper function (prevents infinite recursion)
CREATE POLICY "Users can view conversation participants"
  ON workspace_conversation_participants
  FOR SELECT
  USING (
    is_conversation_participant(conversation_id, auth.uid())
  );

-- Policy: Allow inserts (permission checked in function)
CREATE POLICY "Allow participant inserts via function"
  ON workspace_conversation_participants
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow deletes (permission checked in function)
CREATE POLICY "Allow participant deletes via function"
  ON workspace_conversation_participants
  FOR DELETE
  USING (true);

-- Update existing conversation policies to use participants table
DROP POLICY IF EXISTS "Users can view their workspace conversations" ON workspace_conversations;
CREATE POLICY "Users can view their workspace conversations"
  ON workspace_conversations
  FOR SELECT
  USING (
    is_conversation_participant(id, auth.uid())
  );

-- ============================================================================
-- STEP 6: Triggers
-- ============================================================================

-- Trigger: Prevent creator from being removed
CREATE OR REPLACE FUNCTION prevent_creator_removal()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.role = 'creator' THEN
    RAISE EXCEPTION 'Cannot remove the group creator from the conversation';
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trigger_prevent_creator_removal
  BEFORE DELETE ON workspace_conversation_participants
  FOR EACH ROW
  EXECUTE FUNCTION prevent_creator_removal();

-- ============================================================================
-- STEP 7: Grant permissions
-- ============================================================================

GRANT SELECT, INSERT, DELETE ON workspace_conversation_participants TO authenticated;
GRANT EXECUTE ON FUNCTION create_group_conversation TO authenticated;
GRANT EXECUTE ON FUNCTION add_participant_to_conversation TO authenticated;
GRANT EXECUTE ON FUNCTION remove_participant_from_conversation TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_participants TO authenticated;

-- ============================================================================
-- Migration Complete
-- ============================================================================

COMMENT ON TABLE workspace_conversations IS 'Stores both 1-on-1 and group conversations in workspaces';
