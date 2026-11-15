-- ==============================================
-- SEED FILE 02: WORKSPACES AND MEMBERSHIPS
-- ==============================================
-- Creates workspaces and workspace memberships for testing scenarios:
-- 1. Solo's Personal Workspace (solo user only)
-- 2. Team Collaboration Workspace (owner, member, readonly)
-- 3. Admin's Multi-Workspace Access (admin user in all 3 workspaces)
--
-- IMPORTANT: handle_new_user trigger creates workspaces automatically
-- We use the trigger-created workspaces (workspace.id = user.id) for primary workspaces
--
-- Tests:
-- - Solo workspace (single user)
-- - Team collaboration (multiple users with different roles)
-- - Multi-workspace access (admin user can switch workspaces)
-- ==============================================

-- ==============================================
-- STEP 1: UPDATE TRIGGER-CREATED WORKSPACES
-- ==============================================
-- The handle_new_user trigger created workspaces with workspace.id = user.id
-- Update these to have proper names

-- Admin's Workspace (trigger-created, just update name)
-- Note: Renamed to avoid onboarding trigger - doesn't end with "'s Workspace"
UPDATE public.workspaces
SET name = 'Admin HQ', slug = 'admin-workspace'
WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;

-- Solo's Workspace (trigger-created, just update name)
-- Note: Renamed to avoid onboarding trigger - doesn't end with "'s Workspace"
UPDATE public.workspaces
SET name = 'Solo Studio', slug = 'solo-workspace'
WHERE id = '00000000-0000-0000-0000-000000000002'::uuid;

-- Team Owner's Workspace (trigger-created, just update name)
-- Note: Custom name that clearly indicates it's properly set up
UPDATE public.workspaces
SET name = 'Team Collaboration Hub', slug = 'team-workspace'
WHERE id = '00000000-0000-0000-0000-000000000003'::uuid;

-- Member's personal workspace
UPDATE public.workspaces
SET name = 'Member Projects', slug = 'member-workspace'
WHERE id = '00000000-0000-0000-0000-000000000004'::uuid;

-- Readonly's personal workspace
UPDATE public.workspaces
SET name = 'Readonly Archive', slug = 'readonly-workspace'
WHERE id = '00000000-0000-0000-0000-000000000005'::uuid;

-- ==============================================
-- STEP 2: ADDITIONAL WORKSPACE MEMBERSHIPS
-- ==============================================
-- The trigger already created owner memberships for each user
-- Add additional memberships for testing multi-user scenarios

-- NOTE: Admin is intentionally NOT added to other workspaces
-- They will use admin impersonation to view other workspaces (not as a member)

-- Team Member added to Team workspace
INSERT INTO public.workspace_members (
    id, workspace_id, workspace_member_id, workspace_member_role, added_at
) VALUES (
    '00000000-0000-0000-0000-000000000105'::uuid,
    '00000000-0000-0000-0000-000000000003'::uuid, -- Team workspace
    '00000000-0000-0000-0000-000000000004'::uuid, -- Team Member user
    'member',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Team Readonly added to Team workspace
INSERT INTO public.workspace_members (
    id, workspace_id, workspace_member_id, workspace_member_role, added_at
) VALUES (
    '00000000-0000-0000-0000-000000000106'::uuid,
    '00000000-0000-0000-0000-000000000003'::uuid, -- Team workspace
    '00000000-0000-0000-0000-000000000005'::uuid, -- Team Readonly user
    'readonly',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- SUMMARY
-- ==============================================
-- Workspace 1: Admin HQ (ID = 00000000-0000-0000-0000-000000000001)
--   - Admin User (owner) - created by trigger
--
-- Workspace 2: Solo Studio (ID = 00000000-0000-0000-0000-000000000002)
--   - Solo User (owner) - created by trigger
--
-- Workspace 3: Team Collaboration Hub (ID = 00000000-0000-0000-0000-000000000003)
--   - Team Owner (owner) - created by trigger
--   - Team Member (member) - added here
--   - Team Readonly (readonly) - added here
--
-- Workspace 4: Member Projects (ID = 00000000-0000-0000-0000-000000000004)
--   - Team Member (owner) - created by trigger
--
-- Workspace 5: Readonly Archive (ID = 00000000-0000-0000-0000-000000000005)
--   - Team Readonly (owner) - created by trigger
--
-- Admin User Testing:
--   - Admin is ONLY a member of "Admin HQ" (workspace 1)
--   - Admin views other workspaces via impersonation (not as a member)
--   - This tests the admin impersonation feature properly
--
-- Total workspaces: 5 (all created by trigger, we just update names)
-- Total additional memberships: 2 (trigger creates 5, we add 2 more)
-- ==============================================
