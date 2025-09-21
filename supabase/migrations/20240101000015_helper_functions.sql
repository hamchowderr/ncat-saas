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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is a workspace admin
CREATE OR REPLACE FUNCTION public.is_workspace_admin(user_id UUID, workspace_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.workspace_members 
        WHERE workspace_member_id = user_id 
        AND workspace_members.workspace_id = is_workspace_admin.workspace_id
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;
