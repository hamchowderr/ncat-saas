-- Migration 23: NCAT API Endpoint Response Tables
-- Create dedicated tables for each NCAT endpoint to store structured response data

-- ============================================================================
-- 1. MEDIA TRANSCRIBE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."media_transcribe" (
    "id" UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" UUID NOT NULL REFERENCES "public"."jobs"("id") ON DELETE CASCADE,
    "text" TEXT,
    "srt" TEXT,
    "text_url" TEXT,
    "srt_url" TEXT,
    "segments_url" TEXT,
    "segments" JSONB,
    "language" TEXT,
    "task" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 2. MEDIA METADATA TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."media_metadata" (
    "id" UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" UUID NOT NULL REFERENCES "public"."jobs"("id") ON DELETE CASCADE,
    "filesize" BIGINT,
    "filesize_mb" NUMERIC,
    "format" TEXT,
    "overall_bitrate" BIGINT,
    "overall_bitrate_mbps" NUMERIC,
    "duration" NUMERIC,
    "duration_formatted" TEXT,
    "has_video" BOOLEAN,
    "video_codec" TEXT,
    "video_codec_long" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "resolution" TEXT,
    "fps" NUMERIC,
    "video_bitrate" BIGINT,
    "video_bitrate_mbps" NUMERIC,
    "pixel_format" TEXT,
    "has_audio" BOOLEAN,
    "audio_codec" TEXT,
    "audio_codec_long" TEXT,
    "audio_channels" INTEGER,
    "audio_sample_rate" INTEGER,
    "audio_sample_rate_khz" NUMERIC,
    "audio_bitrate" BIGINT,
    "audio_bitrate_kbps" NUMERIC,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 3. MEDIA SILENCE TABLE + SEGMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."media_silence" (
    "id" UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" UUID NOT NULL REFERENCES "public"."jobs"("id") ON DELETE CASCADE,
    "media_url" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."silence_segments" (
    "id" UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "media_silence_id" UUID NOT NULL REFERENCES "public"."media_silence"("id") ON DELETE CASCADE,
    "start_time" NUMERIC NOT NULL,
    "end_time" NUMERIC NOT NULL,
    "duration" NUMERIC GENERATED ALWAYS AS ("end_time" - "start_time") STORED,
    "sequence_number" INTEGER NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 4. CODE EXECUTION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."code_execution" (
    "id" UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" UUID NOT NULL REFERENCES "public"."jobs"("id") ON DELETE CASCADE,
    "result" TEXT,
    "stdout" TEXT,
    "stderr" TEXT,
    "exit_code" INTEGER,
    "code_snippet" TEXT,
    "timeout_seconds" INTEGER,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 5. MEDIA DOWNLOAD TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."media_download" (
    "id" UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" UUID NOT NULL REFERENCES "public"."jobs"("id") ON DELETE CASCADE,
    "media_url" TEXT,
    "title" TEXT,
    "format_id" TEXT,
    "ext" TEXT,
    "resolution" TEXT,
    "filesize" BIGINT,
    "width" INTEGER,
    "height" INTEGER,
    "fps" INTEGER,
    "video_codec" TEXT,
    "audio_codec" TEXT,
    "upload_date" TEXT,
    "duration" INTEGER,
    "view_count" INTEGER,
    "uploader" TEXT,
    "uploader_id" TEXT,
    "description" TEXT,
    "thumbnails" JSONB,
    "quality" TEXT,
    "video_codec_requested" TEXT,
    "audio_codec_requested" TEXT,
    "extract_audio" BOOLEAN,
    "audio_format" TEXT,
    "audio_quality" TEXT,
    "download_thumbnails" BOOLEAN,
    "download_all_thumbnails" BOOLEAN,
    "thumbnail_formats" TEXT,
    "embed_thumbnail_in_audio" BOOLEAN,
    "download_subtitles" BOOLEAN,
    "subtitle_languages" TEXT[],
    "subtitle_format" TEXT,
    "max_filesize" BIGINT,
    "rate_limit" TEXT,
    "retries" INTEGER,
    "cloud_upload" BOOLEAN,
    "cookie_used" BOOLEAN,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 6. FFMPEG COMPOSE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."ffmpeg_compose" (
    "id" UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" UUID NOT NULL REFERENCES "public"."jobs"("id") ON DELETE CASCADE,
    "output_url" TEXT,
    "thumbnail_url" TEXT,
    "filesize" BIGINT,
    "duration" NUMERIC,
    "bitrate" INTEGER,
    "encoder" TEXT,
    "script" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 7. VIDEO SPLIT TABLE + SEGMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."video_split" (
    "id" UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" UUID NOT NULL REFERENCES "public"."jobs"("id") ON DELETE CASCADE,
    "segment_count" INTEGER,
    "split_interval" NUMERIC,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."video_split_segments" (
    "id" UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "video_split_id" UUID NOT NULL REFERENCES "public"."video_split"("id") ON DELETE CASCADE,
    "segment_number" INTEGER NOT NULL,
    "file_url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "duration" NUMERIC,
    "filesize" BIGINT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 8. AUDIO CONCATENATE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."audio_concatenate" (
    "id" UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" UUID NOT NULL REFERENCES "public"."jobs"("id") ON DELETE CASCADE,
    "output_url" TEXT,
    "filesize" BIGINT,
    "duration" NUMERIC,
    "mime_type" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 9. IMAGE TO VIDEO TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."image_to_video" (
    "id" UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" UUID NOT NULL REFERENCES "public"."jobs"("id") ON DELETE CASCADE,
    "output_url" TEXT,
    "filesize" BIGINT,
    "duration" NUMERIC,
    "mime_type" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 10. MEDIA CONVERT TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."media_convert" (
    "id" UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" UUID NOT NULL REFERENCES "public"."jobs"("id") ON DELETE CASCADE,
    "output_url" TEXT,
    "output_format" TEXT,
    "video_codec" TEXT,
    "audio_codec" TEXT,
    "filesize" BIGINT,
    "duration" NUMERIC,
    "mime_type" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 11. MEDIA CONVERT MP3 TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."media_convert_mp3" (
    "id" UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" UUID NOT NULL REFERENCES "public"."jobs"("id") ON DELETE CASCADE,
    "output_url" TEXT,
    "filesize" BIGINT,
    "duration" NUMERIC,
    "mime_type" TEXT DEFAULT 'audio/mpeg',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 12. VIDEO CAPTION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."video_caption" (
    "id" UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" UUID NOT NULL REFERENCES "public"."jobs"("id") ON DELETE CASCADE,
    "output_url" TEXT,
    "subtitle_url" TEXT,
    "font_size" INTEGER,
    "font_color" TEXT,
    "position" TEXT,
    "filesize" BIGINT,
    "duration" NUMERIC,
    "mime_type" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 13. VIDEO CONCATENATE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."video_concatenate" (
    "id" UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" UUID NOT NULL REFERENCES "public"."jobs"("id") ON DELETE CASCADE,
    "output_url" TEXT,
    "filesize" BIGINT,
    "duration" NUMERIC,
    "mime_type" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 14. VIDEO CUT TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."video_cut" (
    "id" UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" UUID NOT NULL REFERENCES "public"."jobs"("id") ON DELETE CASCADE,
    "output_url" TEXT,
    "filesize" BIGINT,
    "duration" NUMERIC,
    "mime_type" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 15. VIDEO THUMBNAIL TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."video_thumbnail" (
    "id" UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" UUID NOT NULL REFERENCES "public"."jobs"("id") ON DELETE CASCADE,
    "output_url" TEXT,
    "thumbnail_time" NUMERIC,
    "width" INTEGER,
    "height" INTEGER,
    "filesize" BIGINT,
    "mime_type" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 16. VIDEO TRIM TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."video_trim" (
    "id" UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" UUID NOT NULL REFERENCES "public"."jobs"("id") ON DELETE CASCADE,
    "output_url" TEXT,
    "start_time" NUMERIC,
    "end_time" NUMERIC,
    "filesize" BIGINT,
    "duration" NUMERIC,
    "mime_type" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 17. S3 UPLOAD TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS "public"."s3_upload" (
    "id" UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" UUID NOT NULL REFERENCES "public"."jobs"("id") ON DELETE CASCADE,
    "url" TEXT,
    "filename" TEXT,
    "bucket" TEXT,
    "public" BOOLEAN,
    "region" TEXT,
    "provider" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE "public"."media_transcribe" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."media_metadata" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."media_silence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."silence_segments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."code_execution" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."media_download" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ffmpeg_compose" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."video_split" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."video_split_segments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."audio_concatenate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."image_to_video" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."media_convert" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."media_convert_mp3" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."video_caption" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."video_concatenate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."video_cut" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."video_thumbnail" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."video_trim" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."s3_upload" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Media Transcribe Policies
CREATE POLICY "Users can view their own media_transcribe records" ON "public"."media_transcribe"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."jobs"
            WHERE "jobs"."id" = "media_transcribe"."job_id"
            AND "jobs"."user_id" = "auth"."uid"()
        )
    );

CREATE POLICY "Users can insert their own media_transcribe records" ON "public"."media_transcribe"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."jobs"
            WHERE "jobs"."id" = "media_transcribe"."job_id"
            AND "jobs"."user_id" = "auth"."uid"()
        )
    );

-- Media Metadata Policies
CREATE POLICY "Users can view their own media_metadata records" ON "public"."media_metadata"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."jobs"
            WHERE "jobs"."id" = "media_metadata"."job_id"
            AND "jobs"."user_id" = "auth"."uid"()
        )
    );

CREATE POLICY "Users can insert their own media_metadata records" ON "public"."media_metadata"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."jobs"
            WHERE "jobs"."id" = "media_metadata"."job_id"
            AND "jobs"."user_id" = "auth"."uid"()
        )
    );

-- Media Silence Policies
CREATE POLICY "Users can view their own media_silence records" ON "public"."media_silence"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."jobs"
            WHERE "jobs"."id" = "media_silence"."job_id"
            AND "jobs"."user_id" = "auth"."uid"()
        )
    );

CREATE POLICY "Users can insert their own media_silence records" ON "public"."media_silence"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."jobs"
            WHERE "jobs"."id" = "media_silence"."job_id"
            AND "jobs"."user_id" = "auth"."uid"()
        )
    );

-- Silence Segments Policies
CREATE POLICY "Users can view their own silence_segments" ON "public"."silence_segments"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."media_silence"
            JOIN "public"."jobs" ON "jobs"."id" = "media_silence"."job_id"
            WHERE "media_silence"."id" = "silence_segments"."media_silence_id"
            AND "jobs"."user_id" = "auth"."uid"()
        )
    );

CREATE POLICY "Users can insert their own silence_segments" ON "public"."silence_segments"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."media_silence"
            JOIN "public"."jobs" ON "jobs"."id" = "media_silence"."job_id"
            WHERE "media_silence"."id" = "silence_segments"."media_silence_id"
            AND "jobs"."user_id" = "auth"."uid"()
        )
    );

-- Code Execution Policies
CREATE POLICY "Users can view their own code_execution records" ON "public"."code_execution"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."jobs"
            WHERE "jobs"."id" = "code_execution"."job_id"
            AND "jobs"."user_id" = "auth"."uid"()
        )
    );

CREATE POLICY "Users can insert their own code_execution records" ON "public"."code_execution"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."jobs"
            WHERE "jobs"."id" = "code_execution"."job_id"
            AND "jobs"."user_id" = "auth"."uid"()
        )
    );

