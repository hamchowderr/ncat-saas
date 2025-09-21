-- Migration 13: Enable Row Level Security on All Tables
-- Enables RLS for security and data isolation across all application tables

-- User System RLS
ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_application_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_api_keys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."account_delete_tokens" ENABLE ROW LEVEL SECURITY;

-- Workspace System RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_application_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_credits_logs ENABLE ROW LEVEL SECURITY;

-- Project System RLS
ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."project_comments" ENABLE ROW LEVEL SECURITY;

-- AI/Chat System RLS
ALTER TABLE "public"."chats" ENABLE ROW LEVEL SECURITY;

-- Marketing System RLS
ALTER TABLE "public"."marketing_author_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."marketing_tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."marketing_blog_posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."marketing_blog_post_tags_relationship" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."marketing_blog_author_posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."marketing_changelog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."marketing_changelog_author_relationship" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."marketing_feedback_threads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."marketing_feedback_comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_feedback_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_feedback_thread_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_feedback_comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_feedback_board_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_feedback_thread_subscriptions ENABLE ROW LEVEL SECURITY;

-- Billing System RLS
ALTER TABLE public.billing_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_volume_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_one_time_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_payment_methods ENABLE ROW LEVEL SECURITY;

-- App Settings RLS
ALTER TABLE "public"."app_settings" ENABLE ROW LEVEL SECURITY;
