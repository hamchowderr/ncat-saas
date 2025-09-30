-- Migration: elevenlabs
-- Description: Creates elevenlabs_voices table for ElevenLabs integration with exact API structure
-- Author: Generated for ElevenLabs text-to-speech platform integration

-- Create elevenlabs_voices table (exact ElevenLabs API structure)
CREATE TABLE elevenlabs_voices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voice_id VARCHAR(255) UNIQUE, -- External ElevenLabs voice ID
    name VARCHAR(255) NOT NULL,
    samples JSONB, -- Voice samples (can be null)
    category VARCHAR(100), -- Voice category (e.g., "premade")
    fine_tuning JSONB, -- Fine tuning configuration object
    labels JSONB, -- Voice labels (accent, age, gender, etc.)
    description TEXT, -- Voice description
    preview_url TEXT, -- Preview audio URL
    available_for_tiers JSONB, -- Available tiers array
    settings JSONB, -- Voice settings (can be null)
    sharing JSONB, -- Sharing configuration (can be null)
    high_quality_base_model_ids JSONB, -- High quality model IDs array
    verified_languages JSONB, -- Verified languages array
    safety_control JSONB, -- Safety control settings (can be null)
    voice_verification JSONB, -- Voice verification object
    permission_on_resource JSONB, -- Resource permissions (can be null)
    is_owner BOOLEAN DEFAULT false,
    is_legacy BOOLEAN DEFAULT false,
    is_mixed BOOLEAN DEFAULT false,
    favorited_at_unix BIGINT, -- Favorited timestamp (can be null)
    created_at_unix BIGINT -- Creation timestamp (can be null)
);

-- Create indexes for better performance
CREATE INDEX idx_elevenlabs_voices_voice_id ON elevenlabs_voices(voice_id);
CREATE INDEX idx_elevenlabs_voices_name ON elevenlabs_voices(name);
CREATE INDEX idx_elevenlabs_voices_category ON elevenlabs_voices(category);
CREATE INDEX idx_elevenlabs_voices_labels ON elevenlabs_voices USING GIN (labels);
CREATE INDEX idx_elevenlabs_voices_is_owner ON elevenlabs_voices(is_owner);
CREATE INDEX idx_elevenlabs_voices_is_legacy ON elevenlabs_voices(is_legacy);

-- Add comments to table
COMMENT ON TABLE elevenlabs_voices IS 'ElevenLabs voice data with exact API structure including fine tuning, labels, and verification settings';

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Enable Row Level Security
ALTER TABLE elevenlabs_voices ENABLE ROW LEVEL SECURITY;

-- RLS Policies (publicly readable since these are typically static reference data)
CREATE POLICY "ElevenLabs voices are viewable by everyone" ON elevenlabs_voices FOR SELECT USING (true);
CREATE POLICY "ElevenLabs voices are manageable by authenticated users" ON elevenlabs_voices FOR ALL USING (auth.role() = 'authenticated');
