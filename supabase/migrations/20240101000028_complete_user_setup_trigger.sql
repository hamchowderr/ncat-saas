-- Migration 28: Complete user setup trigger
-- Create a comprehensive handle_new_user function that sets up everything

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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

    -- 5. Note: Stripe customer and free subscription will be created
    --    when user first visits billing page or through Stripe webhook events

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also create workspaces and billing customers for existing users
DO $$
DECLARE
    user_record RECORD;
    new_workspace_id UUID;
    user_name TEXT;
    workspace_slug TEXT;
BEGIN
    FOR user_record IN
        SELECT u.id, u.email, u.raw_user_meta_data
        FROM auth.users u
        LEFT JOIN workspaces w ON w.id = u.id
        WHERE w.id IS NULL -- Users without workspaces
    LOOP
        -- Extract user name
        user_name := COALESCE(
            user_record.raw_user_meta_data->>'full_name',
            user_record.raw_user_meta_data->>'name',
            split_part(user_record.email, '@', 1)
        );

        workspace_slug := lower(split_part(user_record.email, '@', 1)) || '-workspace';

        -- Create workspace
        INSERT INTO public.workspaces (id, slug, name, created_at)
        VALUES (
            user_record.id,
            workspace_slug,
            user_name || '''s Workspace',
            NOW()
        );

        -- Add workspace membership
        INSERT INTO public.workspace_members (
            id,
            workspace_id,
            workspace_member_id,
            workspace_member_role,
            added_at
        ) VALUES (
            gen_random_uuid(),
            user_record.id,
            user_record.id,
            'owner',
            NOW()
        );

        -- Create billing customer if doesn't exist
        INSERT INTO public.billing_customers (
            gateway_customer_id,
            workspace_id,
            gateway_name,
            billing_email,
            default_currency,
            metadata
        ) VALUES (
            'pending_' || user_record.id::text,
            user_record.id,
            'stripe',
            user_record.email,
            'usd',
            jsonb_build_object(
                'status', 'pending_stripe_creation',
                'free_subscription_needed', true,
                'created_at', NOW(),
                'user_email', user_record.email,
                'user_name', user_name,
                'backfilled', true
            )
        )
        ON CONFLICT (gateway_name, gateway_customer_id) DO NOTHING;

    END LOOP;
END $$;