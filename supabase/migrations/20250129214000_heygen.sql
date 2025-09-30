-- Migration: heygen
-- Description: Creates tables for HeyGen integration including avatars, voices, locales, and avatar management
-- Author: Generated for HeyGen AI video platform integration

-- Create enum for avatar status
CREATE TYPE avatar_status AS ENUM ('active', 'inactive', 'deprecated');

-- Create enum for avatar group status
CREATE TYPE avatar_group_status AS ENUM ('active', 'inactive', 'deprecated');

-- Create voices table (EXACT API fields only - no timestamps)
CREATE TABLE voices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voice_id VARCHAR(255) UNIQUE, -- External HeyGen voice ID
    language VARCHAR(100),
    gender VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    preview_audio TEXT, -- URL to voice preview audio
    support_pause BOOLEAN DEFAULT false,
    emotion_support BOOLEAN DEFAULT false,
    support_interactive_avatar BOOLEAN DEFAULT false,
    support_locale BOOLEAN DEFAULT false
);

-- Create locales_voices table (exact API fields only)
CREATE TABLE locales_voices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voice_id UUID REFERENCES voices(id) ON DELETE CASCADE,
    value VARCHAR(255), -- e.g., "Afrikaans (South Africa)"
    label VARCHAR(255), -- e.g., "Afrikaans"
    language VARCHAR(255), -- e.g., "Afrikaans"
    tag VARCHAR(255), -- Can be null
    locale VARCHAR(10), -- e.g., "af-ZA"
    language_code VARCHAR(10), -- e.g., "af-ZA"
    UNIQUE(voice_id, locale)
);

-- Create avatar_groups table (exact API fields only)
CREATE TABLE avatar_groups (
    id VARCHAR(255) PRIMARY KEY, -- External HeyGen group ID (exact API field)
    name VARCHAR(255) NOT NULL,
    created_at BIGINT, -- Unix timestamp from API
    num_looks INTEGER DEFAULT 1,
    preview_image TEXT, -- URL to preview image
    group_type VARCHAR(100), -- e.g., "PUBLIC_KIT"
    train_status VARCHAR(100), -- Training status, can be null
    default_voice_id VARCHAR(255) -- Default voice ID, can be null
);

-- Create avatars table (EXACT API fields only - no additional fields)
CREATE TABLE avatars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avatar_id VARCHAR(255), -- External HeyGen avatar ID (for regular avatars)
    talking_photo_id VARCHAR(255), -- External HeyGen talking photo ID (for talking photos)
    avatar_name VARCHAR(255), -- For regular avatars
    talking_photo_name VARCHAR(255), -- For talking photos
    gender VARCHAR(50), -- For regular avatars
    preview_image_url TEXT, -- Preview image URL (for both types)
    preview_video_url TEXT, -- Preview video URL (for regular avatars only)
    premium BOOLEAN DEFAULT false, -- For regular avatars
    type VARCHAR(100), -- For regular avatars
    tags TEXT[], -- Array of tags for categorization (for regular avatars)
    default_voice_id VARCHAR(255) -- For regular avatars
);

-- Create avatar_details table (exact API response structure)
CREATE TABLE avatar_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avatar_id UUID REFERENCES avatars(id) ON DELETE CASCADE,
    error_text TEXT, -- Error field from API response
    avatar_type VARCHAR(50), -- "avatar" from API
    external_id VARCHAR(255), -- "id" from API data
    name VARCHAR(255), -- Avatar name
    gender VARCHAR(50),
    preview_image_url TEXT,
    preview_video_url TEXT,
    premium BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    default_voice_id VARCHAR(255),
    tags TEXT[], -- Array of tags
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(avatar_id)
);

-- Create avatars_in_one_group table (exact API response structure for avatar lists in groups)
CREATE TABLE avatars_in_one_group (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avatar_group_id VARCHAR(255) REFERENCES avatar_groups(id) ON DELETE CASCADE,
    error_text TEXT, -- Error field from API response
    avatar_data JSONB, -- Complete avatar list data from API
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(avatar_group_id)
);