-- Media Download Policies
CREATE POLICY "Users can view their own media_download records" ON "public"."media_download"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."jobs"
            WHERE "jobs"."id" = "media_download"."job_id"
            AND "jobs"."user_id" = "auth"."uid"()
        )
    );

CREATE POLICY "Users can insert their own media_download records" ON "public"."media_download"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."jobs"
            WHERE "jobs"."id" = "media_download"."job_id"
            AND "jobs"."user_id" = "auth"."uid"()
        )
    );

-- FFmpeg Compose Policies
CREATE POLICY "Users can view their own ffmpeg_compose records" ON "public"."ffmpeg_compose"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."jobs"
            WHERE "jobs"."id" = "ffmpeg_compose"."job_id"
            AND "jobs"."user_id" = "auth"."uid"()
        )
    );

CREATE POLICY "Users can insert their own ffmpeg_compose records" ON "public"."ffmpeg_compose"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."jobs"
            WHERE "jobs"."id" = "ffmpeg_compose"."job_id"
            AND "jobs"."user_id" = "auth"."uid"()
        )
    );

-- Video Split Policies
CREATE POLICY "Users can view their own video_split records" ON "public"."video_split"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."jobs"
            WHERE "jobs"."id" = "video_split"."job_id"
            AND "jobs"."user_id" = "auth"."uid"()
        )
    );

