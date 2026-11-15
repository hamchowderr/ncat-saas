-- ==============================================
-- SEED FILE 08: BILLING DATA (PRODUCTS, PRICES, SUBSCRIPTIONS)
-- ==============================================
-- Creates billing data for testing all subscription scenarios.
-- Includes Stripe products, prices, customers, and subscriptions.
--
-- Storage Quotas (matching create-stripe-products.ts):
-- - Free Plan: 10 GB (10737418240 bytes)
-- - Pro Plan: 25 GB (26843545600 bytes)
-- - Business Plan: 50 GB (53687091200 bytes)
--
-- IMPORTANT: These are fake Stripe IDs for local testing only!
-- Real Stripe data is synced via webhooks in production.
-- ==============================================

-- ==============================================
-- BILLING PRODUCTS
-- ==============================================
INSERT INTO public.billing_products (
    gateway_product_id, gateway_name, name, description, features, active, is_visible_in_ui
) VALUES
    (
        'prod_test_free',
        'stripe',
        'NCAT Free Plan',
        'Free tier with basic features for NCAT SaaS Dashboard',
        '["10 GB storage", "Basic media processing", "10 jobs per month", "Community support"]'::jsonb,
        true, true
    ),
    (
        'prod_test_pro',
        'stripe',
        'NCAT Pro Plan',
        'Professional plan with advanced features',
        '["25 GB storage", "Unlimited jobs", "AI generation", "Priority support", "Advanced media tools"]'::jsonb,
        true, true
    ),
    (
        'prod_test_business',
        'stripe',
        'NCAT Business Plan',
        'Enterprise plan with full features',
        '["50 GB storage", "Unlimited everything", "Custom integrations", "Dedicated support", "API access", "White label"]'::jsonb,
        true, true
    )
ON CONFLICT (gateway_product_id) DO NOTHING;

-- ==============================================
-- BILLING PRICES
-- ==============================================
INSERT INTO public.billing_prices (
    gateway_price_id, gateway_product_id, currency, amount, recurring_interval, recurring_interval_count,
    active, tier, free_trial_days, gateway_name, metadata
) VALUES
    -- Free Plan: $0/month, 10 GB storage
    (
        'price_test_free',
        'prod_test_free',
        'usd',
        0, -- $0
        'month', 1,
        true, 'free', NULL, 'stripe',
        '{"tier": "free", "storage_quota_gb": "10", "storage_quota_bytes": "10737418240"}'::jsonb
    ),
    -- Pro Plan: $25/month, 25 GB storage
    (
        'price_test_pro',
        'prod_test_pro',
        'usd',
        2500, -- $25.00 (in cents)
        'month', 1,
        true, 'pro', 14, 'stripe',
        '{"tier": "pro", "storage_quota_gb": "25", "storage_quota_bytes": "26843545600"}'::jsonb
    ),
    -- Business Plan: $50/month, 50 GB storage
    (
        'price_test_business',
        'prod_test_business',
        'usd',
        5000, -- $50.00 (in cents)
        'month', 1,
        true, 'business', NULL, 'stripe',
        '{"tier": "business", "storage_quota_gb": "50", "storage_quota_bytes": "53687091200"}'::jsonb
    )
ON CONFLICT (gateway_price_id) DO NOTHING;

-- ==============================================
-- BILLING CUSTOMERS
-- ==============================================
-- Customer for Admin's Workspace (Business Plan)
INSERT INTO public.billing_customers (
    gateway_customer_id, workspace_id, gateway_name, default_currency, billing_email, metadata
) VALUES (
    'cus_test_admin',
    '00000000-0000-0000-0000-000000000001'::uuid, -- Admin's workspace
    'stripe',
    'usd',
    'admin@test.com',
    '{"test_customer": true, "created_by": "seed_script"}'::jsonb
) ON CONFLICT (workspace_id, gateway_name) DO UPDATE SET
    gateway_customer_id = EXCLUDED.gateway_customer_id,
    billing_email = EXCLUDED.billing_email,
    metadata = EXCLUDED.metadata;

-- Customer for Solo's Workspace (Free Plan)
INSERT INTO public.billing_customers (
    gateway_customer_id, workspace_id, gateway_name, default_currency, billing_email, metadata
) VALUES (
    'cus_test_solo',
    '00000000-0000-0000-0000-000000000002'::uuid, -- Solo's workspace
    'stripe',
    'usd',
    'solo@test.com',
    '{"test_customer": true, "created_by": "seed_script"}'::jsonb
) ON CONFLICT (workspace_id, gateway_name) DO UPDATE SET
    gateway_customer_id = EXCLUDED.gateway_customer_id,
    billing_email = EXCLUDED.billing_email,
    metadata = EXCLUDED.metadata;

