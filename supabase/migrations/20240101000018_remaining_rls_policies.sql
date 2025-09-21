-- Migration 18: Remaining RLS Policies
-- Creates all remaining RLS policies for project, AI, marketing, feedback, billing, and app systems

-- Project System RLS Policies
CREATE POLICY "All authenticated users can create projects" ON "public"."projects" FOR
INSERT TO "authenticated" WITH CHECK (TRUE);

CREATE POLICY "Workspace members can view projects" ON "public"."projects" FOR
SELECT TO authenticated USING (
    "public"."is_workspace_member"(
        (
            SELECT auth.uid()
        ),
        workspace_id
    )
);

-- AI/Chat System RLS Policies
CREATE POLICY "Users can perform all operations on their own chats" ON "public"."chats" FOR ALL USING (
    "user_id" = (
        SELECT auth.uid()
    )
) WITH CHECK (
    "user_id" = (
        SELECT auth.uid()
    )
);

-- Marketing System RLS Policies
CREATE POLICY "Author profiles are visible to everyone" ON "public"."marketing_author_profiles" FOR
SELECT USING (TRUE);

CREATE POLICY "Tags are visible to everyone" ON "public"."marketing_tags" FOR
SELECT USING (TRUE);

CREATE POLICY "Published blog posts are visible to everyone" ON "public"."marketing_blog_posts" FOR
SELECT USING ("status" = 'published');

-- Billing System RLS Policies
CREATE POLICY "Everyone can view plans" ON public.billing_products FOR
SELECT USING (TRUE);

CREATE POLICY "Everyone can view billing_prices" ON public.billing_prices FOR
SELECT USING (TRUE);

-- App Settings RLS Policies
CREATE POLICY "Admins can view settings" ON "public"."app_settings" FOR
SELECT TO authenticated USING (public.is_application_admin(auth.uid()));

-- User Roles Admin Policies
CREATE POLICY "All supabase auth admin can view" ON "public"."user_roles" FOR
SELECT TO "supabase_auth_admin" USING (TRUE);
