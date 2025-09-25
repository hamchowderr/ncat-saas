-- Migration 19: Table Ownership & Permissions
-- Sets table ownership to postgres and grants necessary permissions

-- Set Table Ownership
ALTER TABLE "public"."user_profiles" OWNER TO "postgres";
ALTER TABLE "public"."user_settings" OWNER TO "postgres";
ALTER TABLE "public"."user_application_settings" OWNER TO "postgres";
ALTER TABLE "public"."user_roles" OWNER TO "postgres";
ALTER TABLE "public"."user_api_keys" OWNER TO "postgres";
ALTER TABLE "public"."user_notifications" OWNER TO "postgres";
ALTER TABLE "public"."account_delete_tokens" OWNER TO "postgres";
ALTER TABLE "public"."files" OWNER TO "postgres";
ALTER TABLE "public"."projects" OWNER TO "postgres";
ALTER TABLE "public"."project_comments" OWNER TO "postgres";
ALTER TABLE "public"."chats" OWNER TO "postgres";
ALTER TABLE "public"."marketing_author_profiles" OWNER TO "postgres";
ALTER TABLE "public"."marketing_tags" OWNER TO "postgres";
ALTER TABLE "public"."marketing_blog_posts" OWNER TO "postgres";
ALTER TABLE "public"."marketing_blog_post_tags_relationship" OWNER TO "postgres";
ALTER TABLE "public"."marketing_blog_author_posts" OWNER TO "postgres";
ALTER TABLE "public"."marketing_changelog" OWNER TO "postgres";
ALTER TABLE "public"."marketing_changelog_author_relationship" OWNER TO "postgres";
ALTER TABLE "public"."marketing_feedback_threads" OWNER TO "postgres";
ALTER TABLE "public"."marketing_feedback_comments" OWNER TO "postgres";
ALTER TABLE public.marketing_feedback_boards OWNER TO postgres;
ALTER TABLE public.marketing_feedback_thread_reactions OWNER TO postgres;
ALTER TABLE public.marketing_feedback_comment_reactions OWNER TO postgres;
ALTER TABLE public.marketing_feedback_board_subscriptions OWNER TO postgres;
ALTER TABLE public.marketing_feedback_thread_subscriptions OWNER TO postgres;
ALTER TABLE "public"."app_settings" OWNER TO "postgres";

-- Grant Core Table Permissions
GRANT ALL ON TABLE public.files TO authenticated;

-- Grant Billing Table Permissions
GRANT SELECT ON TABLE public.billing_products TO authenticated;
GRANT SELECT ON TABLE public.billing_prices TO authenticated;
GRANT SELECT ON TABLE public.billing_volume_tiers TO authenticated;
GRANT SELECT ON TABLE public.billing_customers TO authenticated;
GRANT SELECT ON TABLE public.billing_subscriptions TO authenticated;
GRANT SELECT ON TABLE public.billing_one_time_payments TO authenticated;
GRANT SELECT ON TABLE public.billing_payment_methods TO authenticated;
GRANT SELECT ON TABLE public.billing_invoices TO authenticated;
GRANT SELECT ON TABLE public.billing_usage_logs TO authenticated;
