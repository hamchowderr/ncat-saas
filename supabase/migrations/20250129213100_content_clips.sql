-- Migration: content_clips
-- Description: Creates videos and clips tables for content clip management system
-- Author: Generated for content clips feature (mirrors Airtable schema)
-- Timestamp: 20250129213100 (after kedb migration)

-- Create sequences for auto-incrementing display IDs
CREATE SEQUENCE videos_vid_seq START 1;
CREATE SEQUENCE clips_clip_id_seq START 1;

-- Create videos table
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vid INTEGER NOT NULL DEFAULT nextval('videos_vid_seq') UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_file_id UUID REFERENCES files(id) ON DELETE SET NULL,
    active_video BOOLEAN DEFAULT false,
    description TEXT,
    video_width INTEGER,
    video_height INTEGER,
    clip_width INTEGER,
    clip_height INTEGER,
    video_url TEXT,
    transcript_url TEXT,
    srt_url TEXT,
    segments_url TEXT,
    videos_to_create INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clips table
CREATE TABLE clips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clip_id INTEGER NOT NULL DEFAULT nextval('clips_clip_id_seq') UNIQUE,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clip_description TEXT,
    transcript TEXT,
    title TEXT,
    post TEXT,
    start_time NUMERIC(10, 6),
    end_time NUMERIC(10, 6),
    clip_url TEXT,
    thumbnail_url TEXT,
    final_clip_url TEXT,
    cropped_clip_url TEXT,
    center_x_width INTEGER,
    center_y_height INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function for video aspect ratio calculation