CREATE POLICY "Users can insert their own video_split records" ON "public"."video_split"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."jobs"
            WHERE "jobs"."id" = "video_split"."job_id"
            AND "jobs"."user_id" = "auth"."uid"()
        )
    );

-- Video Split Segments Policies
CREATE POLICY "Users can view their own video_split_segments" ON "public"."video_split_segments"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."video_split"
            JOIN "public"."jobs" ON "jobs"."id" = "video_split"."job_id"
            WHERE "video_split"."id" = "video_split_segments"."video_split_id"
            AND "jobs"."user_id" = "auth"."uid"()
        )
    );

CREATE POLICY "Users can insert their own video_split_segments" ON "public"."video_split_segments"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."video_split"
            JOIN "public"."jobs" ON "jobs"."id" = "video_split"."job_id"
            WHERE "video_split"."id" = "video_split_segments"."video_split_id"
            AND "jobs"."user_id" = "auth"."uid"()
        )
    );

-- Simple table policies (all follow same pattern)
CREATE POLICY "Users can view their own audio_concatenate records" ON "public"."audio_concatenate"
    FOR SELECT USING (EXISTS (SELECT 1 FROM "public"."jobs" WHERE "jobs"."id" = "audio_concatenate"."job_id" AND "jobs"."user_id" = "auth"."uid"()));
