-- Fix missing foreign key constraint on files.user_id
-- This ensures RLS policies work correctly in production

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    -- Check if the foreign key constraint exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'files'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
        AND kcu.table_name = 'files'
    ) THEN
        -- Add the missing foreign key constraint
        ALTER TABLE public.files
        ADD CONSTRAINT files_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

        RAISE NOTICE 'Added missing foreign key constraint files_user_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint files_user_id_fkey already exists';
    END IF;
END $$;

-- Ensure RLS is enabled on files table
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Drop and recreate RLS policies to ensure they work correctly
DROP POLICY IF EXISTS "Users can view their own files" ON public.files;
DROP POLICY IF EXISTS "Users can insert their own files" ON public.files;
DROP POLICY IF EXISTS "Users can update their own files" ON public.files;
DROP POLICY IF EXISTS "Users can delete their own files" ON public.files;

-- Recreate the RLS policies
CREATE POLICY "Users can view their own files" ON public.files
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files" ON public.files
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files" ON public.files
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files" ON public.files
    FOR DELETE TO authenticated USING (auth.uid() = user_id);