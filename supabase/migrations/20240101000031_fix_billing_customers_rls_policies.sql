-- Migration 31: Fix Billing Customers RLS Policies
-- Add missing RLS policies for billing_customers table to allow authenticated users to manage their own records

-- Allow authenticated users to view their own billing customer records
CREATE POLICY "Users can view their own billing customer records" ON "public"."billing_customers"
    FOR SELECT TO authenticated
    USING (
        workspace_id IN (
            SELECT w.id FROM workspaces w
            INNER JOIN workspace_members wm ON w.id = wm.workspace_id
            WHERE wm.workspace_member_id = auth.uid()
        )
    );

-- Allow authenticated users to insert billing customer records for their own workspace
CREATE POLICY "Users can insert billing customer records for their workspace" ON "public"."billing_customers"
    FOR INSERT TO authenticated
    WITH CHECK (
        workspace_id IN (
            SELECT w.id FROM workspaces w
            INNER JOIN workspace_members wm ON w.id = wm.workspace_id
            WHERE wm.workspace_member_id = auth.uid()
        )
    );

-- Allow authenticated users to update their own billing customer records
CREATE POLICY "Users can update their own billing customer records" ON "public"."billing_customers"
    FOR UPDATE TO authenticated
    USING (
        workspace_id IN (
            SELECT w.id FROM workspaces w
            INNER JOIN workspace_members wm ON w.id = wm.workspace_id
            WHERE wm.workspace_member_id = auth.uid()
        )
    )
    WITH CHECK (
        workspace_id IN (
            SELECT w.id FROM workspaces w
            INNER JOIN workspace_members wm ON w.id = wm.workspace_id
            WHERE wm.workspace_member_id = auth.uid()
        )
    );

-- Allow service role (for triggers and Edge Functions) to perform all operations
CREATE POLICY "Service role can manage all billing customer records" ON "public"."billing_customers"
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant INSERT and UPDATE permissions to authenticated users
GRANT INSERT, UPDATE ON TABLE public.billing_customers TO authenticated;