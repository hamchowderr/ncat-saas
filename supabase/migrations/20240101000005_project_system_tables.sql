-- Migration 5: Project System Tables
-- Create project-related tables for project management functionality

-- Projects Table
CREATE TABLE IF NOT EXISTS "public"."projects" (
"id" "uuid" PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
"name" "text" NOT NULL,
"created_at" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
"updated_at" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
"workspace_id" "uuid" NOT NULL REFERENCES "public"."workspaces"("id") ON DELETE CASCADE,
"project_status" "public"."project_status" DEFAULT 'draft'::"public"."project_status" NOT NULL,
"slug" character varying(255) DEFAULT ("gen_random_uuid"())::"text" UNIQUE NOT NULL
);

-- Project Comments Table
CREATE TABLE IF NOT EXISTS "public"."project_comments" (
"id" "uuid" PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
"created_at" timestamp WITH time zone DEFAULT "now"(),
"text" "text" NOT NULL,
"user_id" "uuid" NOT NULL REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE,
"in_reply_to" "uuid" REFERENCES "public"."project_comments"("id") ON DELETE SET NULL,
"project_id" "uuid" NOT NULL REFERENCES "public"."projects"("id") ON DELETE CASCADE
);
