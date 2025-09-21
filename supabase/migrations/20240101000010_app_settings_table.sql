-- Migration 10: App Settings Table
-- Creates a singleton table for global application settings

-- App Settings Table
CREATE TABLE IF NOT EXISTS "public"."app_settings" (
    "id" boolean PRIMARY KEY DEFAULT TRUE NOT NULL,
    "settings" jsonb NOT NULL DEFAULT '{}'::jsonb,
    "updated_at" timestamp WITH time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "single_row" CHECK (id)
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_app_settings_updated_at 
    BEFORE UPDATE ON "public"."app_settings" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings row
INSERT INTO "public"."app_settings" (id, settings) 
VALUES (TRUE, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE "public"."app_settings" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "App settings are viewable by authenticated users" ON "public"."app_settings"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "App settings are updatable by service role" ON "public"."app_settings"
    FOR UPDATE USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE "public"."app_settings" IS 'Global application settings stored as JSONB';
COMMENT ON COLUMN "public"."app_settings"."id" IS 'Boolean primary key to ensure single row';
COMMENT ON COLUMN "public"."app_settings"."settings" IS 'JSONB object containing all app settings';
COMMENT ON COLUMN "public"."app_settings"."updated_at" IS 'Timestamp of last settings update';
