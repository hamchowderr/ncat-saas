-- Migration: faceless_generator
-- Description: Creates tables for story generation system including story_types, stories, scenes, and shots
-- This migration includes ALL fields needed for complete Airtable-compatible video generation workflow
-- Author: Generated for faceless video generation system

-- Create enum for story status
CREATE TYPE story_status AS ENUM ('draft', 'in_progress', 'completed', 'archived');

-- Create enum for scene status
CREATE TYPE scene_status AS ENUM ('planned', 'generating', 'completed', 'failed');

-- Create enum for shot status
CREATE TYPE shot_status AS ENUM ('pending', 'generating', 'completed', 'failed');

-- ====================================================================================
-- STORY_TYPES TABLE - Video Generation Templates/Blueprints
-- ====================================================================================
CREATE TABLE story_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Video Dimensions
    width INTEGER, -- e.g., 1920, 1080
    height INTEGER, -- e.g., 1080, 1920

    -- Voice Configuration
    voice_id VARCHAR(255), -- ElevenLabs voice ID
    voice_settings JSONB DEFAULT '{}', -- Voice parameters (stability, similarity, style)

    -- Feature Flags
    captions_enabled BOOLEAN DEFAULT false, -- Include captions in final output
    is_active BOOLEAN DEFAULT true,
    is_system_default BOOLEAN DEFAULT false,

    -- AI Prompt Templates (Instructions for Mastra agents)
    story_prompt_system TEXT, -- System prompt for story generation
    story_prompt_user TEXT, -- User prompt template for story generation
    scene_generation_prompt TEXT, -- Prompt for breaking story into scenes
    shot_generation_system_prompt TEXT, -- System prompt for shot generation
    shot_generation_user_prompt TEXT, -- User prompt for shot generation
    image_prompt_generation_prompt TEXT, -- How to generate image prompts from shots
    video_prompt_generation_prompt TEXT, -- How to generate video motion prompts

    -- Auto-Approval Flags (Which steps need human review)
    auto_approve_story_gen BOOLEAN DEFAULT false, -- Auto-approve AI-generated story plan
    auto_approve_shots BOOLEAN DEFAULT false, -- Auto-approve generated shots
    auto_approve_scenes BOOLEAN DEFAULT false, -- Auto-approve generated scenes
    auto_approve_story BOOLEAN DEFAULT false, -- Auto-approve final story
    auto_approve_source BOOLEAN DEFAULT false, -- Auto-approve source content processing

    -- Auto-Run Flags (Which AI actions trigger automatically)
    auto_run_image_action BOOLEAN DEFAULT false, -- Auto-generate images for shots
    auto_run_audio_action BOOLEAN DEFAULT false, -- Auto-generate audio for shots
    auto_run_video_action BOOLEAN DEFAULT false, -- Auto-generate videos for shots

    -- Flexible settings for additional configuration
    settings JSONB DEFAULT '{}',

    -- Relationships
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(name, workspace_id)
);

COMMENT ON TABLE story_types IS 'Video generation templates defining platform-specific configurations (YouTube, TikTok, Instagram)';
COMMENT ON COLUMN story_types.width IS 'Video width in pixels (1920 for landscape, 1080 for portrait/square)';
COMMENT ON COLUMN story_types.height IS 'Video height in pixels (1080 for landscape, 1920 for portrait)';
COMMENT ON COLUMN story_types.voice_id IS 'ElevenLabs voice ID for narration';
COMMENT ON COLUMN story_types.story_prompt_system IS 'System prompt for AI story generation (defines AI behavior)';
COMMENT ON COLUMN story_types.auto_approve_shots IS 'Skip human review of generated shots';
COMMENT ON COLUMN story_types.auto_run_image_action IS 'Automatically trigger image generation for shots';

