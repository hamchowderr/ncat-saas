-- Migration 2: Enum Type Definitions
-- Define all custom enum types used throughout the application

-- Application Role Enum
CREATE TYPE "public"."app_role" AS ENUM ('admin');

-- Blog Post Status Enum
CREATE TYPE "public"."marketing_blog_post_status" AS ENUM ('draft', 'published');

-- Feedback Thread Priority Enum
CREATE TYPE "public"."marketing_feedback_thread_priority" AS ENUM ('low', 'medium', 'high');

-- Feedback Thread Status Enum
CREATE TYPE "public"."marketing_feedback_thread_status" AS ENUM (
'open',
'under_review',
'planned',
'closed',
'in_progress',
'completed',
'moderator_hold'
);

-- Feedback Moderator Hold Category Enum
CREATE TYPE public.marketing_feedback_moderator_hold_category AS ENUM ('spam', 'off_topic', 'inappropriate', 'other');

-- Feedback Thread Type Enum
CREATE TYPE "public"."marketing_feedback_thread_type" AS ENUM ('bug', 'feature_request', 'general');

-- Organization Joining Status Enum
CREATE TYPE "public"."organization_joining_status" AS ENUM (
'invited',
'joinied',
'declined_invitation',
'joined'
);

-- Organization Member Role Enum
CREATE TYPE "public"."organization_member_role" AS ENUM ('owner', 'admin', 'member', 'readonly');

-- Pricing Plan Interval Enum
CREATE TYPE "public"."pricing_plan_interval" AS ENUM ('day', 'week', 'month', 'year');

-- Pricing Type Enum
CREATE TYPE "public"."pricing_type" AS ENUM ('one_time', 'recurring');

-- Project Status Enum
CREATE TYPE "public"."project_status" AS ENUM (
'draft',
'pending_approval',
'approved',
'completed'
);

-- Project Team Member Role Enum
CREATE TYPE "public"."project_team_member_role" AS ENUM ('admin', 'member', 'readonly');

-- Subscription Status Enum
CREATE TYPE "public"."subscription_status" AS ENUM (
'trialing',
'active',
'canceled',
'incomplete',
'incomplete_expired',
'past_due',
'unpaid',
'paused'
);

-- Workspace Member Role Type Enum
CREATE TYPE public.workspace_member_role_type AS ENUM('owner', 'admin', 'member', 'readonly');

-- Workspace Invitation Link Status Enum
CREATE TYPE public.workspace_invitation_link_status AS ENUM(
'active',
'finished_accepted',
'finished_declined',
'inactive'
);

-- Workspace Membership Type Enum
CREATE TYPE public.workspace_membership_type AS ENUM ('solo', 'team');

-- Marketing Changelog Status Enum
CREATE TYPE public.marketing_changelog_status AS ENUM ('draft', 'published');

-- Marketing Feedback Reaction Type Enum
CREATE TYPE public.marketing_feedback_reaction_type AS ENUM ('like', 'heart', 'celebrate', 'upvote');
