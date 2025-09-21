-- Migration 21: Realtime Publications
-- Enables realtime subscriptions for specific tables

-- Enable realtime for user notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;

-- Enable realtime for project comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_comments;

-- Enable realtime for chat messages (if needed for live chat)
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;

-- Enable realtime for workspace invitations
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_invitations;
