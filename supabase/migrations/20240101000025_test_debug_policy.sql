-- Test if the debug policy resolves the file access issue
-- This creates a permissive policy to isolate the RLS problem

-- Create a very permissive policy for debugging
DROP POLICY IF EXISTS "Debug - All authenticated users can view files" ON public.files;
CREATE POLICY "Debug - All authenticated users can view files" ON public.files
    FOR SELECT TO authenticated USING (true);

-- Also ensure the original policies are removed to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own files" ON public.files;

-- Add a notice about this being temporary
COMMENT ON POLICY "Debug - All authenticated users can view files" ON public.files
IS 'TEMPORARY: Allows all authenticated users to view all files for debugging purposes. REMOVE AFTER TESTING.';