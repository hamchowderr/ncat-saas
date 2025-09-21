-- Migration 14: Storage Policies (File Management Security)
-- Creates comprehensive storage policies for secure file access across all buckets

-- User Private Assets Policy
CREATE POLICY "Users can manage their own private assets" ON "storage"."objects" FOR ALL TO "authenticated" USING (
    (
        ("bucket_id" = 'user-assets'::"text")
        AND (
            (
                (
                    SELECT (
                        SELECT "auth"."uid"() AS "uid"
                    ) AS "uid"
                )
            )::"text" = ("storage"."foldername"("name"))[1]
        )
    )
);

-- Public User Assets View Policy
CREATE POLICY "Users can view public assets of all users" ON "storage"."objects" FOR
SELECT USING (("bucket_id" = 'public-user-assets'::"text"));

-- Public User Assets Upload Policy
CREATE POLICY "Users can upload to their own public assets" ON "storage"."objects" FOR ALL WITH CHECK (
    (
        ("bucket_id" = 'public-user-assets'::"text")
        AND (
            (
                (
                    SELECT "auth"."uid"() AS "uid"
                )
            )::"text" = ("storage"."foldername"("name"))[1]
        )
    )
);

-- Marketing Assets Public Access Policy
CREATE POLICY "Public Access for marketing-assets" ON "storage"."objects" FOR
SELECT USING (("bucket_id" = 'marketing-assets'::"text"));

-- Public Assets Access Policy
CREATE POLICY "Public Access for public-assets" ON "storage"."objects" FOR
SELECT USING (("bucket_id" = 'public-assets'::"text"));

-- Changelog Assets Policy
CREATE POLICY "Allow users to read their changelog assets" ON "storage"."objects" FOR
SELECT USING (("bucket_id" = 'changelog-assets'::"text"));

-- OpenAI Images Policy
CREATE POLICY "Allow users to read their openai images" ON "storage"."objects" FOR
SELECT USING (("bucket_id" = 'openai-images'::"text"));

-- Project Assets Policy (for project-assets bucket)
CREATE POLICY "Users can manage their own project assets" ON "storage"."objects" FOR ALL TO "authenticated" USING (
    (
        ("bucket_id" = 'project-assets'::"text")
        AND (
            (
                (
                    SELECT "auth"."uid"() AS "uid"
                )
            )::"text" = ("storage"."foldername"("name"))[1]
        )
    )
);

-- Policies for the 'files' bucket
CREATE POLICY "Public can view files" ON storage.objects
    FOR SELECT USING (bucket_id = 'files');

CREATE POLICY "Authenticated can insert files" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'files');

CREATE POLICY "Authenticated can update their own files" ON storage.objects
    FOR UPDATE TO authenticated USING (auth.uid() = owner_id::uuid);

CREATE POLICY "Authenticated can delete their own files" ON storage.objects
    FOR DELETE TO authenticated USING (auth.uid() = owner_id::uuid);

-- Create additional buckets referenced in policies
INSERT INTO STORAGE.buckets (id, name)
VALUES ('changelog-assets', 'changelog-assets') ON CONFLICT DO NOTHING;

INSERT INTO STORAGE.buckets (id, name)
VALUES ('openai-images', 'openai-images') ON CONFLICT DO NOTHING;