CREATE POLICY "Users can insert their own audio_concatenate records" ON "public"."audio_concatenate"
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM "public"."jobs" WHERE "jobs"."id" = "audio_concatenate"."job_id" AND "jobs"."user_id" = "auth"."uid"()));

CREATE POLICY "Users can view their own image_to_video records" ON "public"."image_to_video"
    FOR SELECT USING (EXISTS (SELECT 1 FROM "public"."jobs" WHERE "jobs"."id" = "image_to_video"."job_id" AND "jobs"."user_id" = "auth"."uid"()));
CREATE POLICY "Users can insert their own image_to_video records" ON "public"."image_to_video"
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM "public"."jobs" WHERE "jobs"."id" = "image_to_video"."job_id" AND "jobs"."user_id" = "auth"."uid"()));

CREATE POLICY "Users can view their own media_convert records" ON "public"."media_convert"
    FOR SELECT USING (EXISTS (SELECT 1 FROM "public"."jobs" WHERE "jobs"."id" = "media_convert"."job_id" AND "jobs"."user_id" = "auth"."uid"()));
CREATE POLICY "Users can insert their own media_convert records" ON "public"."media_convert"
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM "public"."jobs" WHERE "jobs"."id" = "media_convert"."job_id" AND "jobs"."user_id" = "auth"."uid"()));

CREATE POLICY "Users can view their own media_convert_mp3 records" ON "public"."media_convert_mp3"
    FOR SELECT USING (EXISTS (SELECT 1 FROM "public"."jobs" WHERE "jobs"."id" = "media_convert_mp3"."job_id" AND "jobs"."user_id" = "auth"."uid"()));
