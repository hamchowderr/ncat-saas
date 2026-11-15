-- ============================================================================
-- Database Webhooks for Faceless Video Generation
-- ============================================================================
-- This migration adds comprehensive webhook triggers for automating shot
-- media generation (image, audio, video) based on story type configuration.
--
-- Workflow:
-- 1. BEFORE INSERT: Set auto-run flags when shot created
-- 2. AFTER UPDATE: Fire webhooks when *_go flags change to TRUE
-- 3. BEFORE UPDATE: Auto-approve when all media exists
-- 4. AFTER UPDATE: Mix audio + video when approved
-- ============================================================================

-- ============================================================================
-- 1. AUTO-RUN TRIGGER (BEFORE INSERT)
-- ============================================================================
-- Sets image_go, audio_go flags based on story type configuration

CREATE OR REPLACE FUNCTION public.set_auto_run_flags()
RETURNS TRIGGER AS $$
DECLARE
  story_type_settings RECORD;
BEGIN
  -- Get story type configuration for this shot
  SELECT
    st.auto_run_image_action,
    st.auto_run_audio_action,
    st.auto_run_video_action
  INTO story_type_settings
  FROM public.story_types st
  JOIN public.stories s ON s.story_type_id = st.id
  JOIN public.scenes sc ON sc.story_id = s.id
  WHERE sc.id = NEW.scene_id;

  -- Set flags based on auto-run configuration
  IF story_type_settings.auto_run_image_action THEN
    NEW.image_go := TRUE;
  END IF;

  IF story_type_settings.auto_run_audio_action THEN
    NEW.audio_go := TRUE;
  END IF;

  -- Video auto-run handled separately (waits for image to exist)

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_auto_run_shot_generation
  BEFORE INSERT ON public.shots
  FOR EACH ROW
  EXECUTE FUNCTION public.set_auto_run_flags();

COMMENT ON FUNCTION public.set_auto_run_flags() IS 'Automatically sets image_go and audio_go flags based on story type auto-run configuration when shot is created';

-- ============================================================================
-- 2. IMAGE GENERATION WEBHOOK (AFTER UPDATE)
-- ============================================================================
-- Fires when image_go changes from FALSE to TRUE (auto or manual)

