-- ==============================================
-- SEED FILE 03: STORY TYPES (VIDEO GENERATION TEMPLATES)
-- ==============================================
-- Creates story type templates for faceless video generation.
-- Includes 4 system-default templates + 1 custom workspace template.
--
-- Story types define:
-- - Video dimensions (width x height)
-- - Voice configuration (ElevenLabs voice IDs)
-- - AI prompts for story/scene/shot generation
-- - Auto-approval and auto-run settings
-- ==============================================

INSERT INTO public.story_types (
    id, name, description, width, height, voice_id, captions_enabled, is_active, workspace_id, is_system_default,
    story_prompt_system, story_prompt_user, scene_generation_prompt,
    shot_generation_system_prompt, shot_generation_user_prompt,
    image_prompt_generation_prompt, video_prompt_generation_prompt,
    created_at, updated_at
) VALUES
    -- ==============================================
    -- 1. CLASSIC DRAMATIC MOVIE (System Default)
    -- ==============================================
    (
        '10000000-0000-0000-0000-000000000001'::uuid,
        'Classic Dramatic Movie',
        'Classic cinematic format - horizontal 9:16 for dramatic storytelling',
        1080, 1920, 'alloy', false, true, NULL, true,
        'You are a creative storytelling AI assistant. Generate compelling dramatic movie stories with rich narratives and character development.',
        'Create a dramatic movie story outline based on the following theme or topic.',
        'Break down the story into engaging scenes with clear narrative progression and emotional beats.',
        'You are a shot composition expert. Generate detailed shot descriptions for cinematic storytelling.',
        'Create specific shot descriptions for each scene, including camera angles, movements, and visual composition.',
        'Generate detailed image prompts for AI image generation, focusing on cinematic dramatic lighting and composition.',
        'Generate video generation prompts that emphasize dramatic cinematography and emotional storytelling.',
        NOW(), NOW()
    ),
    -- ==============================================
    -- 2. COMIC BOOK NEWS (System Default)
    -- ==============================================
    (
        '10000000-0000-0000-0000-000000000002'::uuid,
        'Comic Book News',
        'Vertical format optimized for social media comic-style content',
        1080, 1920, 'echo', false, true, NULL, true,
        'You are a news storytelling AI assistant specializing in comic book style narratives. Create engaging, punchy news stories.',
        'Create a comic book style news story based on the following topic or news item.',
        'Break down the news story into dynamic comic book style panels/scenes with visual impact.',
        'You are a comic book panel expert. Generate shot descriptions with bold, graphic compositions.',
        'Create comic book style shots with dramatic angles, bold colors, and dynamic framing.',
        'Generate image prompts in comic book art style with bold lines, vibrant colors, and dramatic compositions.',
        'Generate video prompts that emphasize comic book aesthetics and dynamic transitions.',
        NOW(), NOW()
    ),
    -- ==============================================
    -- 3. FACELESS YOUTUBE VIDEO (System Default)
    -- ==============================================
    (
        '10000000-0000-0000-0000-000000000003'::uuid,
        'Faceless YouTube Video',
        'Landscape format for faceless YouTube content creation',
        1920, 1080, 'nova', false, true, NULL, true,
        'You are a YouTube content AI assistant. Create engaging, informative video scripts optimized for viewer retention.',
        'Create a YouTube video script on the following topic, with strong hooks and engaging narrative flow.',
        'Break down the video into scenes with clear topic progression and viewer engagement in mind.',
        'You are a YouTube video composition expert. Generate shots optimized for viewer attention and visual interest.',
        'Create shot descriptions that work well for faceless content, focusing on visuals, text overlays, and b-roll.',
        'Generate image prompts suitable for YouTube thumbnails and video content - bold, clear, and attention-grabbing.',
        'Generate video prompts optimized for YouTube content - clear visuals, good pacing, and professional presentation.',
        NOW(), NOW()
    ),
    -- ==============================================
    -- 4. INSTALL HELPER (System Default)
    -- ==============================================
    (
        '10000000-0000-0000-0000-000000000004'::uuid,
        'INSTALL HELPER (story type)',
        'Helper template for installation and setup videos',
        1080, 1920, 'alloy', false, true, NULL, true,
        'You are a technical instruction AI assistant. Create clear, step-by-step installation guides.',
        'Create an installation guide for the following software or tool.',
        'Break down the installation process into clear, sequential steps.',
        'You are a technical documentation expert. Generate clear instructional shot descriptions.',
        'Create shots that clearly show each installation step with appropriate UI elements and indicators.',
        'Generate image prompts for clear, instructional visuals showing software interfaces and installation steps.',
        'Generate video prompts that emphasize clarity and step-by-step instruction.',
        NOW(), NOW()
    ),
    -- ==============================================
    -- 5. TEAM SOCIAL MEDIA REEL (Custom Workspace Template)
    -- ==============================================
    (
        '10000000-0000-0000-0000-000000000005'::uuid,
        'Team Social Media Reel',
        'Custom template for Team workspace - optimized for short-form social media content',
        1080, 1920, 'fable', false, true,
        '00000000-0000-0000-0000-000000000003'::uuid, -- Team workspace ID
        false, -- Not a system default
        'You are a social media content AI assistant. Create engaging, viral-worthy short-form video content.',
        'Create a social media reel script on the following topic, optimized for maximum engagement and shares.',
        'Break down the reel into fast-paced scenes with strong hooks and retention techniques.',
        'You are a social media video expert. Generate shots optimized for mobile viewing and quick engagement.',
        'Create shots with dynamic transitions, bold text overlays, and attention-grabbing visuals.',
        'Generate image prompts for social media content - trendy, colorful, and shareable.',
        'Generate video prompts with fast-paced movements and dynamic transitions for social media.',
        NOW(), NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- SUMMARY
-- ==============================================
-- System Defaults (4):
--   1. Classic Dramatic Movie (1080x1920, voice: alloy)
--   2. Comic Book News (1080x1920, voice: echo)
--   3. Faceless YouTube Video (1920x1080, voice: nova)
--   4. INSTALL HELPER (1080x1920, voice: alloy)
--
-- Custom Workspace Templates (1):
--   5. Team Social Media Reel (1080x1920, voice: fable, Team workspace)
--
-- Total story types: 5
-- ==============================================