-- Create indexes for better performance
CREATE INDEX idx_voices_language ON voices(language);
CREATE INDEX idx_voices_gender ON voices(gender);
CREATE INDEX idx_voices_support_pause ON voices(support_pause);
CREATE INDEX idx_voices_emotion_support ON voices(emotion_support);
CREATE INDEX idx_voices_support_interactive_avatar ON voices(support_interactive_avatar);
CREATE INDEX idx_voices_support_locale ON voices(support_locale);

CREATE INDEX idx_locales_voices_voice_id ON locales_voices(voice_id);
CREATE INDEX idx_locales_voices_locale ON locales_voices(locale);
CREATE INDEX idx_locales_voices_language_code ON locales_voices(language_code);

CREATE INDEX idx_avatar_groups_name ON avatar_groups(name);
CREATE INDEX idx_avatar_groups_group_type ON avatar_groups(group_type);

CREATE INDEX idx_avatars_gender ON avatars(gender);
CREATE INDEX idx_avatars_premium ON avatars(premium);

CREATE INDEX idx_avatar_details_avatar_id ON avatar_details(avatar_id);
CREATE INDEX idx_avatar_details_external_id ON avatar_details(external_id);
CREATE INDEX idx_avatar_details_gender ON avatar_details(gender);
CREATE INDEX idx_avatar_details_premium ON avatar_details(premium);
CREATE INDEX idx_avatar_details_is_public ON avatar_details(is_public);

CREATE INDEX idx_avatars_in_one_group_avatar_group_id ON avatars_in_one_group(avatar_group_id);

-- Add comments to tables
COMMENT ON TABLE voices IS 'Voice options from HeyGen API with support features';
COMMENT ON TABLE locales_voices IS 'Voice locale data from HeyGen API (exact API structure)';
COMMENT ON TABLE avatar_groups IS 'Avatar group data from HeyGen API (exact API structure)';
COMMENT ON TABLE avatars IS 'Avatar and talking photo data from HeyGen API (exact API structure)';
COMMENT ON TABLE avatar_details IS 'Avatar details data from HeyGen API (complete avatar records with error handling)';
COMMENT ON TABLE avatars_in_one_group IS 'Avatar list data for groups from HeyGen API (avatar_list array with error handling)';

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_voices_updated_at BEFORE UPDATE ON voices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locales_voices_updated_at BEFORE UPDATE ON locales_voices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_avatars_updated_at BEFORE UPDATE ON avatars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_avatar_details_updated_at BEFORE UPDATE ON avatar_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE locales_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars_in_one_group ENABLE ROW LEVEL SECURITY;

-- RLS Policies (publicly readable since these are typically static reference data)
CREATE POLICY "Voices are viewable by everyone" ON voices FOR SELECT USING (true);
CREATE POLICY "Voices are manageable by authenticated users" ON voices FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Voice locales are viewable by everyone" ON locales_voices FOR SELECT USING (true);
CREATE POLICY "Voice locales are manageable by authenticated users" ON locales_voices FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Avatar groups are viewable by everyone" ON avatar_groups FOR SELECT USING (true);
CREATE POLICY "Avatar groups are manageable by authenticated users" ON avatar_groups FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Avatars are viewable by everyone" ON avatars FOR SELECT USING (true);
CREATE POLICY "Avatars are manageable by authenticated users" ON avatars FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Avatar details are viewable by everyone" ON avatar_details FOR SELECT USING (true);
CREATE POLICY "Avatar details are manageable by authenticated users" ON avatar_details FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Avatar group memberships are viewable by everyone" ON avatars_in_one_group FOR SELECT USING (true);
CREATE POLICY "Avatar group memberships are manageable by authenticated users" ON avatars_in_one_group FOR ALL USING (auth.role() = 'authenticated');
