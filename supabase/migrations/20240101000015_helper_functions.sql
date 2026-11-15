-- Migration 15: Helper Functions
-- Creates utility functions used by RLS policies

-- Function to check if user is a workspace member
CREATE OR REPLACE FUNCTION public.is_workspace_member(user_id UUID, workspace_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.workspace_members
        WHERE workspace_member_id = user_id
        AND workspace_members.workspace_id = is_workspace_member.workspace_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to check if user is a workspace admin (includes owner and admin roles)
CREATE OR REPLACE FUNCTION public.is_workspace_admin(user_id UUID, workspace_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.workspace_members
        WHERE workspace_member_id = user_id
        AND workspace_members.workspace_id = is_workspace_admin.workspace_id
        AND workspace_member_role IN ('owner', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to check if user is an application admin
CREATE OR REPLACE FUNCTION public.is_application_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_roles.user_id = is_application_admin.user_id
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to get project workspace UUID
CREATE OR REPLACE FUNCTION public.get_project_workspace_uuid(project_id UUID)
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT workspace_id
        FROM public.projects
        WHERE id = project_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to get customer workspace ID
CREATE OR REPLACE FUNCTION public.get_customer_workspace_id(gateway_customer_id TEXT)
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT workspace_id
        FROM public.billing_customers
        WHERE billing_customers.gateway_customer_id = get_customer_workspace_id.gateway_customer_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================================================
-- STORAGE QUOTA HELPER FUNCTIONS
-- ============================================================================

-- Function to get workspace storage quota from subscription plan
-- Returns storage quota in bytes from the active subscription's price metadata
CREATE OR REPLACE FUNCTION public.get_workspace_storage_quota(p_workspace_id UUID)
RETURNS BIGINT AS $$
DECLARE
    v_quota_bytes BIGINT;
BEGIN
    -- Get storage quota from active subscription's price metadata
    -- Defaults to 10GB (10737418240 bytes) if no subscription or metadata found
    SELECT COALESCE(
        NULLIF((bp.metadata->>'storage_quota_bytes')::TEXT, '')::BIGINT,
        10737418240  -- Default: 10GB in bytes
    )
    INTO v_quota_bytes
    FROM public.billing_customers bc
    JOIN public.billing_subscriptions bs ON bs.gateway_customer_id = bc.gateway_customer_id
    JOIN public.billing_prices bp ON bp.gateway_price_id = bs.gateway_price_id
    WHERE bc.workspace_id = p_workspace_id
      AND bs.status = 'active'
      AND bc.gateway_name = 'stripe'
    ORDER BY bs.current_period_end DESC
    LIMIT 1;

    -- If no subscription found, return default quota (10GB for free tier)
    RETURN COALESCE(v_quota_bytes, 10737418240);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to get workspace current storage usage
-- Returns total bytes used by all files owned by workspace members
CREATE OR REPLACE FUNCTION public.get_workspace_storage_usage(p_workspace_id UUID)
RETURNS BIGINT AS $$
DECLARE
    v_total_bytes BIGINT;
BEGIN
    -- Sum file sizes for all files owned by workspace members
    SELECT COALESCE(SUM(f.file_size), 0)
    INTO v_total_bytes
    FROM public.files f
    WHERE f.user_id IN (
        SELECT wm.workspace_member_id
        FROM public.workspace_members wm
        WHERE wm.workspace_id = p_workspace_id
    );

    RETURN v_total_bytes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to check if workspace has storage available for upload
-- Returns JSONB with quota check result and details
CREATE OR REPLACE FUNCTION public.check_workspace_storage_quota(
    p_workspace_id UUID,
    p_file_size_bytes BIGINT
)
RETURNS JSONB AS $$
DECLARE
    v_quota BIGINT;
    v_used BIGINT;
    v_available BIGINT;
    v_allowed BOOLEAN;
BEGIN
    -- Get quota and current usage
    v_quota := public.get_workspace_storage_quota(p_workspace_id);
    v_used := public.get_workspace_storage_usage(p_workspace_id);
    v_available := v_quota - v_used;

    -- Check if upload is allowed
    v_allowed := (v_used + p_file_size_bytes) <= v_quota;

    -- Return detailed result
    RETURN jsonb_build_object(
        'allowed', v_allowed,
        'quota', v_quota,
        'used', v_used,
        'available', v_available,
        'requested', p_file_size_bytes,
        'wouldExceedBy', CASE
            WHEN NOT v_allowed THEN (v_used + p_file_size_bytes) - v_quota
            ELSE 0
        END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================================================
-- ADMIN BYPASS FOR BILLING RLS POLICIES
-- ============================================================================
-- Now that is_application_admin() exists, we can add admin bypass to billing policies

-- Drop and recreate billing_customers SELECT policy with admin bypass
DROP POLICY IF EXISTS "Users can view their own billing customer records" ON "public"."billing_customers";
CREATE POLICY "Users can view their own billing customer records" ON "public"."billing_customers"
    FOR SELECT TO authenticated
    USING (
        workspace_id IN (
            SELECT w.id FROM workspaces w
            INNER JOIN workspace_members wm ON w.id = wm.workspace_id
            WHERE wm.workspace_member_id = auth.uid()
        )
        -- Allow app admins to view ALL billing data (for impersonation/debugging)
        OR "public"."is_application_admin"(auth.uid())
    );

-- Drop and recreate billing_subscriptions SELECT policy with admin bypass
DROP POLICY IF EXISTS "Users can view their workspace billing subscriptions" ON "public"."billing_subscriptions";
CREATE POLICY "Users can view their workspace billing subscriptions" ON "public"."billing_subscriptions"
    FOR SELECT TO authenticated
    USING (
        gateway_customer_id IN (
            SELECT gateway_customer_id FROM billing_customers
            WHERE workspace_id IN (
                SELECT w.id FROM workspaces w
                INNER JOIN workspace_members wm ON w.id = wm.workspace_id
                WHERE wm.workspace_member_id = auth.uid()
            )
        )
        -- Allow app admins to view ALL subscriptions (for impersonation/debugging)
        OR "public"."is_application_admin"(auth.uid())
    );
