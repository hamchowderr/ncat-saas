-- Migration 11: Storage Bucket Configuration
-- Creates storage buckets for different asset types

-- Create Project Assets Bucket
INSERT INTO STORAGE.buckets (id, name)
VALUES ('project-assets', 'project-assets') ON CONFLICT DO NOTHING;

-- Create User Assets Bucket
INSERT INTO STORAGE.buckets (id, name)
VALUES ('user-assets', 'user-assets') ON CONFLICT DO NOTHING;

-- Create Public User Assets Bucket
INSERT INTO STORAGE.buckets (id, name, public)
VALUES ('public-user-assets', 'public-user-assets', TRUE) ON CONFLICT DO NOTHING;

-- Create Public Assets Bucket
INSERT INTO STORAGE.buckets (id, name, public)
VALUES ('public-assets', 'public-assets', TRUE) ON CONFLICT DO NOTHING;

-- Create Marketing Assets Bucket
INSERT INTO STORAGE.buckets (id, name, public)
VALUES ('marketing-assets', 'marketing-assets', TRUE) ON CONFLICT DO NOTHING;

-- Create Files Bucket for general uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', true) ON CONFLICT DO NOTHING;

-- Storage policies for project-assets bucket
CREATE POLICY "Users can view own project assets" ON STORAGE.objects
    FOR SELECT USING (bucket_id = 'project-assets' AND auth.uid()::text = (STORAGE.foldername(name))[1]);

CREATE POLICY "Users can upload own project assets" ON STORAGE.objects
    FOR INSERT WITH CHECK (bucket_id = 'project-assets' AND auth.uid()::text = (STORAGE.foldername(name))[1]);

CREATE POLICY "Users can update own project assets" ON STORAGE.objects
    FOR UPDATE USING (bucket_id = 'project-assets' AND auth.uid()::text = (STORAGE.foldername(name))[1]);

CREATE POLICY "Users can delete own project assets" ON STORAGE.objects
    FOR DELETE USING (bucket_id = 'project-assets' AND auth.uid()::text = (STORAGE.foldername(name))[1]);

-- Storage policies for user-assets bucket
CREATE POLICY "Users can view own user assets" ON STORAGE.objects
    FOR SELECT USING (bucket_id = 'user-assets' AND auth.uid()::text = (STORAGE.foldername(name))[1]);

CREATE POLICY "Users can upload own user assets" ON STORAGE.objects
    FOR INSERT WITH CHECK (bucket_id = 'user-assets' AND auth.uid()::text = (STORAGE.foldername(name))[1]);

CREATE POLICY "Users can update own user assets" ON STORAGE.objects
    FOR UPDATE USING (bucket_id = 'user-assets' AND auth.uid()::text = (STORAGE.foldername(name))[1]);

CREATE POLICY "Users can delete own user assets" ON STORAGE.objects
    FOR DELETE USING (bucket_id = 'user-assets' AND auth.uid()::text = (STORAGE.foldername(name))[1]);

-- Storage policies for public-user-assets bucket (public read, authenticated write)
CREATE POLICY "Anyone can view public user assets" ON STORAGE.objects
    FOR SELECT USING (bucket_id = 'public-user-assets');

CREATE POLICY "Users can upload own public user assets" ON STORAGE.objects
    FOR INSERT WITH CHECK (bucket_id = 'public-user-assets' AND auth.uid()::text = (STORAGE.foldername(name))[1]);

CREATE POLICY "Users can update own public user assets" ON STORAGE.objects
    FOR UPDATE USING (bucket_id = 'public-user-assets' AND auth.uid()::text = (STORAGE.foldername(name))[1]);

CREATE POLICY "Users can delete own public user assets" ON STORAGE.objects
    FOR DELETE USING (bucket_id = 'public-user-assets' AND auth.uid()::text = (STORAGE.foldername(name))[1]);

-- Storage policies for public-assets bucket (public read, service role write)
CREATE POLICY "Anyone can view public assets" ON STORAGE.objects
    FOR SELECT USING (bucket_id = 'public-assets');

CREATE POLICY "Service role can manage public assets" ON STORAGE.objects
    FOR ALL USING (bucket_id = 'public-assets' AND auth.role() = 'service_role');

-- Storage policies for marketing-assets bucket (public read, service role write)
CREATE POLICY "Anyone can view marketing assets" ON STORAGE.objects
    FOR SELECT USING (bucket_id = 'marketing-assets');

CREATE POLICY "Service role can manage marketing assets" ON STORAGE.objects
    FOR ALL USING (bucket_id = 'marketing-assets' AND auth.role() = 'service_role');