CREATE OR REPLACE FUNCTION get_video_aspect_ratio(v_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    v_width INTEGER;
    v_height INTEGER;
BEGIN
    SELECT video_width, video_height INTO v_width, v_height
    FROM public.videos WHERE id = v_id;

    IF v_height IS NULL OR v_height = 0 THEN
        RETURN NULL;
    END IF;

    RETURN ROUND((v_width::NUMERIC / v_height::NUMERIC), 4);
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Create function for clip aspect ratio calculation
CREATE OR REPLACE FUNCTION get_clip_aspect_ratio(v_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    c_width INTEGER;
    c_height INTEGER;
BEGIN
    SELECT clip_width, clip_height INTO c_width, c_height
    FROM public.videos WHERE id = v_id;

    IF c_height IS NULL OR c_height = 0 THEN
        RETURN NULL;
    END IF;

    RETURN ROUND((c_width::NUMERIC / c_height::NUMERIC), 4);
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Create function for clip duration calculation
CREATE OR REPLACE FUNCTION get_clip_duration(c_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    s_time NUMERIC;
    e_time NUMERIC;
BEGIN
    SELECT start_time, end_time INTO s_time, e_time
    FROM public.clips WHERE id = c_id;

    IF s_time IS NULL OR e_time IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN ROUND((e_time - s_time), 6);
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Create function for crop width calculation
-- Formula: IF(video_aspect_ratio > clip_aspect_ratio, video_height * clip_aspect_ratio, video_width)
CREATE OR REPLACE FUNCTION get_crop_x_width(c_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_id UUID;
    v_aspect NUMERIC;
    c_aspect NUMERIC;
    v_width INTEGER;
    v_height INTEGER;
BEGIN
    SELECT video_id INTO v_id FROM public.clips WHERE id = c_id;

    IF v_id IS NULL THEN
        RETURN NULL;
    END IF;

    v_aspect := public.get_video_aspect_ratio(v_id);
    c_aspect := public.get_clip_aspect_ratio(v_id);

    IF v_aspect IS NULL OR c_aspect IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT video_width, video_height INTO v_width, v_height
    FROM public.videos WHERE id = v_id;

    IF v_aspect > c_aspect THEN
        RETURN CEIL(v_height * c_aspect);
    ELSE
        RETURN v_width;
    END IF;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Create function for crop height calculation
-- Formula: IF(video_aspect_ratio > clip_aspect_ratio, video_height, video_width / clip_aspect_ratio)
CREATE OR REPLACE FUNCTION get_crop_y_height(c_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_id UUID;
    v_aspect NUMERIC;
    c_aspect NUMERIC;
    v_width INTEGER;
    v_height INTEGER;
BEGIN
    SELECT video_id INTO v_id FROM public.clips WHERE id = c_id;

    IF v_id IS NULL THEN
        RETURN NULL;
    END IF;

    v_aspect := public.get_video_aspect_ratio(v_id);
    c_aspect := public.get_clip_aspect_ratio(v_id);

    IF v_aspect IS NULL OR c_aspect IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT video_width, video_height INTO v_width, v_height
    FROM public.videos WHERE id = v_id;

    IF v_aspect > c_aspect THEN
        RETURN v_height;
    ELSE
        RETURN CEIL(v_width / c_aspect);
    END IF;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Create function for clip left x-width calculation
-- Formula: IF(center_x_width - (crop_x_width / 2) >= 0, center_x_width - (crop_x_width / 2), 0)
CREATE OR REPLACE FUNCTION get_clip_left_x_width(c_id UUID)
RETURNS INTEGER AS $$
DECLARE
    center_x INTEGER;
    crop_x INTEGER;
    result INTEGER;
BEGIN
    SELECT center_x_width INTO center_x FROM public.clips WHERE id = c_id;
    crop_x := public.get_crop_x_width(c_id);

    IF center_x IS NULL OR crop_x IS NULL THEN
        RETURN NULL;
    END IF;

    result := center_x - (crop_x / 2);

    IF result >= 0 THEN
        RETURN CEIL(result);
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Create function for clip top y-height calculation
-- Formula: IF(center_y_height - (crop_y_height / 2) >= 0, center_y_height - (crop_y_height / 2), 0)
CREATE OR REPLACE FUNCTION get_clip_top_y_height(c_id UUID)
RETURNS INTEGER AS $$
DECLARE
    center_y INTEGER;
    crop_y INTEGER;
    result INTEGER;
BEGIN
    SELECT center_y_height INTO center_y FROM public.clips WHERE id = c_id;
    crop_y := public.get_crop_y_height(c_id);

    IF center_y IS NULL OR crop_y IS NULL THEN
        RETURN NULL;
    END IF;

    result := center_y - (crop_y / 2);

    IF result >= 0 THEN
        RETURN CEIL(result);
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Create indexes for better performance
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_source_file_id ON videos(source_file_id);
CREATE INDEX idx_videos_active_video ON videos(active_video) WHERE active_video = true;
CREATE INDEX idx_videos_vid ON videos(vid);
CREATE INDEX idx_videos_created_at ON videos(created_at);

CREATE INDEX idx_clips_user_id ON clips(user_id);
CREATE INDEX idx_clips_video_id ON clips(video_id);
CREATE INDEX idx_clips_clip_id ON clips(clip_id);
CREATE INDEX idx_clips_created_at ON clips(created_at);
CREATE INDEX idx_clips_start_time ON clips(start_time);
CREATE INDEX idx_clips_end_time ON clips(end_time);

-- Add comments to tables
COMMENT ON TABLE videos IS 'Source videos for content clip generation and management';
COMMENT ON TABLE clips IS 'Individual clips extracted from source videos with crop and timing metadata';

-- Add comments to key columns
COMMENT ON COLUMN videos.vid IS 'Auto-incrementing display ID for videos (like Airtable autoNumber)';
COMMENT ON COLUMN videos.source_file_id IS 'Optional reference to the uploaded file used as the video source (from files table)';
COMMENT ON COLUMN videos.active_video IS 'Indicates if this is the currently active working video';
COMMENT ON COLUMN clips.clip_id IS 'Auto-incrementing display ID for clips (like Airtable autoNumber)';
COMMENT ON COLUMN clips.start_time IS 'Clip start time in seconds with 6 decimal precision';
COMMENT ON COLUMN clips.end_time IS 'Clip end time in seconds with 6 decimal precision';
COMMENT ON COLUMN clips.center_x_width IS 'Center point X coordinate for crop positioning';
COMMENT ON COLUMN clips.center_y_height IS 'Center point Y coordinate for crop positioning';

-- Create updated_at trigger function if it doesn't exist (already exists in previous migrations)
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = NOW();
--     RETURN NEW;
-- END;
-- $$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clips_updated_at BEFORE UPDATE ON clips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;

-- RLS Policies for videos
CREATE POLICY "Users can view their own videos" ON videos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos" ON videos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos" ON videos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos" ON videos
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for clips
CREATE POLICY "Users can view their own clips" ON clips
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clips" ON clips
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clips" ON clips
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clips" ON clips
    FOR DELETE USING (auth.uid() = user_id);