CREATE POLICY "Users can insert their own media_convert_mp3 records" ON "public"."media_convert_mp3"
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM "public"."jobs" WHERE "jobs"."id" = "media_convert_mp3"."job_id" AND "jobs"."user_id" = "auth"."uid"()));

CREATE POLICY "Users can view their own video_caption records" ON "public"."video_caption"
    FOR SELECT USING (EXISTS (SELECT 1 FROM "public"."jobs" WHERE "jobs"."id" = "video_caption"."job_id" AND "jobs"."user_id" = "auth"."uid"()));
CREATE POLICY "Users can insert their own video_caption records" ON "public"."video_caption"
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM "public"."jobs" WHERE "jobs"."id" = "video_caption"."job_id" AND "jobs"."user_id" = "auth"."uid"()));

CREATE POLICY "Users can view their own video_concatenate records" ON "public"."video_concatenate"
    FOR SELECT USING (EXISTS (SELECT 1 FROM "public"."jobs" WHERE "jobs"."id" = "video_concatenate"."job_id" AND "jobs"."user_id" = "auth"."uid"()));
CREATE POLICY "Users can insert their own video_concatenate records" ON "public"."video_concatenate"
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM "public"."jobs" WHERE "jobs"."id" = "video_concatenate"."job_id" AND "jobs"."user_id" = "auth"."uid"()));

CREATE POLICY "Users can view their own video_cut records" ON "public"."video_cut"
    FOR SELECT USING (EXISTS (SELECT 1 FROM "public"."jobs" WHERE "jobs"."id" = "video_cut"."job_id" AND "jobs"."user_id" = "auth"."uid"()));
CREATE POLICY "Users can insert their own video_cut records" ON "public"."video_cut"
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM "public"."jobs" WHERE "jobs"."id" = "video_cut"."job_id" AND "jobs"."user_id" = "auth"."uid"()));

CREATE POLICY "Users can view their own video_thumbnail records" ON "public"."video_thumbnail"
    FOR SELECT USING (EXISTS (SELECT 1 FROM "public"."jobs" WHERE "jobs"."id" = "video_thumbnail"."job_id" AND "jobs"."user_id" = "auth"."uid"()));
CREATE POLICY "Users can insert their own video_thumbnail records" ON "public"."video_thumbnail"
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM "public"."jobs" WHERE "jobs"."id" = "video_thumbnail"."job_id" AND "jobs"."user_id" = "auth"."uid"()));

CREATE POLICY "Users can view their own video_trim records" ON "public"."video_trim"
    FOR SELECT USING (EXISTS (SELECT 1 FROM "public"."jobs" WHERE "jobs"."id" = "video_trim"."job_id" AND "jobs"."user_id" = "auth"."uid"()));
CREATE POLICY "Users can insert their own video_trim records" ON "public"."video_trim"
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM "public"."jobs" WHERE "jobs"."id" = "video_trim"."job_id" AND "jobs"."user_id" = "auth"."uid"()));

CREATE POLICY "Users can view their own s3_upload records" ON "public"."s3_upload"
    FOR SELECT USING (EXISTS (SELECT 1 FROM "public"."jobs" WHERE "jobs"."id" = "s3_upload"."job_id" AND "jobs"."user_id" = "auth"."uid"()));