-- ====================================================================================
-- STORIES TABLE - User Content Ideas / Video Projects
-- ====================================================================================
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    story_type_id UUID REFERENCES story_types(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- References auth.users
    status story_status DEFAULT 'draft',

    -- Generated File URLs
    voiceover_url TEXT, -- Full story voiceover audio
    final_video_url TEXT, -- Final assembled video without captions
    final_video_with_captions_url TEXT, -- Final video with captions burned in
    source_content_url TEXT, -- Original source content (article, script, etc.)
    srt_url TEXT, -- Subtitle/caption file URL

    -- Content Fields
    story_content TEXT, -- Full story narrative/outline before script generation
    script TEXT, -- Generated narration script (sent to voice AI)

    -- Workflow Control
    active_story BOOLEAN DEFAULT false, -- Is this the currently active story?
    approved BOOLEAN DEFAULT false, -- Has the story been approved for generation?
    approve_source BOOLEAN DEFAULT false, -- Source content approval flag
    sid SERIAL, -- Auto-incrementing story number

    -- Generation Timing (for progress tracking and performance metrics)
    generation_started_at TIMESTAMPTZ,
    generation_completed_at TIMESTAMPTZ,
    total_generation_time_seconds INTEGER, -- Total time to generate complete video

    -- Flexible data storage
    settings JSONB DEFAULT '{}', -- Story-specific configuration overrides
    metadata JSONB DEFAULT '{}', -- Additional metadata (tags, categories, etc.)

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE stories IS 'User video generation projects with associated scenes and shots';
COMMENT ON COLUMN stories.voiceover_url IS 'Full story narration audio (spans all scenes)';
COMMENT ON COLUMN stories.final_video_url IS 'Complete video without captions';
COMMENT ON COLUMN stories.final_video_with_captions_url IS 'Final deliverable with burned-in captions';
COMMENT ON COLUMN stories.srt_url IS 'URL to generated SRT caption file';
COMMENT ON COLUMN stories.story_content IS 'Full story narrative/outline before script generation';
COMMENT ON COLUMN stories.script IS 'Generated voiceover script for narration';
COMMENT ON COLUMN stories.active_story IS 'Flags the story currently being worked on';
COMMENT ON COLUMN stories.approve_source IS 'Has source content been approved for processing';
COMMENT ON COLUMN stories.sid IS 'Sequential story number for display/tracking';
COMMENT ON COLUMN stories.generation_started_at IS 'When generation workflow began';
COMMENT ON COLUMN stories.total_generation_time_seconds IS 'Complete generation time for metrics/billing';

-- ====================================================================================
-- SCENES TABLE - Story Subdivisions (Acts/Sequences)
-- ====================================================================================
CREATE TABLE scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    sequence_number INTEGER NOT NULL, -- Order within the story
    duration_seconds INTEGER, -- Estimated scene duration
    status scene_status DEFAULT 'planned',

    -- Generated File URLs
    audio_url TEXT, -- Scene-level audio (narration spanning multiple shots)
    video_url TEXT, -- All shots concatenated together
    final_scene_url TEXT, -- Video + audio composed

    -- Uploaded File URLs
    video_upload_url TEXT, -- Manually uploaded scene video
    audio_upload_url TEXT, -- Manually uploaded scene audio

    -- Content
    scene_script TEXT, -- Full narration text for this scene

    -- Workflow Control
    approved BOOLEAN DEFAULT false, -- Has this scene been approved?

    -- Flexible data storage
    settings JSONB DEFAULT '{}', -- Scene-specific overrides
    generated_content JSONB DEFAULT '{}', -- AI-generated metadata

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(story_id, sequence_number)
);

COMMENT ON TABLE scenes IS 'Story subdivisions containing related shots';
COMMENT ON COLUMN scenes.audio_url IS 'Scene-level narration that spans multiple shots';
COMMENT ON COLUMN scenes.video_url IS 'All shot videos concatenated';
COMMENT ON COLUMN scenes.final_scene_url IS 'Scene video with audio composed';
COMMENT ON COLUMN scenes.video_upload_url IS 'Manually uploaded scene video (separate from AI-generated)';
COMMENT ON COLUMN scenes.audio_upload_url IS 'Manually uploaded scene audio (separate from AI-generated)';
COMMENT ON COLUMN scenes.scene_script IS 'Full narration text for this scene (combines shot scripts)';
COMMENT ON COLUMN scenes.sequence_number IS 'Order of scene within story (1, 2, 3...)';

