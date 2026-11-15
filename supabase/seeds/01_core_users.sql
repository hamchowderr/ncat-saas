-- ==============================================
-- SEED FILE 01: CORE TEST USERS
-- ==============================================
-- Creates 5 test users with complete auth setup for comprehensive testing scenarios:
-- 1. Admin User (admin@test.com) - Admin role, multi-workspace access
-- 2. Solo User (solo@test.com) - Personal workspace only
-- 3. Team Owner (owner@team.com) - Team workspace owner
-- 4. Team Member (member@team.com) - Team workspace member
-- 5. Team Readonly (readonly@team.com) - Team workspace readonly access
--
-- All passwords: admin123, solo123, or team123 respectively
-- IMPORTANT: FOR LOCAL DEVELOPMENT ONLY!
-- ==============================================

-- ==============================================
-- USER 1: ADMIN USER
-- ==============================================
-- Admin user with admin role and multi-workspace access
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change,
    email_change_token_new,
    email_change_token_current,
    phone_change,
    phone_change_token,
    reauthentication_token,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    last_sign_in_at
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'admin@test.com',
    '$2a$06$DihED3n9SQVQbdrOzo2zLuL0kqTQvyi10yaZV.65SUDva4n8WbI..',
    NOW(),
    NOW(),
    NOW(),
    '', '', '', '', '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"admin"}',
    '{"full_name":"Admin User"}',
    FALSE,
    NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001'::uuid,
    '{"sub":"00000000-0000-0000-0000-000000000001","email":"admin@test.com"}',
    'email', NOW(), NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_profiles (id, full_name, avatar_url, created_at) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Admin User', NULL, NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (id, user_id, role) VALUES (
    '00000000-0000-0000-0000-000000000010'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'admin'
) ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- USER 2: SOLO USER
-- ==============================================
-- Solo user with personal workspace only
INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    confirmation_token, recovery_token, email_change,
    email_change_token_new, email_change_token_current,
    phone_change, phone_change_token, reauthentication_token,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, last_sign_in_at
) VALUES (
    '00000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated', 'authenticated', 'solo@test.com',
    '$2a$06$DihED3n9SQVQbdrOzo2zLuL0kqTQvyi10yaZV.65SUDva4n8WbI..',
    NOW(), NOW(), NOW(),
    '', '', '', '', '', '', '', '',
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Solo User"}',
    FALSE, NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002'::uuid,
    '{"sub":"00000000-0000-0000-0000-000000000002","email":"solo@test.com"}',
    'email', NOW(), NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_profiles (id, full_name, avatar_url, created_at) VALUES (
    '00000000-0000-0000-0000-000000000002'::uuid,
    'Solo User', NULL, NOW()
) ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- USER 3: TEAM OWNER
-- ==============================================
-- Team workspace owner
INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    confirmation_token, recovery_token, email_change,
    email_change_token_new, email_change_token_current,
    phone_change, phone_change_token, reauthentication_token,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, last_sign_in_at
) VALUES (
    '00000000-0000-0000-0000-000000000003'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated', 'authenticated', 'owner@team.com',
    '$2a$06$DihED3n9SQVQbdrOzo2zLuL0kqTQvyi10yaZV.65SUDva4n8WbI..',
    NOW(), NOW(), NOW(),
    '', '', '', '', '', '', '', '',
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Team Owner"}',
    FALSE, NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000003'::uuid,
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003'::uuid,
    '{"sub":"00000000-0000-0000-0000-000000000003","email":"owner@team.com"}',
    'email', NOW(), NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_profiles (id, full_name, avatar_url, created_at) VALUES (
    '00000000-0000-0000-0000-000000000003'::uuid,
    'Team Owner', NULL, NOW()
) ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- USER 4: TEAM MEMBER
-- ==============================================
-- Team workspace member
INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    confirmation_token, recovery_token, email_change,
    email_change_token_new, email_change_token_current,
    phone_change, phone_change_token, reauthentication_token,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, last_sign_in_at
) VALUES (
    '00000000-0000-0000-0000-000000000004'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated', 'authenticated', 'member@team.com',
    '$2a$06$DihED3n9SQVQbdrOzo2zLuL0kqTQvyi10yaZV.65SUDva4n8WbI..',
    NOW(), NOW(), NOW(),
    '', '', '', '', '', '', '', '',
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Team Member"}',
    FALSE, NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000004'::uuid,
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000004'::uuid,
    '{"sub":"00000000-0000-0000-0000-000000000004","email":"member@team.com"}',
    'email', NOW(), NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_profiles (id, full_name, avatar_url, created_at) VALUES (
    '00000000-0000-0000-0000-000000000004'::uuid,
    'Team Member', NULL, NOW()
) ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- USER 5: TEAM READONLY
-- ==============================================
-- Team workspace readonly access
INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    confirmation_token, recovery_token, email_change,
    email_change_token_new, email_change_token_current,
    phone_change, phone_change_token, reauthentication_token,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, last_sign_in_at
) VALUES (
    '00000000-0000-0000-0000-000000000005'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated', 'authenticated', 'readonly@team.com',
    '$2a$06$DihED3n9SQVQbdrOzo2zLuL0kqTQvyi10yaZV.65SUDva4n8WbI..',
    NOW(), NOW(), NOW(),
    '', '', '', '', '', '', '', '',
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Team Readonly"}',
    FALSE, NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000005'::uuid,
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000005'::uuid,
    '{"sub":"00000000-0000-0000-0000-000000000005","email":"readonly@team.com"}',
    'email', NOW(), NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_profiles (id, full_name, avatar_url, created_at) VALUES (
    '00000000-0000-0000-0000-000000000005'::uuid,
    'Team Readonly', NULL, NOW()
) ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- NOTE: Workspaces and workspace memberships are created by the
-- handle_new_user() trigger, so they are NOT created here.
-- They will be created in 02_workspaces.sql
-- ==============================================
