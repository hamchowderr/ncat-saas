-- Enable real-time for workspace chat system
-- This allows messages, conversations, and receipts to update in real-time

-- Enable real-time for workspace messages (so new messages appear instantly)
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_messages;

-- Enable real-time for workspace conversations (so last_message updates instantly)
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_conversations;

-- Enable real-time for workspace message receipts (so unread counts update instantly)
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_message_receipts;

COMMENT ON TABLE workspace_messages IS 'Chat messages between workspace members (real-time enabled)';
COMMENT ON TABLE workspace_conversations IS 'Chat conversations between workspace members (real-time enabled)';
COMMENT ON TABLE workspace_message_receipts IS 'Track when users read messages (real-time enabled)';
