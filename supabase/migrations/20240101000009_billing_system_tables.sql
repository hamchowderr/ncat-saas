-- Migration 9: Billing System Tables
-- Create billing-related tables for products, prices, customers, subscriptions, and payments

-- Billing Products Table
CREATE TABLE IF NOT EXISTS public.billing_products (
gateway_product_id TEXT PRIMARY KEY,
gateway_name TEXT NOT NULL,
name TEXT NOT NULL,
description TEXT,
features JSONB,
active BOOLEAN NOT NULL DEFAULT TRUE,
is_visible_in_ui BOOLEAN NOT NULL DEFAULT TRUE,
UNIQUE(gateway_name, gateway_product_id)
);

-- Billing Prices Table
CREATE TABLE IF NOT EXISTS public.billing_prices (
gateway_price_id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
gateway_product_id TEXT NOT NULL REFERENCES public.billing_products(gateway_product_id) ON DELETE CASCADE,
currency TEXT NOT NULL,
amount DECIMAL NOT NULL,
recurring_interval TEXT NOT NULL,
recurring_interval_count INT NOT NULL DEFAULT 0,
active BOOLEAN NOT NULL DEFAULT TRUE,
tier TEXT,
free_trial_days INT,
gateway_name TEXT NOT NULL,
UNIQUE(gateway_name, gateway_price_id)
);

-- Billing Volume Tiers Table
CREATE TABLE IF NOT EXISTS public.billing_volume_tiers (
"id" "uuid" PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
gateway_price_id TEXT NOT NULL REFERENCES public.billing_prices(gateway_price_id) ON DELETE CASCADE,
min_quantity INT NOT NULL,
max_quantity INT,
unit_price DECIMAL NOT NULL
);

-- Billing Customers Table
CREATE TABLE IF NOT EXISTS public.billing_customers (
gateway_customer_id TEXT PRIMARY KEY,
workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
gateway_name TEXT NOT NULL,
default_currency TEXT,
billing_email TEXT NOT NULL,
metadata JSONB DEFAULT '{}',
UNIQUE (gateway_name, gateway_customer_id)
);

-- Billing Invoices Table
CREATE TABLE IF NOT EXISTS public.billing_invoices (
gateway_invoice_id TEXT PRIMARY KEY,
gateway_customer_id TEXT NOT NULL REFERENCES public.billing_customers(gateway_customer_id) ON DELETE CASCADE,
gateway_product_id TEXT REFERENCES public.billing_products(gateway_product_id) ON DELETE CASCADE,
gateway_price_id TEXT REFERENCES public.billing_prices(gateway_price_id) ON DELETE CASCADE,
gateway_name TEXT NOT NULL,
amount DECIMAL NOT NULL,
currency TEXT NOT NULL,
STATUS TEXT NOT NULL,
due_date DATE,
paid_date DATE,
hosted_invoice_url TEXT,
UNIQUE(gateway_name, gateway_invoice_id)
);

-- Billing Subscriptions Table
CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
id UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
gateway_customer_id TEXT NOT NULL REFERENCES public.billing_customers(gateway_customer_id) ON DELETE CASCADE,
gateway_name TEXT NOT NULL,
gateway_subscription_id TEXT NOT NULL,
gateway_product_id TEXT NOT NULL REFERENCES public.billing_products(gateway_product_id) ON DELETE CASCADE,
gateway_price_id TEXT NOT NULL REFERENCES public.billing_prices(gateway_price_id) ON DELETE CASCADE,
STATUS public.subscription_status NOT NULL,
current_period_start DATE NOT NULL,
current_period_end DATE NOT NULL,
currency TEXT NOT NULL,
is_trial BOOLEAN NOT NULL,
trial_ends_at DATE,
cancel_at_period_end BOOLEAN NOT NULL,
quantity INT,
UNIQUE(gateway_name, gateway_subscription_id)
);

-- Billing One Time Payments Table
CREATE TABLE IF NOT EXISTS public.billing_one_time_payments (
gateway_charge_id TEXT PRIMARY KEY NOT NULL,
gateway_customer_id TEXT NOT NULL REFERENCES public.billing_customers(gateway_customer_id) ON DELETE CASCADE,
gateway_name TEXT NOT NULL,
amount DECIMAL NOT NULL,
currency TEXT NOT NULL,
STATUS TEXT NOT NULL,
charge_date TIMESTAMP WITH TIME ZONE NOT NULL,
gateway_invoice_id TEXT NOT NULL REFERENCES public.billing_invoices(gateway_invoice_id) ON DELETE CASCADE,
gateway_product_id TEXT NOT NULL REFERENCES public.billing_products(gateway_product_id) ON DELETE CASCADE,
gateway_price_id TEXT NOT NULL REFERENCES public.billing_prices(gateway_price_id) ON DELETE CASCADE
);

-- Billing Payment Methods Table
CREATE TABLE IF NOT EXISTS public.billing_payment_methods (
id UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
gateway_customer_id TEXT NOT NULL REFERENCES public.billing_customers(gateway_customer_id) ON DELETE CASCADE,
payment_method_id TEXT NOT NULL,
payment_method_type TEXT NOT NULL,
payment_method_details JSONB NOT NULL,
is_default BOOLEAN NOT NULL DEFAULT FALSE
);

-- Billing Usage Logs Table
CREATE TABLE IF NOT EXISTS public.billing_usage_logs (
id UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
gateway_customer_id TEXT NOT NULL REFERENCES public.billing_customers(gateway_customer_id),
feature TEXT NOT NULL,
usage_amount INT NOT NULL,
timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Billing Customers RLS Policies
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

-- Update the handle_new_user function to run with SECURITY DEFINER to bypass RLS policies
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
