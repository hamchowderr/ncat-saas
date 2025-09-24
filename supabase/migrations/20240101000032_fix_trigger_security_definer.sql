-- Migration 32: Fix Trigger Security Context
-- Update the handle_new_user function to run with SECURITY DEFINER to bypass RLS policies

-- Update the trigger function to use SECURITY DEFINER properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER -- This makes the function run with the privileges of the function owner (postgres)
SET search_path = public
AS $$
DECLARE
    new_workspace_id UUID;
    user_name TEXT;
    workspace_slug TEXT;
BEGIN
    -- Extract user name from metadata or email
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );

    -- Generate workspace slug from email
    workspace_slug := lower(split_part(NEW.email, '@', 1)) || '-workspace';

    -- 1. Create user profile
    INSERT INTO public.user_profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        user_name,
        NEW.raw_user_meta_data->>'avatar_url'
    );

    -- 2. Create personal workspace for the user
    INSERT INTO public.workspaces (id, slug, name, created_at)
    VALUES (
        NEW.id, -- Use user ID as workspace ID for personal workspaces
        workspace_slug,
        user_name || '''s Workspace',
        NOW()
    )
    RETURNING id INTO new_workspace_id;

    -- 3. Add user as owner of their workspace
    INSERT INTO public.workspace_members (
        id,
        workspace_id,
        workspace_member_id,
        workspace_member_role,
        added_at
    ) VALUES (
        gen_random_uuid(),
        new_workspace_id,
        NEW.id,
        'owner', -- Assuming 'owner' is a valid role
        NOW()
    );

    -- 4. Create pending billing customer record
    -- This will now run with definer's privileges (postgres role) bypassing RLS
    INSERT INTO public.billing_customers (
        gateway_customer_id,
        workspace_id,
        gateway_name,
        billing_email,
        default_currency,
        metadata
    ) VALUES (
        'pending_' || NEW.id::text,
        new_workspace_id,
        'stripe',
        NEW.email,
        'usd',
        jsonb_build_object(
            'status', 'pending_stripe_creation',
            'free_subscription_needed', true,
            'created_at', NOW(),
            'user_email', NEW.email,
            'user_name', user_name
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;