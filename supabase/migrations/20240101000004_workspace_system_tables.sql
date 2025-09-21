-- Migration 4: Workspace System Tables
-- Create workspace-related tables for multi-tenant workspace management

-- Workspaces Table
CREATE TABLE IF NOT EXISTS public.workspaces (
id UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
slug character varying DEFAULT ("gen_random_uuid"())::"text" UNIQUE NOT NULL,
name character varying NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Workspace Settings Table
CREATE TABLE IF NOT EXISTS public.workspace_settings (
workspace_id UUID PRIMARY KEY NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
workspace_settings JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Workspace Admin Settings Table
CREATE TABLE IF NOT EXISTS public.workspace_admin_settings (
workspace_id UUID PRIMARY KEY NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
workspace_settings JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Workspace Application Settings Table
CREATE TABLE IF NOT EXISTS public.workspace_application_settings (
workspace_id UUID PRIMARY KEY NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
membership_type "public"."workspace_membership_type" DEFAULT 'solo' NOT NULL
);

-- Workspace Members Table
CREATE TABLE IF NOT EXISTS public.workspace_members (
id UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
workspace_id UUID NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
workspace_member_id UUID NOT NULL REFERENCES public.user_profiles (id) ON DELETE CASCADE,
workspace_member_role public.workspace_member_role_type NOT NULL,
added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Workspace Invitations Table
CREATE TABLE IF NOT EXISTS public.workspace_invitations (
id UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
inviter_user_id UUID NOT NULL REFERENCES public.user_profiles (id) ON DELETE CASCADE,
STATUS public.workspace_invitation_link_status DEFAULT 'active' NOT NULL,
invitee_user_email TEXT NOT NULL,
workspace_id UUID NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
invitee_user_role public.workspace_member_role_type DEFAULT 'member' NOT NULL,
invitee_user_id UUID REFERENCES public.user_profiles (id) ON DELETE CASCADE
);

-- Workspace Credits Table
CREATE TABLE IF NOT EXISTS public.workspace_credits (
id UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
workspace_id UUID NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
credits INT NOT NULL DEFAULT 12,
last_reset_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workspace Credits Logs Table
CREATE TABLE IF NOT EXISTS public.workspace_credits_logs (
id UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
workspace_credits_id UUID NOT NULL REFERENCES public.workspace_credits (id) ON DELETE CASCADE,
workspace_id UUID NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
change_type TEXT NOT NULL,
changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
old_credits INT,
new_credits INT
);
