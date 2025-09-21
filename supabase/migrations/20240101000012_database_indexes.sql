-- Migration 12: All Database Indexes (Performance Critical)
-- Creates indexes for optimal query performance across all tables

-- User System Indexes
CREATE INDEX "idx_user_settings_default_workspace" ON "public"."user_settings" ("default_workspace");
CREATE INDEX "idx_user_application_settings_email_readonly" ON "public"."user_application_settings" ("email_readonly");
CREATE INDEX "idx_user_roles_user_id" ON "public"."user_roles" ("user_id");
CREATE INDEX "idx_user_api_keys_user_id" ON "public"."user_api_keys" ("user_id");
CREATE INDEX "idx_user_notifications_user_id" ON "public"."user_notifications" ("user_id");
CREATE INDEX "idx_account_delete_tokens_user_id" ON "public"."account_delete_tokens" ("user_id");

-- Workspace System Indexes
CREATE INDEX idx_workspace_settings_workspace_id ON public.workspace_settings(workspace_id);
CREATE INDEX idx_workspace_admin_settings_workspace_id ON public.workspace_admin_settings(workspace_id);
CREATE INDEX idx_workspace_application_settings_workspace_id ON public.workspace_application_settings(workspace_id);
CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_workspace_member_id ON public.workspace_members(workspace_member_id);
CREATE INDEX idx_workspace_invitations_workspace_id ON public.workspace_invitations(workspace_id);
CREATE INDEX idx_workspace_invitations_invitee_user_id ON public.workspace_invitations(invitee_user_id);
CREATE INDEX idx_workspace_invitations_inviter_user_id ON public.workspace_invitations(inviter_user_id);
CREATE INDEX idx_workspace_credits_workspace_id ON public.workspace_credits(workspace_id);
CREATE INDEX idx_workspace_credits_logs_workspace_id ON public.workspace_credits_logs(workspace_id);
CREATE INDEX idx_workspace_credits_logs_workspace_credits_id ON public.workspace_credits_logs(workspace_credits_id);

-- Project System Indexes
CREATE INDEX idx_projects_workspace_id ON public.projects(workspace_id);
CREATE INDEX idx_project_comments_project_id ON public.project_comments(project_id);

-- AI/Chat System Indexes
CREATE INDEX idx_chats_user_id ON public.chats(user_id);
CREATE INDEX idx_chats_project_id ON public.chats(project_id);

-- Marketing System Indexes
CREATE INDEX idx_marketing_blog_post_tags_relationship_blog_post_id ON public.marketing_blog_post_tags_relationship(blog_post_id);
CREATE INDEX idx_marketing_blog_post_tags_relationship_tag_id ON public.marketing_blog_post_tags_relationship(tag_id);
CREATE INDEX idx_marketing_blog_author_posts_author_id ON public.marketing_blog_author_posts(author_id);
CREATE INDEX idx_marketing_blog_author_posts_post_id ON public.marketing_blog_author_posts(post_id);
CREATE INDEX idx_marketing_changelog_author_relationship_author_id ON public.marketing_changelog_author_relationship(author_id);
CREATE INDEX idx_marketing_changelog_author_relationship_changelog_id ON public.marketing_changelog_author_relationship(changelog_id);

-- Feedback System Indexes
CREATE INDEX idx_marketing_feedback_threads_user_id ON public.marketing_feedback_threads(user_id);
CREATE INDEX idx_marketing_feedback_comments_user_id ON public.marketing_feedback_comments(user_id);
CREATE INDEX idx_marketing_feedback_comments_thread_id ON public.marketing_feedback_comments(thread_id);
CREATE INDEX idx_marketing_feedback_boards_created_by ON public.marketing_feedback_boards(created_by);
CREATE UNIQUE INDEX idx_unique_thread_user_reaction ON public.marketing_feedback_thread_reactions(thread_id, user_id, reaction_type);
CREATE INDEX idx_marketing_feedback_thread_reactions_thread_id ON public.marketing_feedback_thread_reactions(thread_id);
CREATE INDEX idx_marketing_feedback_thread_reactions_user_id ON public.marketing_feedback_thread_reactions(user_id);
CREATE UNIQUE INDEX idx_unique_comment_user_reaction ON public.marketing_feedback_comment_reactions(comment_id, user_id, reaction_type);
CREATE INDEX idx_marketing_feedback_comment_reactions_comment_id ON public.marketing_feedback_comment_reactions(comment_id);
CREATE INDEX idx_marketing_feedback_comment_reactions_user_id ON public.marketing_feedback_comment_reactions(user_id);
CREATE UNIQUE INDEX idx_unique_board_subscription ON public.marketing_feedback_board_subscriptions(user_id, board_id);
CREATE INDEX idx_marketing_feedback_board_subscriptions_user_id ON public.marketing_feedback_board_subscriptions(user_id);
CREATE INDEX idx_marketing_feedback_board_subscriptions_board_id ON public.marketing_feedback_board_subscriptions(board_id);
CREATE UNIQUE INDEX idx_unique_thread_subscription ON public.marketing_feedback_thread_subscriptions(user_id, thread_id);
CREATE INDEX idx_marketing_feedback_thread_subscriptions_user_id ON public.marketing_feedback_thread_subscriptions(user_id);
CREATE INDEX idx_marketing_feedback_thread_subscriptions_thread_id ON public.marketing_feedback_thread_subscriptions(thread_id);

-- Billing System Indexes
CREATE INDEX idx_billing_products_gateway_name ON public.billing_products(gateway_name);
CREATE INDEX idx_billing_products_gateway_product_id ON public.billing_products(gateway_product_id);
CREATE INDEX idx_billing_customers_workspace ON public.billing_customers(workspace_id);
CREATE INDEX idx_billing_invoices_gateway_customer_id ON public.billing_invoices(gateway_customer_id);
CREATE INDEX idx_billing_invoices_gateway_name ON public.billing_invoices(gateway_name);
CREATE INDEX idx_billing_invoices_product_id ON public.billing_invoices(gateway_product_id);
CREATE INDEX idx_billing_invoices_price_id ON public.billing_invoices(gateway_price_id);
CREATE INDEX idx_billing_subscriptions_customer_id ON public.billing_subscriptions(gateway_customer_id);
CREATE INDEX idx_billing_subscriptions_plan_id ON public.billing_subscriptions(gateway_product_id);
CREATE INDEX idx_billing_one_time_payments_customer_id ON public.billing_one_time_payments(gateway_customer_id);
CREATE INDEX idx_billing_one_time_payments_invoice_id ON public.billing_one_time_payments(gateway_invoice_id);
CREATE INDEX idx_billing_one_time_payments_product_id ON public.billing_one_time_payments(gateway_product_id);
CREATE INDEX idx_billing_one_time_payments_price_id ON public.billing_one_time_payments(gateway_price_id);
CREATE INDEX idx_billing_payment_methods_customer_id ON public.billing_payment_methods(gateway_customer_id);
CREATE INDEX idx_billing_payment_methods_payment_method_id ON public.billing_payment_methods(payment_method_id);
CREATE INDEX idx_billing_payment_methods_payment_method_type ON public.billing_payment_methods(payment_method_type);
CREATE INDEX idx_billing_usage_logs_gateway_customer_id ON public.billing_usage_logs(gateway_customer_id);
