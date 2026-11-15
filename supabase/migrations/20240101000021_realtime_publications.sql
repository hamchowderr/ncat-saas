-- Migration 21: Realtime Publications
-- Enables realtime subscriptions for specific tables

-- Enable realtime for user notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;

-- Enable realtime for project comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_comments;

-- Enable realtime for Mastra AI chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.mastra_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mastra_threads;

-- Enable realtime for workspace invitations
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_invitations;
