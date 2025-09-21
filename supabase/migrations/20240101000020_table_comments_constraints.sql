-- Migration 20: Table Comments & Constraints
-- Adds descriptive comments and constraints for data integrity

-- Add Table Comments
COMMENT ON TABLE "public"."user_profiles" IS 'Extended user profile information';
COMMENT ON TABLE "public"."user_settings" IS 'User-specific application settings';
COMMENT ON TABLE "public"."user_application_settings" IS 'User application preferences';
COMMENT ON TABLE "public"."user_roles" IS 'User role assignments for authorization';
COMMENT ON TABLE "public"."user_api_keys" IS 'User-generated API keys for external access';
COMMENT ON TABLE "public"."user_notifications" IS 'User notification messages and alerts';
COMMENT ON TABLE "public"."account_delete_tokens" IS 'Tokens for account deletion verification';
COMMENT ON TABLE "public"."projects" IS 'User projects and associated metadata';
COMMENT ON TABLE "public"."project_comments" IS 'Comments and discussions on projects';
COMMENT ON TABLE "public"."chats" IS 'AI chat conversations and history';
COMMENT ON TABLE "public"."marketing_author_profiles" IS 'Author profiles for blog content';
COMMENT ON TABLE "public"."marketing_tags" IS 'Content tags for categorization';
COMMENT ON TABLE "public"."marketing_blog_posts" IS 'Blog posts and articles';
COMMENT ON TABLE "public"."marketing_changelog" IS 'Product changelog entries';
COMMENT ON TABLE "public"."marketing_feedback_threads" IS 'User feedback and feature requests';
COMMENT ON TABLE "public"."marketing_feedback_comments" IS 'Comments on feedback threads';
COMMENT ON TABLE "public"."app_settings" IS 'Global application configuration';

-- Add Column Comments
COMMENT ON COLUMN "public"."user_profiles"."id" IS 'References auth.users.id';
COMMENT ON COLUMN "public"."user_profiles"."full_name" IS 'User display name';
COMMENT ON COLUMN "public"."user_profiles"."avatar_url" IS 'Profile picture URL';

-- Add Unique Constraints (key_id is already primary key, so no unique constraint needed)
ALTER TABLE "public"."marketing_tags" ADD CONSTRAINT "marketing_tags_slug_unique" UNIQUE ("slug");
ALTER TABLE "public"."marketing_author_profiles" ADD CONSTRAINT "marketing_author_profiles_slug_unique" UNIQUE ("slug");

-- Foreign key constraints are already defined in table creation migrations