CREATE POLICY "Users can insert their own s3_upload records" ON "public"."s3_upload"
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM "public"."jobs" WHERE "jobs"."id" = "s3_upload"."job_id" AND "jobs"."user_id" = "auth"."uid"()));

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS "idx_media_transcribe_job_id" ON "public"."media_transcribe"("job_id");
CREATE INDEX IF NOT EXISTS "idx_media_metadata_job_id" ON "public"."media_metadata"("job_id");
CREATE INDEX IF NOT EXISTS "idx_media_silence_job_id" ON "public"."media_silence"("job_id");
CREATE INDEX IF NOT EXISTS "idx_silence_segments_media_silence_id" ON "public"."silence_segments"("media_silence_id");
CREATE INDEX IF NOT EXISTS "idx_code_execution_job_id" ON "public"."code_execution"("job_id");
CREATE INDEX IF NOT EXISTS "idx_media_download_job_id" ON "public"."media_download"("job_id");
CREATE INDEX IF NOT EXISTS "idx_ffmpeg_compose_job_id" ON "public"."ffmpeg_compose"("job_id");
CREATE INDEX IF NOT EXISTS "idx_video_split_job_id" ON "public"."video_split"("job_id");
CREATE INDEX IF NOT EXISTS "idx_video_split_segments_video_split_id" ON "public"."video_split_segments"("video_split_id");
CREATE INDEX IF NOT EXISTS "idx_audio_concatenate_job_id" ON "public"."audio_concatenate"("job_id");
CREATE INDEX IF NOT EXISTS "idx_image_to_video_job_id" ON "public"."image_to_video"("job_id");
CREATE INDEX IF NOT EXISTS "idx_media_convert_job_id" ON "public"."media_convert"("job_id");
CREATE INDEX IF NOT EXISTS "idx_media_convert_mp3_job_id" ON "public"."media_convert_mp3"("job_id");
CREATE INDEX IF NOT EXISTS "idx_video_caption_job_id" ON "public"."video_caption"("job_id");
CREATE INDEX IF NOT EXISTS "idx_video_concatenate_job_id" ON "public"."video_concatenate"("job_id");
CREATE INDEX IF NOT EXISTS "idx_video_cut_job_id" ON "public"."video_cut"("job_id");
CREATE INDEX IF NOT EXISTS "idx_video_thumbnail_job_id" ON "public"."video_thumbnail"("job_id");
CREATE INDEX IF NOT EXISTS "idx_video_trim_job_id" ON "public"."video_trim"("job_id");
CREATE INDEX IF NOT EXISTS "idx_s3_upload_job_id" ON "public"."s3_upload"("job_id");

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
CREATE TRIGGER "update_media_transcribe_updated_at" BEFORE UPDATE ON "public"."media_transcribe"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE TRIGGER "update_media_metadata_updated_at" BEFORE UPDATE ON "public"."media_metadata"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE TRIGGER "update_media_silence_updated_at" BEFORE UPDATE ON "public"."media_silence"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE TRIGGER "update_code_execution_updated_at" BEFORE UPDATE ON "public"."code_execution"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE TRIGGER "update_media_download_updated_at" BEFORE UPDATE ON "public"."media_download"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE TRIGGER "update_ffmpeg_compose_updated_at" BEFORE UPDATE ON "public"."ffmpeg_compose"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE TRIGGER "update_video_split_updated_at" BEFORE UPDATE ON "public"."video_split"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE TRIGGER "update_audio_concatenate_updated_at" BEFORE UPDATE ON "public"."audio_concatenate"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE TRIGGER "update_image_to_video_updated_at" BEFORE UPDATE ON "public"."image_to_video"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE TRIGGER "update_media_convert_updated_at" BEFORE UPDATE ON "public"."media_convert"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE TRIGGER "update_media_convert_mp3_updated_at" BEFORE UPDATE ON "public"."media_convert_mp3"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE TRIGGER "update_video_caption_updated_at" BEFORE UPDATE ON "public"."video_caption"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE TRIGGER "update_video_concatenate_updated_at" BEFORE UPDATE ON "public"."video_concatenate"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE TRIGGER "update_video_cut_updated_at" BEFORE UPDATE ON "public"."video_cut"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE TRIGGER "update_video_thumbnail_updated_at" BEFORE UPDATE ON "public"."video_thumbnail"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE TRIGGER "update_video_trim_updated_at" BEFORE UPDATE ON "public"."video_trim"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE TRIGGER "update_s3_upload_updated_at" BEFORE UPDATE ON "public"."s3_upload"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
