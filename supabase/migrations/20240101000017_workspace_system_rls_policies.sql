-- Migration 17: Workspace System RLS Policies
-- Creates comprehensive RLS policies for workspace-related tables

-- Workspace Creation Policy
CREATE POLICY "All authenticated users can create workspaces" ON "public"."workspaces" FOR
INSERT TO "authenticated" WITH CHECK (TRUE);

-- Workspace Access Policies
CREATE POLICY "Workspace members can read their workspaces" ON "public"."workspaces" FOR
SELECT TO authenticated USING (
    "public"."is_workspace_member"(
        (
            SELECT auth.uid()
        ),
        id
    )
);

CREATE POLICY "Workspace members can update their workspaces" ON "public"."workspaces" FOR
UPDATE TO authenticated USING (
    "public"."is_workspace_member" (
        (
            SELECT auth.uid()
        ),
        id
    )
);

-- Workspace Settings Policies
CREATE POLICY "Workspace members can access settings" ON "public"."workspace_settings" FOR ALL TO authenticated USING (
    "public"."is_workspace_member" (
        (
            SELECT auth.uid()
        ),
        workspace_id
    )
);

-- Workspace Admin Settings Policies
CREATE POLICY "Workspace admins can access settings" ON "public"."workspace_admin_settings" FOR ALL TO authenticated USING (
    "public"."is_workspace_admin" (
        (
            SELECT auth.uid()
        ),
        workspace_id
    )
);

-- Workspace Application Settings Policies
CREATE POLICY "Workspace members can access settings" ON "public"."workspace_application_settings" FOR ALL TO authenticated USING (
    "public"."is_workspace_member" (
        (
            SELECT auth.uid()
        ),
        workspace_id
    )
);

-- Workspace Team Members Policies
CREATE POLICY "Workspace members can read team members" ON "public"."workspace_members" FOR
SELECT TO authenticated USING (
    "public"."is_workspace_member" (
        (
            SELECT auth.uid()
        ),
        workspace_id
    )
);

CREATE POLICY "Workspace admins can manage team members" ON "public"."workspace_members" FOR ALL TO authenticated USING (
    "public"."is_workspace_admin" (
        (
            SELECT auth.uid()
        ),
        workspace_id
    )
);

CREATE POLICY "Workspace members can delete themselves" ON "public"."workspace_members" FOR DELETE TO authenticated USING (
    workspace_member_id = (
        SELECT auth.uid()
    )
);

-- Workspace Credits Policies
CREATE POLICY "Workspace members can view credits" ON "public"."workspace_credits" FOR
SELECT TO authenticated USING (
    "public"."is_workspace_member"(
        (
            SELECT auth.uid()
        ),
        workspace_id
    )
);

CREATE POLICY "Workspace admins can view credit logs" ON "public"."workspace_credits_logs" FOR
SELECT TO authenticated USING (
    "public"."is_workspace_admin"(
        (
            SELECT auth.uid()
        ),
        workspace_id
    )
);

-- Workspace Invitations Policies
CREATE POLICY "Workspace admins can manage invitations" ON "public"."workspace_invitations" FOR ALL TO authenticated USING (
    "public"."is_workspace_admin" (
        (
            SELECT auth.uid()
        ),
        workspace_id
    )
);

CREATE POLICY "Invitees can view their invitations" ON "public"."workspace_invitations" FOR
SELECT TO authenticated USING (
    invitee_user_id = (
        SELECT auth.uid()
    )
);
