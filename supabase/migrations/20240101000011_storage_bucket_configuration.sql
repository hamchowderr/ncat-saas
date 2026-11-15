-- Migration 11: Storage Bucket Configuration
-- Creates storage buckets for different asset types with security constraints

-- Create Project Assets Bucket (100MB limit, media + PDF)
INSERT INTO STORAGE.buckets (id, name, file_size_limit, allowed_mime_types)
VALUES ('project-assets', 'project-assets', 104857600, ARRAY['video/*', 'audio/*', 'image/*', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/*', 'audio/*', 'image/*', 'application/pdf'];

-- Create User Assets Bucket (100MB limit, media + PDF)
INSERT INTO STORAGE.buckets (id, name, file_size_limit, allowed_mime_types)
VALUES ('user-assets', 'user-assets', 104857600, ARRAY['video/*', 'audio/*', 'image/*', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/*', 'audio/*', 'image/*', 'application/pdf'];

-- Create Public User Assets Bucket (100MB limit, media + PDF)
INSERT INTO STORAGE.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('public-user-assets', 'public-user-assets', TRUE, 104857600, ARRAY['video/*', 'audio/*', 'image/*', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/*', 'audio/*', 'image/*', 'application/pdf'];

-- Create Public Assets Bucket (10MB limit, images + video)
INSERT INTO STORAGE.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('public-assets', 'public-assets', TRUE, 10485760, ARRAY['image/*', 'video/*'])
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/*', 'video/*'];

-- Create Marketing Assets Bucket (10MB limit, images + video)
INSERT INTO STORAGE.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('marketing-assets', 'marketing-assets', TRUE, 10485760, ARRAY['image/*', 'video/*'])
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/*', 'video/*'];

-- Create Changelog Assets Bucket (10MB limit, images + video)
INSERT INTO STORAGE.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('changelog-assets', 'changelog-assets', FALSE, 10485760, ARRAY['image/*', 'video/*'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/*', 'video/*'];

-- Create OpenAI Images Bucket (20MB limit, images only)
INSERT INTO STORAGE.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('openai-images', 'openai-images', FALSE, 20971520, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp'];

-- Create Files Bucket for general uploads (100MB limit, all media + PDF)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('files', 'files', true, 104857600, ARRAY['video/*', 'audio/*', 'image/*', 'application/pdf', 'text/plain', 'text/vtt', 'application/json', 'application/octet-stream'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/*', 'audio/*', 'image/*', 'application/pdf', 'text/plain', 'text/vtt', 'application/json', 'application/octet-stream'];

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
