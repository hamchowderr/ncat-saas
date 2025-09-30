-- Migration: kedb
-- Description: Creates knowledge entries database table for storing user expertise and knowledge items
-- Author: Generated for knowledge management system

-- Create enum for expertise level
CREATE TYPE expertise_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- Create enum for entry status
CREATE TYPE entry_status AS ENUM ('draft', 'published', 'archived');

-- Create kedb table (Knowledge Entries Database)
CREATE TABLE kedb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References auth.users
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(255) NOT NULL,
    expertise_level expertise_level DEFAULT 'beginner',
    tags TEXT[], -- Array of tags for categorization
    status entry_status DEFAULT 'draft',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_kedb_user_id ON kedb(user_id);
CREATE INDEX idx_kedb_category ON kedb(category);
CREATE INDEX idx_kedb_expertise_level ON kedb(expertise_level);
CREATE INDEX idx_kedb_status ON kedb(status);
CREATE INDEX idx_kedb_created_at ON kedb(created_at);

-- Add comments to table
COMMENT ON TABLE kedb IS 'Knowledge entries database for storing user expertise, knowledge items, and learning resources';

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger
CREATE TRIGGER update_kedb_updated_at BEFORE UPDATE ON kedb FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE kedb ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kedb
CREATE POLICY "Users can view their own knowledge entries" ON kedb FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own knowledge entries" ON kedb FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own knowledge entries" ON kedb FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own knowledge entries" ON kedb FOR DELETE USING (auth.uid() = user_id);
