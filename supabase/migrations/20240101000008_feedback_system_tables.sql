-- Migration 8: Feedback System Tables
-- Create feedback-related tables for user feedback, comments, boards, and reactions

-- Marketing Feedback Threads Table
CREATE TABLE IF NOT EXISTS "public"."marketing_feedback_threads" (
"id" "uuid" PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
"title" character varying(255) NOT NULL,
"content" "text" NOT NULL,
"user_id" "uuid" NOT NULL REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE,
"created_at" timestamp WITH time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
"updated_at" timestamp WITH time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
"priority" "public"."marketing_feedback_thread_priority" DEFAULT 'low'::"public"."marketing_feedback_thread_priority" NOT NULL,
"type" "public"."marketing_feedback_thread_type" DEFAULT 'general'::"public"."marketing_feedback_thread_type" NOT NULL,
"status" "public"."marketing_feedback_thread_status" DEFAULT 'open'::"public"."marketing_feedback_thread_status" NOT NULL,
"added_to_roadmap" boolean DEFAULT false NOT NULL,
"open_for_public_discussion" boolean DEFAULT false NOT NULL,
"is_publicly_visible" boolean DEFAULT false NOT NULL,
"moderator_hold_category" "public"."marketing_feedback_moderator_hold_category" DEFAULT NULL
);

-- Marketing Feedback Comments Table
CREATE TABLE IF NOT EXISTS "public"."marketing_feedback_comments" (
"id" "uuid" PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
"user_id" "uuid" NOT NULL REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE,
"thread_id" "uuid" NOT NULL REFERENCES "public"."marketing_feedback_threads"("id") ON DELETE CASCADE,
"content" "text" NOT NULL,
"created_at" timestamp WITH time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
"updated_at" timestamp WITH time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
"moderator_hold_category" "public"."marketing_feedback_moderator_hold_category" DEFAULT NULL
);

-- Marketing Feedback Boards Table
CREATE TABLE IF NOT EXISTS public.marketing_feedback_boards (
id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4() NOT NULL,
slug TEXT UNIQUE NOT NULL,
title TEXT NOT NULL,
description TEXT,
is_active BOOLEAN DEFAULT TRUE NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
created_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
settings JSONB DEFAULT '{}'::jsonb NOT NULL,
color TEXT DEFAULT NULL
);

-- Marketing Feedback Thread Reactions Table
CREATE TABLE IF NOT EXISTS public.marketing_feedback_thread_reactions (
id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4() NOT NULL,
thread_id UUID NOT NULL REFERENCES public.marketing_feedback_threads(id) ON DELETE CASCADE,
user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
reaction_type public.marketing_feedback_reaction_type NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Marketing Feedback Comment Reactions Table
CREATE TABLE IF NOT EXISTS public.marketing_feedback_comment_reactions (
id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4() NOT NULL,
comment_id UUID NOT NULL REFERENCES public.marketing_feedback_comments(id) ON DELETE CASCADE,
user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
reaction_type public.marketing_feedback_reaction_type NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Marketing Feedback Board Subscriptions Table
CREATE TABLE IF NOT EXISTS public.marketing_feedback_board_subscriptions (
id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4() NOT NULL,
user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
board_id UUID NOT NULL REFERENCES public.marketing_feedback_boards(id) ON DELETE CASCADE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Marketing Feedback Thread Subscriptions Table
CREATE TABLE IF NOT EXISTS public.marketing_feedback_thread_subscriptions (
id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4() NOT NULL,
user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
thread_id UUID NOT NULL REFERENCES public.marketing_feedback_threads(id) ON DELETE CASCADE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
