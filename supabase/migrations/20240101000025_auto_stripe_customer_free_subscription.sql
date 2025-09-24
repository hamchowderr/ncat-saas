-- Migration 25: Auto-create Stripe customer and free subscription on user signup
-- Extends the existing handle_new_user function to create Stripe customer and free subscription

-- First, let's create a function to create Stripe customer and subscription via API
CREATE OR REPLACE FUNCTION public.create_stripe_customer_and_free_subscription(user_id UUID, user_email TEXT)
RETURNS void AS $$
DECLARE
    stripe_customer_id TEXT;
    free_price_id TEXT := 'price_1SAgo7CCFNRAwpJserQa3BZG'; -- Free plan price ID
BEGIN
    -- This function will be called from the trigger
    -- For now, we'll insert a record to billing_customers that the API can pick up
    -- The actual Stripe customer creation will happen via webhook or API call

    -- Insert placeholder billing customer record
    INSERT INTO public.billing_customers (
        gateway_customer_id,
        workspace_id,
        gateway_name,
        billing_email,
        default_currency,
        metadata
    ) VALUES (
        'pending_' || user_id::text, -- Temporary ID until Stripe customer is created
        user_id,
        'stripe',
        user_email,
        'usd',
        jsonb_build_object(
            'status', 'pending_stripe_creation',
            'free_subscription_needed', true,
            'created_at', NOW()
        )
    );

    -- Billing customer record created, Stripe processing will happen via API

EXCEPTION WHEN OTHERS THEN
    -- If anything fails, just log it but don't break user creation
    RAISE WARNING 'Failed to create billing customer for user %: %', user_id, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the existing handle_new_user function to include Stripe customer creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create user profile (existing functionality)
    INSERT INTO public.user_profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );

    -- Create Stripe customer and free subscription
    PERFORM public.create_stripe_customer_and_free_subscription(NEW.id, NEW.email);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger is already created in the previous migration, so it will use this updated function