-- Customer for Team Workspace (Pro Plan)
INSERT INTO public.billing_customers (
    gateway_customer_id, workspace_id, gateway_name, default_currency, billing_email, metadata
) VALUES (
    'cus_test_team',
    '00000000-0000-0000-0000-000000000003'::uuid, -- Team workspace
    'stripe',
    'usd',
    'owner@team.com',
    '{"test_customer": true, "created_by": "seed_script"}'::jsonb
) ON CONFLICT (workspace_id, gateway_name) DO UPDATE SET
    gateway_customer_id = EXCLUDED.gateway_customer_id,
    billing_email = EXCLUDED.billing_email,
    metadata = EXCLUDED.metadata;

-- ==============================================
-- BILLING SUBSCRIPTIONS
-- ==============================================
-- Subscription 1: Admin's Workspace - Business Plan (Active, 50 GB)
INSERT INTO public.billing_subscriptions (
    id, gateway_customer_id, gateway_name, gateway_subscription_id,
    gateway_product_id, gateway_price_id,
    status, current_period_start, current_period_end,
    currency, is_trial, trial_ends_at, cancel_at_period_end, quantity
) VALUES (
    '10000000-0000-0000-0000-000000000001'::uuid,
    'cus_test_admin', 'stripe', 'sub_test_admin_business',
    'prod_test_business', 'price_test_business',
    'active',
    CURRENT_DATE - INTERVAL '15 days',
    CURRENT_DATE + INTERVAL '15 days',
    'usd', false, NULL, false, 1
) ON CONFLICT (id) DO NOTHING;

-- Subscription 2: Solo's Workspace - Free Plan (Active, 10 GB, NEAR LIMIT)
INSERT INTO public.billing_subscriptions (
    id, gateway_customer_id, gateway_name, gateway_subscription_id,
    gateway_product_id, gateway_price_id,
    status, current_period_start, current_period_end,
    currency, is_trial, trial_ends_at, cancel_at_period_end, quantity
) VALUES (
    '10000000-0000-0000-0000-000000000002'::uuid,
    'cus_test_solo', 'stripe', 'sub_test_solo_free',
    'prod_test_free', 'price_test_free',
    'active',
    CURRENT_DATE - INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '20 days',
    'usd', false, NULL, false, 1
) ON CONFLICT (id) DO NOTHING;

-- Subscription 3: Team Workspace - Pro Plan (Active, 25 GB)
INSERT INTO public.billing_subscriptions (
    id, gateway_customer_id, gateway_name, gateway_subscription_id,
    gateway_product_id, gateway_price_id,
    status, current_period_start, current_period_end,
    currency, is_trial, trial_ends_at, cancel_at_period_end, quantity
) VALUES (
    '10000000-0000-0000-0000-000000000003'::uuid,
    'cus_test_team', 'stripe', 'sub_test_team_pro',
    'prod_test_pro', 'price_test_pro',
    'active',
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE + INTERVAL '23 days',
    'usd', false, NULL, false, 1
) ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- SAMPLE INVOICES (Optional - for testing invoice display)
-- ==============================================
-- Invoice 1: Admin's last payment (Business Plan - $50)
INSERT INTO public.billing_invoices (
    gateway_invoice_id, gateway_customer_id, gateway_product_id, gateway_price_id,
    gateway_name, amount, currency, status, due_date, paid_date, hosted_invoice_url
) VALUES (
    'in_test_admin_001',
    'cus_test_admin',
    'prod_test_business', 'price_test_business',
    'stripe', 50.00, 'usd', 'paid',
    CURRENT_DATE - INTERVAL '15 days',
    CURRENT_DATE - INTERVAL '15 days',
    NULL
) ON CONFLICT (gateway_invoice_id) DO NOTHING;

-- Invoice 2: Team's last payment (Pro Plan - $25)
INSERT INTO public.billing_invoices (
    gateway_invoice_id, gateway_customer_id, gateway_product_id, gateway_price_id,
    gateway_name, amount, currency, status, due_date, paid_date, hosted_invoice_url
) VALUES (
    'in_test_team_001',
    'cus_test_team',
    'prod_test_pro', 'price_test_pro',
    'stripe', 25.00, 'usd', 'paid',
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE - INTERVAL '7 days',
    NULL
) ON CONFLICT (gateway_invoice_id) DO NOTHING;

-- ==============================================
-- SUMMARY
-- ==============================================
-- Products Created: 3
--   - NCAT Free Plan ($0/month, 10 GB storage)
--   - NCAT Pro Plan ($25/month, 25 GB storage)
--   - NCAT Business Plan ($50/month, 50 GB storage)
--
-- Customers Created: 3
--   - Admin's Workspace (cus_test_admin)
--   - Solo's Workspace (cus_test_solo)
--   - Team Workspace (cus_test_team)
--
-- Active Subscriptions: 3
--   - Admin: Business Plan ($50/month, 50 GB)
--   - Solo: Free Plan ($0/month, 10 GB) ⚠️ Will be near limit
--   - Team: Pro Plan ($25/month, 25 GB)
--
-- Invoices: 2 sample invoices for testing
-- ==============================================
