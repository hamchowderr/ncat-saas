-- Migration 3: User System Tables
-- Create core user-related tables for profiles, settings, roles, and notifications

-- User Profiles Table
CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
"id" "uuid" PRIMARY KEY NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
"full_name" character varying,
"avatar_url" character varying,
"created_at" timestamp WITH time zone DEFAULT "now"() NOT NULL
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS "public"."user_settings" (
"id" "uuid" PRIMARY KEY NOT NULL REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE,
"default_workspace" "uuid"
);

-- User Application Settings Table
CREATE TABLE IF NOT EXISTS "public"."user_application_settings" (
"id" "uuid" PRIMARY KEY NOT NULL REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE,
"email_readonly" character varying NOT NULL
);

-- User Roles Table
CREATE TABLE IF NOT EXISTS "public"."user_roles" (
"id" UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
"user_id" UUID NOT NULL REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE,
"role" "public"."app_role" NOT NULL
);

-- User API Keys Table
CREATE TABLE IF NOT EXISTS "public"."user_api_keys" (
"key_id" "text" PRIMARY KEY NOT NULL,
"masked_key" "text" NOT NULL,
"created_at" timestamp WITH time zone DEFAULT "now"() NOT NULL,
"user_id" "uuid" NOT NULL REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE,
"expires_at" timestamp WITH time zone,
"is_revoked" boolean DEFAULT false NOT NULL
);

-- User Notifications Table
CREATE TABLE IF NOT EXISTS "public"."user_notifications" (
"id" "uuid" PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
"user_id" "uuid" NOT NULL REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE,
"is_read" boolean DEFAULT false NOT NULL,
"is_seen" boolean DEFAULT false NOT NULL,
"payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
"created_at" timestamp WITH time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
"updated_at" timestamp WITH time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Account Delete Tokens Table
CREATE TABLE IF NOT EXISTS "public"."account_delete_tokens" (
"token" "uuid" PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
"user_id" "uuid" NOT NULL REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE
);
