-- Debug RLS policies for files table
-- This migration helps diagnose why RLS policies are still failing

-- First, let's check the current state of the files table
DO $$
BEGIN
    -- Log current RLS status
    RAISE NOTICE 'Checking files table RLS configuration...';

    -- Check if RLS is enabled
    IF EXISTS (
        SELECT 1 FROM pg_class
        WHERE relname = 'files'
        AND relrowsecurity = true
    ) THEN
        RAISE NOTICE 'RLS is ENABLED on files table';
    ELSE
        RAISE NOTICE 'RLS is DISABLED on files table';
    END IF;
END $$;

-- Show all current policies on files table
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'files';

-- Check foreign key constraints on files table
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'files';

-- Create a more permissive policy temporarily for debugging
-- This will help us understand if the issue is with auth.uid() or the policy logic
DROP POLICY IF EXISTS "Debug - All authenticated users can view files" ON public.files;
CREATE POLICY "Debug - All authenticated users can view files" ON public.files
    FOR SELECT TO authenticated USING (true);

-- Add a comment to track when this debug policy was added
COMMENT ON POLICY "Debug - All authenticated users can view files" ON public.files
IS 'Temporary debug policy - remove after diagnosing RLS issue';

RAISE NOTICE 'Debug policy created. Test file query now and then remove this policy.';