-- ============================================================================
-- Story Assembly Webhook for Faceless Video Generation
-- ============================================================================
-- This migration adds webhook triggers for automatically assembling stories
-- when all scenes in a story are completed.
--
-- Workflow:
-- 1. AFTER UPDATE on scenes: When final_scene_url becomes available, check if all scenes in story are done
-- 2. If all scenes completed, fire webhook to assemble story
-- 3. Edge Function concatenates all scenes and updates stories.final_story_url
-- ============================================================================

-- ============================================================================
-- 1. STORY ASSEMBLY TRIGGER (AFTER UPDATE ON SCENES)
-- ============================================================================
-- Fires when a scene's final_scene_url becomes available and all scenes in story are done

CREATE OR REPLACE FUNCTION public.check_story_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_scenes INTEGER;
  completed_scenes INTEGER;
  story_user_id UUID;
  auto_assemble_stories BOOLEAN;
BEGIN
  -- Only check if this scene just got completed
  IF NEW.final_scene_url IS NOT NULL AND OLD.final_scene_url IS NULL THEN

    -- Count total scenes and completed scenes in this story
    SELECT COUNT(*) INTO total_scenes
    FROM public.scenes
    WHERE story_id = NEW.story_id;

    SELECT COUNT(*) INTO completed_scenes
    FROM public.scenes
    WHERE story_id = NEW.story_id
      AND final_scene_url IS NOT NULL;

    -- Get user_id for this story
    SELECT user_id INTO story_user_id
    FROM public.stories
    WHERE id = NEW.story_id;

    -- Check if auto-assembly is enabled for this story type
    SELECT st.auto_assemble_stories INTO auto_assemble_stories
    FROM public.story_types st
    JOIN public.stories s ON s.story_type_id = st.id
    WHERE s.id = NEW.story_id;

    -- If all scenes completed AND auto-assembly enabled, trigger story assembly
    IF completed_scenes = total_scenes AND total_scenes > 0 AND auto_assemble_stories THEN

      -- Fire webhook to Edge Function
      PERFORM net.http_post(
        url := 'http://host.docker.internal:54321/functions/v1/shot-generation-webhook',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
        ),
        body := jsonb_build_object(
          'type', 'story_assembly',
          'story_id', NEW.story_id,
          'user_id', story_user_id
        )
      );

    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER webhook_story_assembly
  AFTER UPDATE ON public.scenes
  FOR EACH ROW
  EXECUTE FUNCTION public.check_story_completion();

COMMENT ON FUNCTION public.check_story_completion() IS 'Checks if all scenes in a story are completed and triggers story assembly webhook';

-- ============================================================================
-- 2. ADD auto_assemble_stories TO story_types (if not exists)
-- ============================================================================
-- Allow story types to configure automatic story assembly

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'story_types'
      AND column_name = 'auto_assemble_stories'
  ) THEN
    ALTER TABLE public.story_types
    ADD COLUMN auto_assemble_stories BOOLEAN DEFAULT TRUE;

    COMMENT ON COLUMN public.story_types.auto_assemble_stories IS 'Automatically assemble stories when all scenes are completed';
  END IF;
END $$;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