-- ====================================================================================
-- SHOTS TABLE - Individual Visual Moments (Smallest Unit)
-- ====================================================================================
CREATE TABLE shots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    sequence_number INTEGER NOT NULL, -- Order within the scene
    duration_seconds INTEGER, -- Shot duration
    shot_type VARCHAR(100), -- e.g., 'close_up', 'wide_shot', 'medium_shot'
    camera_angle VARCHAR(100), -- e.g., 'eye_level', 'high_angle', 'low_angle'
    status shot_status DEFAULT 'pending',

    -- Generated Asset URLs (4-step generation process)
    image_url TEXT, -- 1. AI-generated static image (DALL-E, Midjourney)
    audio_url TEXT, -- 2. Voiceover narration (ElevenLabs)
    video_url TEXT, -- 3. Animated image (image-to-video AI)
    final_shot_url TEXT, -- 4. Audio + video composed = ready shot
    thumbnail_url TEXT, -- Preview thumbnail

    -- AI Generation Prompts
    shot_script TEXT, -- The actual narration text for this shot (sent to ElevenLabs)
    image_prompt TEXT, -- DALL-E/Midjourney prompt
    audio_prompt TEXT, -- Voice style instructions
    video_prompt TEXT, -- Motion instructions (zoom, pan, duration)
    cref TEXT, -- Character reference URL for consistent image style
    final_audio_prompt TEXT, -- Final audio generation prompt
    final_video_prompt TEXT, -- Final video generation prompt

    -- Uploaded File URLs
    image_upload_url TEXT, -- Manually uploaded image (separate from AI-generated)
    video_upload_url TEXT, -- Manually uploaded video (separate from AI-generated)
    audio_upload_url TEXT, -- Manually uploaded audio (separate from AI-generated)

    -- Metadata
    image_selector TEXT, -- Selected image variant (1, 2, 3, or 4)
    sort INTEGER, -- Manual sort order within scene

    -- Workflow Control
    approved BOOLEAN DEFAULT false, -- Has this shot been manually approved?
    image_go BOOLEAN DEFAULT false, -- Trigger image generation
    audio_go BOOLEAN DEFAULT false, -- Trigger audio generation
    video_go BOOLEAN DEFAULT false, -- Trigger video generation

    -- Flexible data storage
    settings JSONB DEFAULT '{}', -- Shot-specific overrides
    generated_content JSONB DEFAULT '{}', -- AI-generated metadata (task IDs, etc.)

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(scene_id, sequence_number)
);

COMMENT ON TABLE shots IS 'Individual visual moments - smallest unit of video generation';
COMMENT ON COLUMN shots.image_url IS 'AI-generated static image from DALL-E/Midjourney';
COMMENT ON COLUMN shots.audio_url IS 'Voiceover narration from ElevenLabs';
COMMENT ON COLUMN shots.video_url IS 'Animated version of image (image-to-video AI)';
COMMENT ON COLUMN shots.final_shot_url IS 'Composed audio + video = finished shot';
COMMENT ON COLUMN shots.shot_script IS 'Narration text for this shot (sent to voice AI)';
COMMENT ON COLUMN shots.image_prompt IS 'Prompt for image AI (e.g., DALL-E)';
COMMENT ON COLUMN shots.video_prompt IS 'Motion instructions (zoom in, pan left, 3 seconds)';
COMMENT ON COLUMN shots.cref IS 'Character reference URL for consistent image style across shots';
COMMENT ON COLUMN shots.final_audio_prompt IS 'Final audio generation prompt';
COMMENT ON COLUMN shots.final_video_prompt IS 'Final video generation prompt';
COMMENT ON COLUMN shots.image_upload_url IS 'Manually uploaded image (separate from AI-generated)';
COMMENT ON COLUMN shots.video_upload_url IS 'Manually uploaded video (separate from AI-generated)';
COMMENT ON COLUMN shots.audio_upload_url IS 'Manually uploaded audio (separate from AI-generated)';
COMMENT ON COLUMN shots.image_selector IS 'Selected image variant (1, 2, 3, or 4)';
COMMENT ON COLUMN shots.sort IS 'Manual sort order within scene';
COMMENT ON COLUMN shots.image_go IS 'Checkbox to trigger image generation';
COMMENT ON COLUMN shots.approved IS 'Manual approval before including in scene';

-- ====================================================================================
-- INDEXES FOR PERFORMANCE
-- ====================================================================================

-- Story indexes
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_story_type_id ON stories(story_type_id);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_active ON stories(active_story) WHERE active_story = true;
CREATE INDEX idx_stories_created_at ON stories(created_at);
CREATE INDEX idx_stories_generation_time ON stories(generation_started_at, generation_completed_at);

-- Scene indexes
CREATE INDEX idx_scenes_story_id ON scenes(story_id);
CREATE INDEX idx_scenes_sequence_number ON scenes(story_id, sequence_number);
CREATE INDEX idx_scenes_status ON scenes(status);
CREATE INDEX idx_scenes_approved ON scenes(approved) WHERE approved = false;

