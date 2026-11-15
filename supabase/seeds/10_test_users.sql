-- ============================================================================
-- Seed: Test Users for Group Chat Testing
-- Description: Creates additional test users in Admin HQ workspace for
--              testing group chat functionality
-- ============================================================================

-- Note: This seed assumes the Admin HQ workspace exists from previous seeds
-- If workspace doesn't exist, these inserts will fail

DO $$
DECLARE
  v_admin_workspace_id UUID;
  v_test_user_1_id UUID := gen_random_uuid();
  v_test_user_2_id UUID := gen_random_uuid();
  v_test_user_3_id UUID := gen_random_uuid();
BEGIN
  -- Get the Admin HQ workspace ID
  SELECT id INTO v_admin_workspace_id
  FROM workspaces
  WHERE name = 'Admin HQ'
  LIMIT 1;

  IF v_admin_workspace_id IS NULL THEN
    RAISE NOTICE 'Admin HQ workspace not found. Skipping test user creation.';
    RETURN;
  END IF;

  -- ============================================================================
  -- Create Test User 1: Alice Johnson
  -- ============================================================================

  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
  ) VALUES (
    v_test_user_1_id,
    '00000000-0000-0000-0000-000000000000',
    'alice.johnson@test.com',
    crypt('testpassword123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Alice Johnson"}'::jsonb,
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO user_profiles (
    id,
    full_name,
    avatar_url,
    created_at
  ) VALUES (
    v_test_user_1_id,
    'Alice Johnson',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    NOW()
  ) ON CONFLICT (id) DO NOTHING;

  -- Add Alice to Admin HQ workspace
  INSERT INTO workspace_members (
    workspace_id,
    workspace_member_id,
    workspace_member_role
  ) VALUES (
    v_admin_workspace_id,
    v_test_user_1_id,
    'member'
  ) ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- Create Test User 2: Bob Smith
  -- ============================================================================

  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
  ) VALUES (
    v_test_user_2_id,
    '00000000-0000-0000-0000-000000000000',
    'bob.smith@test.com',
    crypt('testpassword123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Bob Smith"}'::jsonb,
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO user_profiles (
    id,
    full_name,
    avatar_url,
    created_at
  ) VALUES (
    v_test_user_2_id,
    'Bob Smith',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    NOW()
  ) ON CONFLICT (id) DO NOTHING;

  -- Add Bob to Admin HQ workspace
  INSERT INTO workspace_members (
    workspace_id,
    workspace_member_id,
    workspace_member_role
  ) VALUES (
    v_admin_workspace_id,
    v_test_user_2_id,
    'member'
  ) ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- Create Test User 3: Charlie Davis
  -- ============================================================================

  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
  ) VALUES (
    v_test_user_3_id,
    '00000000-0000-0000-0000-000000000000',
    'charlie.davis@test.com',
    crypt('testpassword123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Charlie Davis"}'::jsonb,
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO user_profiles (
    id,
    full_name,
    avatar_url,
    created_at
  ) VALUES (
    v_test_user_3_id,
    'Charlie Davis',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    NOW()
  ) ON CONFLICT (id) DO NOTHING;

  -- Add Charlie to Admin HQ workspace
  INSERT INTO workspace_members (
    workspace_id,
    workspace_member_id,
    workspace_member_role
  ) VALUES (
    v_admin_workspace_id,
    v_test_user_3_id,
    'member'
  ) ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Test users created successfully in Admin HQ workspace';
  RAISE NOTICE 'Alice: alice.johnson@test.com / testpassword123';
  RAISE NOTICE 'Bob: bob.smith@test.com / testpassword123';
  RAISE NOTICE 'Charlie: charlie.davis@test.com / testpassword123';

END $$;
