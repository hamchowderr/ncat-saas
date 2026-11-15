-- ============================================================================
-- Scene Assembly Webhook for Faceless Video Generation
-- ============================================================================
-- This migration adds webhook triggers for automatically assembling scenes
-- when all shots in a scene are completed.
--
-- Workflow:
-- 1. AFTER UPDATE on shots: When final_shot_url becomes available, check if all shots in scene are done
-- 2. If all shots completed, fire webhook to assemble scene
-- 3. Edge Function concatenates all shots and updates scenes.final_scene_url
-- ============================================================================

-- ============================================================================
-- 1. SCENE ASSEMBLY TRIGGER (AFTER UPDATE ON SHOTS)
-- ============================================================================
-- Fires when a shot's final_shot_url becomes available and all shots in scene are done

CREATE OR REPLACE FUNCTION public.check_scene_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_shots INTEGER;
  completed_shots INTEGER;
  scene_user_id UUID;
  auto_assemble_scenes BOOLEAN;
BEGIN
  -- Only check if this shot just got completed
  IF NEW.final_shot_url IS NOT NULL AND OLD.final_shot_url IS NULL THEN

    -- Count total shots and completed shots in this scene
    SELECT COUNT(*) INTO total_shots
    FROM public.shots
    WHERE scene_id = NEW.scene_id;

    SELECT COUNT(*) INTO completed_shots
    FROM public.shots
    WHERE scene_id = NEW.scene_id
      AND final_shot_url IS NOT NULL;

    -- Get user_id for this scene
    SELECT s.user_id INTO scene_user_id
    FROM public.stories s
    JOIN public.scenes sc ON sc.story_id = s.id
    WHERE sc.id = NEW.scene_id;

    -- Check if auto-assembly is enabled for this story type
    SELECT st.auto_assemble_scenes INTO auto_assemble_scenes
    FROM public.story_types st
    JOIN public.stories s ON s.story_type_id = st.id
    JOIN public.scenes sc ON sc.story_id = s.id
    WHERE sc.id = NEW.scene_id;

    -- If all shots completed AND auto-assembly enabled, trigger scene assembly
    IF completed_shots = total_shots AND total_shots > 0 AND auto_assemble_scenes THEN

      -- Fire webhook to Edge Function
      PERFORM net.http_post(
        url := 'http://host.docker.internal:54321/functions/v1/shot-generation-webhook',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
        ),
        body := jsonb_build_object(
          'type', 'scene_assembly',
          'scene_id', NEW.scene_id,
          'user_id', scene_user_id
        )
      );

    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER webhook_scene_assembly
  AFTER UPDATE ON public.shots
  FOR EACH ROW
  EXECUTE FUNCTION public.check_scene_completion();

COMMENT ON FUNCTION public.check_scene_completion() IS 'Checks if all shots in a scene are completed and triggers scene assembly webhook';

-- ============================================================================
-- 2. ADD auto_assemble_scenes TO story_types (if not exists)
-- ============================================================================
-- Allow story types to configure automatic scene assembly

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'story_types'
      AND column_name = 'auto_assemble_scenes'
  ) THEN
    ALTER TABLE public.story_types
    ADD COLUMN auto_assemble_scenes BOOLEAN DEFAULT TRUE;

    COMMENT ON COLUMN public.story_types.auto_assemble_scenes IS 'Automatically assemble scenes when all shots are completed';
  END IF;
END $$;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