-- Shot indexes
CREATE INDEX idx_shots_scene_id ON shots(scene_id);
CREATE INDEX idx_shots_sequence_number ON shots(scene_id, sequence_number);
CREATE INDEX idx_shots_status ON shots(status);
CREATE INDEX idx_shots_approved ON shots(approved) WHERE approved = false;
CREATE INDEX idx_shots_pending_generation ON shots(image_go, audio_go, video_go)
    WHERE image_go = true OR audio_go = true OR video_go = true;

-- Story type indexes
CREATE INDEX idx_story_types_active ON story_types(is_active) WHERE is_active = true;
CREATE INDEX idx_story_types_system ON story_types(is_system_default);
CREATE INDEX idx_story_types_workspace ON story_types(workspace_id);

-- ====================================================================================
-- TRIGGERS
-- ====================================================================================

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql' SET search_path = '';

-- Add updated_at triggers
CREATE TRIGGER update_story_types_updated_at BEFORE UPDATE ON story_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scenes_updated_at BEFORE UPDATE ON scenes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shots_updated_at BEFORE UPDATE ON shots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================================
-- ROW LEVEL SECURITY
-- ====================================================================================

-- Enable RLS
ALTER TABLE story_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shots ENABLE ROW LEVEL SECURITY;

-- Story Types Policies (system defaults viewable by all, workspace types scoped)
CREATE POLICY "Users can view system defaults and their workspace story types"
  ON story_types FOR SELECT
  USING (
    is_system_default = true
    OR workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE workspace_member_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert story types for their workspace"
  ON story_types FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE workspace_member_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their workspace story types"
  ON story_types FOR UPDATE
  USING (
    -- Allow if workspace_id is NULL (starter templates - any authenticated user)
    workspace_id IS NULL
    OR
    -- Allow if user is member of the workspace
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE workspace_member_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their workspace story types"
  ON story_types FOR DELETE
  USING (
    -- Allow if workspace_id is NULL (starter templates - any authenticated user)
    workspace_id IS NULL
    OR
    -- Allow if user is member of the workspace
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE workspace_member_id = auth.uid()
    )
  );

-- Stories Policies
CREATE POLICY "Users can view their own stories"
    ON stories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stories"
    ON stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stories"
    ON stories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own stories"
    ON stories FOR DELETE USING (auth.uid() = user_id);

-- Scenes Policies
CREATE POLICY "Users can view scenes from their stories"
    ON scenes FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stories
            WHERE stories.id = scenes.story_id
            AND stories.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can manage scenes from their stories"
    ON scenes FOR ALL USING (
        EXISTS (
            SELECT 1 FROM stories
            WHERE stories.id = scenes.story_id
            AND stories.user_id = auth.uid()
        )
    );

-- Shots Policies
CREATE POLICY "Users can view shots from their stories"
    ON shots FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM scenes
            JOIN stories ON stories.id = scenes.story_id
            WHERE scenes.id = shots.scene_id
            AND stories.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can manage shots from their stories"
    ON shots FOR ALL USING (
        EXISTS (
            SELECT 1 FROM scenes
            JOIN stories ON stories.id = scenes.story_id
            WHERE scenes.id = shots.scene_id
            AND stories.user_id = auth.uid()
        )
    );

-- ====================================================================================
-- FILE MANAGEMENT - Links to Existing Files Table
-- ====================================================================================

-- ============================================================================
-- 1. SHOT_FILES JUNCTION TABLE
-- ============================================================================
-- Links shots to files with specific roles (image, audio, video, final_shot)
CREATE TABLE shot_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shot_id UUID NOT NULL REFERENCES shots(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    file_role TEXT NOT NULL CHECK (file_role IN ('image', 'audio', 'video', 'final_shot')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(shot_id, file_id, file_role)
);

-- Create indexes for efficient lookups
CREATE INDEX idx_shot_files_shot_id ON shot_files(shot_id);
CREATE INDEX idx_shot_files_file_id ON shot_files(file_id);
CREATE INDEX idx_shot_files_role ON shot_files(file_role);
CREATE INDEX idx_shot_files_shot_role ON shot_files(shot_id, file_role);

-- Add comments for documentation
COMMENT ON TABLE shot_files IS 'Links shots to their generated/uploaded image, audio, video, and final files';
COMMENT ON COLUMN shot_files.file_role IS 'Role of file: image, audio, video, or final_shot';

-- ============================================================================
-- 2. SCENE_FILES JUNCTION TABLE
-- ============================================================================
-- Links scenes to files with specific roles (audio, video, final_scene)
CREATE TABLE scene_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    file_role TEXT NOT NULL CHECK (file_role IN ('audio', 'video', 'final_scene')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(scene_id, file_id, file_role)
);

-- Create indexes for efficient lookups
CREATE INDEX idx_scene_files_scene_id ON scene_files(scene_id);
CREATE INDEX idx_scene_files_file_id ON scene_files(file_id);
CREATE INDEX idx_scene_files_role ON scene_files(file_role);
CREATE INDEX idx_scene_files_scene_role ON scene_files(scene_id, file_role);

-- Add comments for documentation
COMMENT ON TABLE scene_files IS 'Links scenes to their generated audio, video, and final scene files';
COMMENT ON COLUMN scene_files.file_role IS 'Role of file: audio, video, or final_scene';

-- ============================================================================
-- 3. STORY_FILES JUNCTION TABLE
-- ============================================================================
-- Links stories to files with specific roles (audio, video, final_video, final_with_captions)
CREATE TABLE story_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    file_role TEXT NOT NULL CHECK (file_role IN ('voiceover', 'video', 'final_video', 'final_with_captions')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id, file_id, file_role)
);

-- Create indexes for efficient lookups
CREATE INDEX idx_story_files_story_id ON story_files(story_id);
CREATE INDEX idx_story_files_file_id ON story_files(file_id);
CREATE INDEX idx_story_files_role ON story_files(file_role);
CREATE INDEX idx_story_files_story_role ON story_files(story_id, file_role);

-- Add comments for documentation
COMMENT ON TABLE story_files IS 'Links stories to their voiceover, video, and final output files';
COMMENT ON COLUMN story_files.file_role IS 'Role of file: voiceover, video, final_video, or final_with_captions';

-- ============================================================================
-- 4. ROW LEVEL SECURITY POLICIES FOR FILE JUNCTION TABLES
-- ============================================================================

-- Enable RLS on junction tables
ALTER TABLE shot_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_files ENABLE ROW LEVEL SECURITY;

-- shot_files policies
CREATE POLICY "Users can view shot_files for their stories" ON shot_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM shots
            JOIN scenes ON scenes.id = shots.scene_id
            JOIN stories ON stories.id = scenes.story_id
            WHERE shots.id = shot_files.shot_id
            AND stories.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert shot_files for their stories" ON shot_files
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM shots
            JOIN scenes ON scenes.id = shots.scene_id
            JOIN stories ON stories.id = scenes.story_id
            WHERE shots.id = shot_files.shot_id
            AND stories.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete shot_files for their stories" ON shot_files
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM shots
            JOIN scenes ON scenes.id = shots.scene_id
            JOIN stories ON stories.id = scenes.story_id
            WHERE shots.id = shot_files.shot_id
            AND stories.user_id = auth.uid()
        )
    );