CREATE OR REPLACE FUNCTION public.notify_shot_image_generation()
RETURNS TRIGGER AS $$
BEGIN
  -- Fire webhook to Edge Function (async notification only)
  PERFORM net.http_post(
    url := 'http://host.docker.internal:54321/functions/v1/shot-generation-webhook',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    ),
    body := jsonb_build_object(
      'type', 'shot_image_generation',
      'shot_id', NEW.id,
      'scene_id', NEW.scene_id,
      'image_prompt', NEW.image_prompt,
      'user_id', (
        SELECT s.user_id
        FROM public.stories s
        JOIN public.scenes sc ON sc.story_id = s.id
        WHERE sc.id = NEW.scene_id
      )
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER webhook_shot_image_generation
  AFTER UPDATE ON public.shots
  FOR EACH ROW
  WHEN (NEW.image_go = TRUE AND OLD.image_go = FALSE)
  EXECUTE FUNCTION public.notify_shot_image_generation();

COMMENT ON FUNCTION public.notify_shot_image_generation() IS 'Webhook that triggers image generation when image_go flag is set to TRUE';

-- ============================================================================
-- 3. AUDIO GENERATION WEBHOOK (AFTER UPDATE)
-- ============================================================================
-- Fires when audio_go changes from FALSE to TRUE

CREATE OR REPLACE FUNCTION public.notify_shot_audio_generation()
RETURNS TRIGGER AS $$
BEGIN
  -- Fire webhook to Edge Function
  PERFORM net.http_post(
    url := 'http://host.docker.internal:54321/functions/v1/shot-generation-webhook',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    ),
    body := jsonb_build_object(
      'type', 'shot_audio_generation',
      'shot_id', NEW.id,
      'scene_id', NEW.scene_id,
      'shot_script', NEW.shot_script,
      'user_id', (
        SELECT s.user_id
        FROM public.stories s
        JOIN public.scenes sc ON sc.story_id = s.id
        WHERE sc.id = NEW.scene_id
      )
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER webhook_shot_audio_generation
  AFTER UPDATE ON public.shots
  FOR EACH ROW
  WHEN (NEW.audio_go = TRUE AND OLD.audio_go = FALSE)
  EXECUTE FUNCTION public.notify_shot_audio_generation();

COMMENT ON FUNCTION public.notify_shot_audio_generation() IS 'Webhook that triggers audio generation when audio_go flag is set to TRUE';

-- ============================================================================
-- 4. VIDEO AUTO-RUN WHEN IMAGE READY (BEFORE UPDATE)
-- ============================================================================
-- Automatically sets video_go = TRUE when image becomes available

CREATE OR REPLACE FUNCTION public.auto_run_video_after_image()
RETURNS TRIGGER AS $$
DECLARE
  auto_run_video BOOLEAN;
BEGIN
  -- Only trigger if image just became available
  IF NEW.image_url IS NOT NULL
     AND OLD.image_url IS NULL
     AND NEW.video_go = FALSE THEN

    -- Check if auto-run is enabled for video
    SELECT st.auto_run_video_action INTO auto_run_video
    FROM public.story_types st
    JOIN public.stories s ON s.story_type_id = st.id
    JOIN public.scenes sc ON sc.story_id = s.id
    WHERE sc.id = NEW.scene_id;

    -- Auto-set video_go if enabled
    IF auto_run_video THEN
      NEW.video_go := TRUE;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_auto_run_video
  BEFORE UPDATE ON public.shots
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_run_video_after_image();

COMMENT ON FUNCTION public.auto_run_video_after_image() IS 'Automatically sets video_go when image_url becomes available if auto_run_video_action is enabled';

-- ============================================================================
-- 5. VIDEO GENERATION WEBHOOK (AFTER UPDATE)
-- ============================================================================
-- Fires when video_go changes from FALSE to TRUE

CREATE OR REPLACE FUNCTION public.notify_shot_video_generation()
RETURNS TRIGGER AS $$
BEGIN
  -- Fire webhook to Edge Function
  PERFORM net.http_post(
    url := 'http://host.docker.internal:54321/functions/v1/shot-generation-webhook',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    ),
    body := jsonb_build_object(
      'type', 'shot_video_generation',
      'shot_id', NEW.id,
      'scene_id', NEW.scene_id,
      'image_url', NEW.image_url,
      'video_prompt', NEW.video_prompt,
      'duration_seconds', NEW.duration_seconds,
      'user_id', (
        SELECT s.user_id
        FROM public.stories s
        JOIN public.scenes sc ON sc.story_id = s.id
        WHERE sc.id = NEW.scene_id
      )
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER webhook_shot_video_generation
  AFTER UPDATE ON public.shots
  FOR EACH ROW
  WHEN (NEW.video_go = TRUE AND OLD.video_go = FALSE)
  EXECUTE FUNCTION public.notify_shot_video_generation();

COMMENT ON FUNCTION public.notify_shot_video_generation() IS 'Webhook that triggers video generation when video_go flag is set to TRUE';

-- ============================================================================
-- 6. AUTO-APPROVE AFTER ALL MEDIA GENERATED (BEFORE UPDATE)
-- ============================================================================
-- Automatically approves shot when all media exists (if story type configured)

CREATE OR REPLACE FUNCTION public.auto_approve_shot()
RETURNS TRIGGER AS $$
DECLARE
  auto_approve BOOLEAN;
BEGIN
  -- Check if all media just became available
  IF NEW.image_url IS NOT NULL
     AND NEW.audio_url IS NOT NULL
     AND NEW.video_url IS NOT NULL
     AND NEW.approved = FALSE THEN

    -- Check if auto-approve is enabled
    SELECT st.auto_approve_shots INTO auto_approve
    FROM public.story_types st
    JOIN public.stories s ON s.story_type_id = st.id
    JOIN public.scenes sc ON sc.story_id = s.id
    WHERE sc.id = NEW.scene_id;

    -- Auto-approve if enabled
    IF auto_approve THEN
      NEW.approved := TRUE;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_auto_approve_shot
  BEFORE UPDATE ON public.shots
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_shot();

COMMENT ON FUNCTION public.auto_approve_shot() IS 'Automatically approves shot when all media (image, audio, video) exists if auto_approve_shots is enabled in story type';

-- ============================================================================
-- 7. MIX AUDIO + VIDEO WHEN APPROVED (AFTER UPDATE)
-- ============================================================================
-- Triggers shot mixing when audio + video exist AND shot is approved

CREATE OR REPLACE FUNCTION public.notify_shot_mixing()
RETURNS TRIGGER AS $$
BEGIN
  -- Trigger mixing when all conditions met
  IF NEW.audio_url IS NOT NULL
     AND NEW.video_url IS NOT NULL
     AND NEW.approved = TRUE
     AND NEW.final_shot_url IS NULL
     AND (OLD.approved = FALSE OR OLD.approved IS NULL) THEN

    -- Fire webhook to Edge Function for mixing
    PERFORM net.http_post(
      url := 'http://host.docker.internal:54321/functions/v1/shot-generation-webhook',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
      ),
      body := jsonb_build_object(
        'type', 'shot_mixing',
        'shot_id', NEW.id,
        'audio_url', NEW.audio_url,
        'video_url', NEW.video_url,
        'user_id', (
          SELECT s.user_id
          FROM public.stories s
          JOIN public.scenes sc ON sc.story_id = s.id
          WHERE sc.id = NEW.scene_id
        )
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER webhook_shot_mixing
  AFTER UPDATE ON public.shots
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_shot_mixing();

COMMENT ON FUNCTION public.notify_shot_mixing() IS 'Webhook that triggers audio+video mixing when shot is approved and all media exists';

-- ============================================================================
-- 8. AUTO-RUN INSERT TRIGGERS (AFTER INSERT)
-- ============================================================================
-- These triggers handle auto-run scenario where flags are set to TRUE during INSERT
-- (by the BEFORE INSERT trigger). Since UPDATE triggers only fire on FALSE→TRUE,
-- we need separate INSERT triggers to catch auto-run cases.

-- Image generation on INSERT (when auto-run sets image_go = TRUE)
CREATE TRIGGER webhook_shot_image_generation_insert
  AFTER INSERT ON public.shots
  FOR EACH ROW
  WHEN (NEW.image_go = TRUE)
  EXECUTE FUNCTION public.notify_shot_image_generation();

-- Audio generation on INSERT (when auto-run sets audio_go = TRUE)
CREATE TRIGGER webhook_shot_audio_generation_insert
  AFTER INSERT ON public.shots
  FOR EACH ROW
  WHEN (NEW.audio_go = TRUE)
  EXECUTE FUNCTION public.notify_shot_audio_generation();

-- Video generation on INSERT (when auto-run sets video_go = TRUE)
CREATE TRIGGER webhook_shot_video_generation_insert
  AFTER INSERT ON public.shots
  FOR EACH ROW
  WHEN (NEW.video_go = TRUE)
  EXECUTE FUNCTION public.notify_shot_video_generation();

COMMENT ON TRIGGER webhook_shot_image_generation_insert ON public.shots IS 'Fires image generation webhook when shot created with image_go = TRUE (auto-run scenario)';
COMMENT ON TRIGGER webhook_shot_audio_generation_insert ON public.shots IS 'Fires audio generation webhook when shot created with audio_go = TRUE (auto-run scenario)';
COMMENT ON TRIGGER webhook_shot_video_generation_insert ON public.shots IS 'Fires video generation webhook when shot created with video_go = TRUE (auto-run scenario)';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
