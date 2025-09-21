-- Migration 22: Jobs Table
-- Create jobs table for tracking NCA processing and job information

CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" UUID PRIMARY KEY DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "nca_build_number" TEXT,
    "nca_job_id" TEXT,
    "custom_id" TEXT,
    "nca_queue_length" INTEGER,
    "nca_queue_id" TEXT,
    "nca_total_time" NUMERIC,
    "nca_queue_time" NUMERIC,
    "nca_run_time" NUMERIC,
    "nca_pid" INTEGER,
    "nca_code" TEXT,
    "processing_status" TEXT,
    "nca_message" TEXT,
    "error_message" TEXT,
    "user_id" UUID REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE "public"."jobs" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jobs table
CREATE POLICY "Users can view their own jobs" ON "public"."jobs"
    FOR SELECT USING ("auth"."uid"() = "user_id");

CREATE POLICY "Users can insert their own jobs" ON "public"."jobs"
    FOR INSERT WITH CHECK ("auth"."uid"() = "user_id");

CREATE POLICY "Users can update their own jobs" ON "public"."jobs"
    FOR UPDATE USING ("auth"."uid"() = "user_id");

CREATE POLICY "Users can delete their own jobs" ON "public"."jobs"
    FOR DELETE USING ("auth"."uid"() = "user_id");

-- Add updated_at trigger
CREATE TRIGGER "update_jobs_updated_at"
    BEFORE UPDATE ON "public"."jobs"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_jobs_user_id" ON "public"."jobs"("user_id");
CREATE INDEX IF NOT EXISTS "idx_jobs_nca_job_id" ON "public"."jobs"("nca_job_id");
CREATE INDEX IF NOT EXISTS "idx_jobs_processing_status" ON "public"."jobs"("processing_status");
CREATE INDEX IF NOT EXISTS "idx_jobs_created_at" ON "public"."jobs"("created_at");