-- scene_files policies
CREATE POLICY "Users can view scene_files for their stories" ON scene_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM scenes
            JOIN stories ON stories.id = scenes.story_id
            WHERE scenes.id = scene_files.scene_id
            AND stories.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert scene_files for their stories" ON scene_files
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM scenes
            JOIN stories ON stories.id = scenes.story_id
            WHERE scenes.id = scene_files.scene_id
            AND stories.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete scene_files for their stories" ON scene_files
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM scenes
            JOIN stories ON stories.id = scenes.story_id
            WHERE scenes.id = scene_files.scene_id
            AND stories.user_id = auth.uid()
        )
    );

-- story_files policies
CREATE POLICY "Users can view their own story_files" ON story_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stories
            WHERE stories.id = story_files.story_id
            AND stories.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own story_files" ON story_files
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM stories
            WHERE stories.id = story_files.story_id
            AND stories.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own story_files" ON story_files
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM stories
            WHERE stories.id = story_files.story_id
            AND stories.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 5. HELPER VIEWS FOR FILES
-- ============================================================================

-- View: Shots with their files
CREATE OR REPLACE VIEW shots_with_files AS
SELECT
    s.*,
    (
        SELECT json_build_object(
            'file_id', f.id,
            'file_name', f.file_name,
            'url', f.url,
            'file_type', f.file_type
        )
        FROM shot_files sf
        JOIN files f ON f.id = sf.file_id
        WHERE sf.shot_id = s.id AND sf.file_role = 'image'
        LIMIT 1
    ) AS image_file,
    (
        SELECT json_build_object(
            'file_id', f.id,
            'file_name', f.file_name,
            'url', f.url,
            'file_type', f.file_type
        )
        FROM shot_files sf
        JOIN files f ON f.id = sf.file_id
        WHERE sf.shot_id = s.id AND sf.file_role = 'audio'
        LIMIT 1
    ) AS audio_file,
    (
        SELECT json_build_object(
            'file_id', f.id,
            'file_name', f.file_name,
            'url', f.url,
            'file_type', f.file_type
        )
        FROM shot_files sf
        JOIN files f ON f.id = sf.file_id
        WHERE sf.shot_id = s.id AND sf.file_role = 'video'
        LIMIT 1
    ) AS video_file,
    (
        SELECT json_build_object(
            'file_id', f.id,
            'file_name', f.file_name,
            'url', f.url,
            'file_type', f.file_type
        )
        FROM shot_files sf
        JOIN files f ON f.id = sf.file_id
        WHERE sf.shot_id = s.id AND sf.file_role = 'final_shot'
        LIMIT 1
    ) AS final_shot_file
