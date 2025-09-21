-- Migration 16: User System RLS Policies
-- Creates comprehensive RLS policies for user-related tables

-- User Profiles Policies
CREATE POLICY "Everyone can view user profile" ON "public"."user_profiles" FOR
SELECT TO "authenticated" USING (TRUE);

CREATE POLICY "Only the own user can update it" ON "public"."user_profiles" FOR
UPDATE TO "authenticated" USING (
    (
        (
            SELECT auth.uid()
        ) = "id"
    )
);

-- User Settings Policies
CREATE POLICY "Users can view their own settings" ON "public"."user_settings" FOR
SELECT TO authenticated USING (
    (
        SELECT auth.uid()
    ) = "id"
);

CREATE POLICY "Users can update their own settings" ON "public"."user_settings" FOR
UPDATE TO authenticated USING (
    (
        SELECT auth.uid()
    ) = "id"
);

-- User Application Settings Policies
CREATE POLICY "Users can view their own application settings" ON "public"."user_application_settings" FOR
SELECT TO authenticated USING (
    (
        SELECT auth.uid()
    ) = "id"
);

-- User API Keys Policies
CREATE POLICY "User can select their own keys" ON "public"."user_api_keys" FOR
SELECT USING (
    (
        (
            SELECT "auth"."uid"() AS "uid"
        ) = "user_id"
    )
);

CREATE POLICY "User can insert their own keys" ON "public"."user_api_keys" FOR
INSERT WITH CHECK (
    (
        (
            SELECT "auth"."uid"() AS "uid"
        ) = "user_id"
    )
);

CREATE POLICY "User can update their own keys" ON "public"."user_api_keys" FOR
UPDATE USING (
    (
        (
            SELECT "auth"."uid"() AS "uid"
        ) = "user_id"
    )
) WITH CHECK (
    (
        (
            SELECT "auth"."uid"() AS "uid"
        ) = "user_id"
    )
);

-- User Notifications Policies
CREATE POLICY "any_user_can_create_notification" ON "public"."user_notifications" FOR
INSERT TO "authenticated" WITH CHECK (TRUE);

CREATE POLICY "only_user_can_read_their_own_notification" ON "public"."user_notifications" FOR
SELECT TO "authenticated" USING (
    (
        (
            SELECT "auth"."uid"() AS "uid"
        ) = "user_id"
    )
);

CREATE POLICY "only_user_can_update_their_notification" ON "public"."user_notifications" FOR
UPDATE TO "authenticated" USING (
    (
        (
            SELECT "auth"."uid"() AS "uid"
        ) = "user_id"
    )
);

CREATE POLICY "only_user_can_delete_their_notification" ON "public"."user_notifications" FOR DELETE TO "authenticated" USING (
    (
        (
            SELECT "auth"."uid"() AS "uid"
        ) = "user_id"
    )
);

-- Account Delete Tokens Policies
CREATE POLICY "All authenticated users can request deletion" ON "public"."account_delete_tokens" FOR
INSERT TO "authenticated" WITH CHECK (TRUE);

CREATE POLICY "User can only read their own deletion token" ON "public"."account_delete_tokens" FOR
SELECT TO "authenticated" USING (
    (
        (
            SELECT "auth"."uid"() AS "uid"
        ) = "user_id"
    )
);

CREATE POLICY "User can only update their own deletion token" ON "public"."account_delete_tokens" FOR
UPDATE TO "authenticated" USING (
    (
        (
            SELECT "auth"."uid"() AS "uid"
        ) = "user_id"
    )
);

CREATE POLICY "User can only delete their own deletion token" ON "public"."account_delete_tokens" FOR DELETE TO "authenticated" USING (
    (
        (
            SELECT "auth"."uid"() AS "uid"
        ) = "user_id"
    )
);
