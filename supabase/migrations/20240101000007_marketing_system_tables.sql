-- Migration 7: Marketing System Tables
-- Create marketing-related tables for blog posts, authors, tags, and changelog

-- Marketing Author Profiles Table
CREATE TABLE IF NOT EXISTS "public"."marketing_author_profiles" (
"id" "uuid" PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
"slug" "text" UNIQUE NOT NULL,
"display_name" character varying(255) NOT NULL,
"bio" "text" NOT NULL,
"avatar_url" character varying(255) NOT NULL,
"website_url" character varying(255),
"twitter_handle" character varying(255),
"facebook_handle" character varying(255),
"linkedin_handle" character varying(255),
"instagram_handle" character varying(255),
"created_at" timestamp WITH time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
"updated_at" timestamp WITH time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Marketing Tags Table
CREATE TABLE IF NOT EXISTS "public"."marketing_tags" (
"id" "uuid" PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
"slug" "text" UNIQUE NOT NULL,
"name" "text" NOT NULL,
"description" "text"
);

-- Marketing Blog Posts Table
CREATE TABLE IF NOT EXISTS "public"."marketing_blog_posts" (
"id" "uuid" PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
"slug" character varying(255) UNIQUE NOT NULL,
"title" character varying(255) NOT NULL,
"summary" "text" NOT NULL,
"content" "text" NOT NULL,
"created_at" timestamp WITH time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
"updated_at" timestamp WITH time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
"is_featured" boolean DEFAULT false NOT NULL,
"status" "public"."marketing_blog_post_status" DEFAULT 'draft'::"public"."marketing_blog_post_status" NOT NULL,
"cover_image" character varying(255),
"seo_data" "jsonb",
"json_content" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);

-- Marketing Blog Post Tags Relationship Table
CREATE TABLE IF NOT EXISTS "public"."marketing_blog_post_tags_relationship" (
"blog_post_id" "uuid" NOT NULL REFERENCES "public"."marketing_blog_posts"("id") ON DELETE CASCADE,
"tag_id" "uuid" NOT NULL REFERENCES "public"."marketing_tags"("id") ON DELETE CASCADE
);

-- Marketing Blog Author Posts Table
CREATE TABLE IF NOT EXISTS "public"."marketing_blog_author_posts" (
"author_id" "uuid" NOT NULL REFERENCES "public"."marketing_author_profiles"("id") ON DELETE CASCADE,
"post_id" "uuid" NOT NULL REFERENCES "public"."marketing_blog_posts"("id") ON DELETE CASCADE
);

-- Marketing Changelog Table
CREATE TABLE IF NOT EXISTS "public"."marketing_changelog" (
"id" "uuid" PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
"title" character varying(255) NOT NULL,
"json_content" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
"created_at" timestamp WITH time zone DEFAULT CURRENT_TIMESTAMP,
"updated_at" timestamp WITH time zone DEFAULT CURRENT_TIMESTAMP,
"cover_image" "text",
"status" "public"."marketing_changelog_status" DEFAULT 'draft'::"public"."marketing_changelog_status" NOT NULL
);

-- Marketing Changelog Author Relationship Table
CREATE TABLE IF NOT EXISTS "public"."marketing_changelog_author_relationship" (
"author_id" "uuid" NOT NULL REFERENCES "public"."marketing_author_profiles"("id") ON DELETE CASCADE,
"changelog_id" "uuid" NOT NULL REFERENCES "public"."marketing_changelog"("id") ON DELETE CASCADE
);