FROM shots s;

-- View: Scenes with their files
CREATE OR REPLACE VIEW scenes_with_files AS
SELECT
    sc.*,
    (
        SELECT json_build_object(
            'file_id', f.id,
            'file_name', f.file_name,
            'url', f.url,
            'file_type', f.file_type
        )
        FROM scene_files scf
        JOIN files f ON f.id = scf.file_id
        WHERE scf.scene_id = sc.id AND scf.file_role = 'audio'
        LIMIT 1
    ) AS audio_file,
    (
        SELECT json_build_object(
            'file_id', f.id,
            'file_name', f.file_name,
            'url', f.url,
            'file_type', f.file_type
        )
        FROM scene_files scf
        JOIN files f ON f.id = scf.file_id
        WHERE scf.scene_id = sc.id AND scf.file_role = 'video'
        LIMIT 1
    ) AS video_file,
    (
        SELECT json_build_object(
            'file_id', f.id,
            'file_name', f.file_name,
            'url', f.url,
            'file_type', f.file_type
        )
        FROM scene_files scf
        JOIN files f ON f.id = scf.file_id
        WHERE scf.scene_id = sc.id AND scf.file_role = 'final_scene'
        LIMIT 1
    ) AS final_scene_file
FROM scenes sc;

-- View: Stories with their files
CREATE OR REPLACE VIEW stories_with_files AS
SELECT
    st.*,
    (
        SELECT json_build_object(
            'file_id', f.id,
            'file_name', f.file_name,
            'url', f.url,
            'file_type', f.file_type
        )
        FROM story_files stf
        JOIN files f ON f.id = stf.file_id
        WHERE stf.story_id = st.id AND stf.file_role = 'voiceover'
        LIMIT 1
    ) AS voiceover_file,
    (
        SELECT json_build_object(
            'file_id', f.id,
            'file_name', f.file_name,
            'url', f.url,
            'file_type', f.file_type
        )
        FROM story_files stf
        JOIN files f ON f.id = stf.file_id
        WHERE stf.story_id = st.id AND stf.file_role = 'final_video'
        LIMIT 1
    ) AS final_video_file,
    (
        SELECT json_build_object(
            'file_id', f.id,
            'file_name', f.file_name,
            'url', f.url,
            'file_type', f.file_type
        )
        FROM story_files stf
        JOIN files f ON f.id = stf.file_id
        WHERE stf.story_id = st.id AND stf.file_role = 'final_with_captions'
        LIMIT 1
    ) AS final_with_captions_file
FROM stories st;

COMMENT ON VIEW shots_with_files IS 'Shots with their image, audio, video, and final shot files';
COMMENT ON VIEW scenes_with_files IS 'Scenes with their audio, video, and final scene files';
COMMENT ON VIEW stories_with_files IS 'Stories with their voiceover, final video, and captioned video files';

-- ====================================================================================
-- AGENT JOB TRACKING - Extends Existing Jobs Table
-- ====================================================================================

-- ============================================================================
-- 1. EXTEND JOBS TABLE FOR AGENT TRACKING
-- ============================================================================

