-- Migration: faceless_generator
-- Description: Creates tables for story generation system including story_types, stories, scenes, and shots
-- Author: Generated for faceless video generation system

-- Create enum for story status
CREATE TYPE story_status AS ENUM ('draft', 'in_progress', 'completed', 'archived');

-- Create enum for scene status
CREATE TYPE scene_status AS ENUM ('planned', 'generating', 'completed', 'failed');

-- Create enum for shot status
CREATE TYPE shot_status AS ENUM ('pending', 'generating', 'completed', 'failed');

-- Create story_types table (fourth in preferred order, no dependencies)
CREATE TABLE story_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create stories table (third in preferred order but created after story_types due to FK dependency)
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    story_type_id UUID REFERENCES story_types(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- Assuming this references auth.users
    status story_status DEFAULT 'draft',
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scenes table (second in preferred order but created after stories due to FK dependency)
CREATE TABLE scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    sequence_number INTEGER NOT NULL,
    duration_seconds INTEGER, -- Estimated duration in seconds
    status scene_status DEFAULT 'planned',
    settings JSONB DEFAULT '{}',
    generated_content JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id, sequence_number)
);

-- Create shots table (first in preferred order but created after scenes due to FK dependency)
CREATE TABLE shots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    sequence_number INTEGER NOT NULL,
    duration_seconds INTEGER, -- Duration of this specific shot
    shot_type VARCHAR(100), -- e.g., 'close_up', 'wide_shot', 'medium_shot'
    camera_angle VARCHAR(100), -- e.g., 'eye_level', 'high_angle', 'low_angle'
    status shot_status DEFAULT 'pending',
    settings JSONB DEFAULT '{}',
    generated_content JSONB DEFAULT '{}',
    video_url TEXT, -- URL to generated video file
    thumbnail_url TEXT, -- URL to thumbnail image
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(scene_id, sequence_number)
);

-- Create indexes for better performance
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_story_type_id ON stories(story_type_id);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_created_at ON stories(created_at);

CREATE INDEX idx_scenes_story_id ON scenes(story_id);
CREATE INDEX idx_scenes_sequence_number ON scenes(story_id, sequence_number);
CREATE INDEX idx_scenes_status ON scenes(status);

CREATE INDEX idx_shots_scene_id ON shots(scene_id);
CREATE INDEX idx_shots_sequence_number ON shots(scene_id, sequence_number);
CREATE INDEX idx_shots_status ON shots(status);

-- Add comments to tables
COMMENT ON TABLE story_types IS 'Defines different types/categories of stories that can be generated';
COMMENT ON TABLE stories IS 'Main stories created by users with associated metadata and settings';
COMMENT ON TABLE scenes IS 'Individual scenes that make up a story, organized by sequence number';
COMMENT ON TABLE shots IS 'Individual camera shots within scenes, the smallest unit of video generation';

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_story_types_updated_at BEFORE UPDATE ON story_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scenes_updated_at BEFORE UPDATE ON scenes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shots_updated_at BEFORE UPDATE ON shots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE story_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for story_types (publicly readable, admin writable)
CREATE POLICY "Story types are viewable by everyone" ON story_types FOR SELECT USING (true);
CREATE POLICY "Story types are manageable by authenticated users" ON story_types FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for stories
CREATE POLICY "Users can view their own stories" ON stories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stories" ON stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stories" ON stories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own stories" ON stories FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for scenes
CREATE POLICY "Users can view scenes from their stories" ON scenes FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM stories
        WHERE stories.id = scenes.story_id
        AND stories.user_id = auth.uid()
    )
);
CREATE POLICY "Users can manage scenes from their stories" ON scenes FOR ALL USING (
    EXISTS (
        SELECT 1 FROM stories
        WHERE stories.id = scenes.story_id
        AND stories.user_id = auth.uid()
    )
);

-- RLS Policies for shots
CREATE POLICY "Users can view shots from their stories" ON shots FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM scenes
        JOIN stories ON stories.id = scenes.story_id
        WHERE scenes.id = shots.scene_id
        AND stories.user_id = auth.uid()
    )
);
CREATE POLICY "Users can manage shots from their stories" ON shots FOR ALL USING (
    EXISTS (
        SELECT 1 FROM scenes
        JOIN stories ON stories.id = scenes.story_id
        WHERE scenes.id = shots.scene_id
        AND stories.user_id = auth.uid()
    )
);