-- Add columns to track agent triggers and entity relationships
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS triggered_by VARCHAR(50) DEFAULT 'user', -- 'user', 'agent', 'automation'
  ADD COLUMN IF NOT EXISTS agent_name VARCHAR(255), -- Which Mastra agent triggered this
  ADD COLUMN IF NOT EXISTS agent_action VARCHAR(100), -- What action the agent was performing
  ADD COLUMN IF NOT EXISTS agent_context JSONB DEFAULT '{}', -- Additional agent context

  -- Video generation entity tracking (polymorphic relationship)
  ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50), -- 'story', 'scene', 'shot'
  ADD COLUMN IF NOT EXISTS entity_id UUID, -- ID of the story/scene/shot
  ADD COLUMN IF NOT EXISTS entity_role VARCHAR(50); -- 'image', 'audio', 'video', 'final_shot', 'voiceover', 'final_video', etc.

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_jobs_triggered_by ON jobs(triggered_by);
CREATE INDEX IF NOT EXISTS idx_jobs_agent_name ON jobs(agent_name);
CREATE INDEX IF NOT EXISTS idx_jobs_entity_type_id ON jobs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_jobs_entity_role ON jobs(entity_role);

-- Add comments for documentation
COMMENT ON COLUMN jobs.triggered_by IS 'Who/what triggered this job: user (manual), agent (AI), automation (scheduled)';
COMMENT ON COLUMN jobs.agent_name IS 'Name of Mastra agent that triggered this job (if agent-triggered)';
COMMENT ON COLUMN jobs.agent_action IS 'High-level action the agent was performing (e.g., generate_image, assemble_video)';
COMMENT ON COLUMN jobs.agent_context IS 'Additional context from agent (prompts, parameters, decision reasoning)';
COMMENT ON COLUMN jobs.entity_type IS 'Type of video generation entity: story, scene, or shot';
COMMENT ON COLUMN jobs.entity_id IS 'ID of the story, scene, or shot this job relates to';
COMMENT ON COLUMN jobs.entity_role IS 'Role of output file: image, audio, video, final_shot, voiceover, final_video, final_with_captions';

-- ============================================================================
-- 2. CREATE HELPER VIEWS FOR AGENT JOBS
-- ============================================================================

-- View: Jobs triggered by AI agents
CREATE OR REPLACE VIEW agent_jobs AS
SELECT
    j.*,
    CASE
        WHEN j.entity_type = 'story' THEN (SELECT title FROM stories WHERE id = j.entity_id)
        WHEN j.entity_type = 'scene' THEN (SELECT title FROM scenes WHERE id = j.entity_id)
        WHEN j.entity_type = 'shot' THEN (SELECT title FROM shots WHERE id = j.entity_id)
    END AS entity_title
FROM jobs j
WHERE j.triggered_by = 'agent';

COMMENT ON VIEW agent_jobs IS 'Jobs triggered by AI agents with entity title lookups';

-- View: Jobs grouped by agent
CREATE OR REPLACE VIEW jobs_by_agent AS
SELECT
    agent_name,
    COUNT(*) AS total_jobs,
    COUNT(*) FILTER (WHERE processing_status = 'completed') AS completed_jobs,
    COUNT(*) FILTER (WHERE processing_status = 'failed') AS failed_jobs,
    COUNT(*) FILTER (WHERE processing_status = 'processing') AS processing_jobs,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) FILTER (WHERE processing_status = 'completed') AS avg_processing_time_seconds,
    MAX(created_at) AS last_job_created
FROM jobs
WHERE triggered_by = 'agent' AND agent_name IS NOT NULL
GROUP BY agent_name;

COMMENT ON VIEW jobs_by_agent IS 'Agent performance metrics grouped by agent name';

-- View: Video generation jobs with entity details
CREATE OR REPLACE VIEW video_generation_jobs AS
SELECT
    j.*,
    CASE
        WHEN j.entity_type = 'story' THEN (
            SELECT json_build_object(
                'id', s.id,
                'title', s.title,
                'status', s.status,
                'story_type_id', s.story_type_id
            )
            FROM stories s WHERE s.id = j.entity_id
        )
        WHEN j.entity_type = 'scene' THEN (
            SELECT json_build_object(
                'id', sc.id,
                'title', sc.title,
                'sequence_number', sc.sequence_number,
                'story_id', sc.story_id
            )
            FROM scenes sc WHERE sc.id = j.entity_id
        )
        WHEN j.entity_type = 'shot' THEN (
            SELECT json_build_object(
                'id', sh.id,
                'title', sh.title,
                'sequence_number', sh.sequence_number,
                'scene_id', sh.scene_id,
                'shot_type', sh.shot_type
            )
            FROM shots sh WHERE sh.id = j.entity_id
        )
    END AS entity_details,
    (
        SELECT json_agg(
            json_build_object(
                'file_id', f.id,
                'file_name', f.file_name,
                'url', f.url,
                'file_type', f.file_type,
                'role', jf.file_role
            )
        )
        FROM job_files jf
        JOIN files f ON f.id = jf.file_id
        WHERE jf.job_id = j.id AND jf.file_role = 'output'
    ) AS output_files
FROM jobs j
WHERE j.entity_type IN ('story', 'scene', 'shot');

COMMENT ON VIEW video_generation_jobs IS 'Jobs related to video generation with full entity and file details';

-- ============================================================================
-- 3. CREATE FUNCTION TO AUTOMATICALLY LINK FILES TO ENTITIES
-- ============================================================================

-- Function that runs after webhook updates a job to automatically link files
CREATE OR REPLACE FUNCTION auto_link_job_files_to_entities()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if job is completed and has entity tracking
    IF NEW.processing_status = 'completed' AND NEW.entity_type IS NOT NULL AND NEW.entity_id IS NOT NULL THEN

        -- Link output files to the appropriate entity
        IF NEW.entity_type = 'shot' THEN
            INSERT INTO shot_files (shot_id, file_id, file_role)
            SELECT
                NEW.entity_id,
                jf.file_id,
                COALESCE(NEW.entity_role, 'video') -- Default to video if role not specified
            FROM job_files jf
            WHERE jf.job_id = NEW.id
              AND jf.file_role = 'output'
            ON CONFLICT (shot_id, file_id, file_role) DO NOTHING;

        ELSIF NEW.entity_type = 'scene' THEN
            INSERT INTO scene_files (scene_id, file_id, file_role)
            SELECT
                NEW.entity_id,
                jf.file_id,
                COALESCE(NEW.entity_role, 'video')
            FROM job_files jf
            WHERE jf.job_id = NEW.id
              AND jf.file_role = 'output'
            ON CONFLICT (scene_id, file_id, file_role) DO NOTHING;

        ELSIF NEW.entity_type = 'story' THEN
            INSERT INTO story_files (story_id, file_id, file_role)
            SELECT
                NEW.entity_id,
                jf.file_id,
                COALESCE(NEW.entity_role, 'final_video')
            FROM job_files jf
            WHERE jf.job_id = NEW.id
              AND jf.file_role = 'output'
            ON CONFLICT (story_id, file_id, file_role) DO NOTHING;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Add trigger to auto-link files when job completes
CREATE TRIGGER trigger_auto_link_job_files
    AFTER UPDATE ON jobs
    FOR EACH ROW
    WHEN (NEW.processing_status = 'completed' AND OLD.processing_status != 'completed')
    EXECUTE FUNCTION auto_link_job_files_to_entities();

COMMENT ON FUNCTION auto_link_job_files_to_entities() IS 'Automatically links job output files to video generation entities when job completes';
COMMENT ON TRIGGER trigger_auto_link_job_files ON jobs IS 'Triggers automatic file linking when job status changes to completed';

-- ============================================================================
-- 4. CREATE HELPER FUNCTIONS FOR AGENTS
-- ============================================================================

-- Function to create a tracked job (for use by Edge Functions when agent calls them)
CREATE OR REPLACE FUNCTION create_agent_tracked_job(
    p_nca_job_id TEXT,
    p_nca_endpoint TEXT,
    p_user_id UUID,
    p_agent_name TEXT,
    p_agent_action TEXT,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_entity_role TEXT DEFAULT NULL,
    p_agent_context JSONB DEFAULT '{}'::JSONB
) RETURNS UUID AS $$
DECLARE
    v_job_id UUID;
BEGIN
    INSERT INTO jobs (
        nca_job_id,
        nca_endpoint,
        user_id,
        triggered_by,
        agent_name,
        agent_action,
        entity_type,
        entity_id,
        entity_role,
        agent_context,
        processing_status
    ) VALUES (
        p_nca_job_id,
        p_nca_endpoint,
        p_user_id,
        'agent',
        p_agent_name,
        p_agent_action,
        p_entity_type,
        p_entity_id,
        p_entity_role,
        p_agent_context,
        'pending'
    ) RETURNING id INTO v_job_id;

    RETURN v_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION create_agent_tracked_job IS 'Helper function for Edge Functions to create agent-tracked jobs with entity relationships';
