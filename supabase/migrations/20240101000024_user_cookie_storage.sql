-- Migration 25: User Cookie Storage
-- Secure storage for user browser cookies with encryption at rest

-- Create user_cookies table for storing encrypted Netscape-format cookies
CREATE TABLE public.user_cookies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    encrypted_cookies TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('youtube', 'vimeo', 'instagram', 'tiktok', 'generic')),
    label TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT unique_user_platform_label UNIQUE(user_id, platform, label)
);

-- Create cookie_audit_logs table for security monitoring
CREATE TABLE public.cookie_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cookie_id UUID REFERENCES public.user_cookies(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('created', 'used', 'refreshed', 'deleted', 'expired')),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_cookies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookie_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_cookies
CREATE POLICY "Users can view their own cookies"
    ON public.user_cookies FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cookies"
    ON public.user_cookies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cookies"
    ON public.user_cookies FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cookies"
    ON public.user_cookies FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for cookie_audit_logs
CREATE POLICY "Users can view their own audit logs"
    ON public.cookie_audit_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
    ON public.cookie_audit_logs FOR INSERT
    WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_user_cookies_user_id ON public.user_cookies(user_id);
CREATE INDEX idx_user_cookies_expires_at ON public.user_cookies(expires_at);
CREATE INDEX idx_user_cookies_is_active ON public.user_cookies(is_active);
CREATE INDEX idx_user_cookies_platform ON public.user_cookies(platform);
CREATE INDEX idx_cookie_audit_logs_user_id ON public.cookie_audit_logs(user_id);
CREATE INDEX idx_cookie_audit_logs_created_at ON public.cookie_audit_logs(created_at);
CREATE INDEX idx_cookie_audit_logs_cookie_id ON public.cookie_audit_logs(cookie_id);

-- Helper function to check if cookie is expired
CREATE OR REPLACE FUNCTION public.is_cookie_expired(cookie_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM "public"."user_cookies"
        WHERE "id" = cookie_id
        AND "expires_at" < NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Helper function to get active cookie for user
CREATE OR REPLACE FUNCTION public.get_active_user_cookie(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    encrypted_cookies TEXT,
    platform TEXT,
    label TEXT,
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        uc."id",
        uc."encrypted_cookies",
        uc."platform",
        uc."label",
        uc."expires_at"
    FROM "public"."user_cookies" uc
    WHERE uc."user_id" = p_user_id
    AND uc."is_active" = TRUE
    AND uc."expires_at" > NOW()
    ORDER BY uc."created_at" DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Table comments for documentation
COMMENT ON TABLE public.user_cookies IS 'Stores encrypted browser cookies for authenticated media downloads';
COMMENT ON TABLE public.cookie_audit_logs IS 'Security audit trail for all cookie-related operations';
COMMENT ON COLUMN public.user_cookies.encrypted_cookies IS 'AES-256 encrypted Netscape format cookie string';
COMMENT ON COLUMN public.user_cookies.platform IS 'Platform the cookies are for (youtube, vimeo, etc.)';
COMMENT ON COLUMN public.user_cookies.label IS 'User-friendly label to identify this cookie set';
COMMENT ON COLUMN public.user_cookies.expires_at IS 'Automatic expiration after 30 days (can be overridden based on cookie expiration)';
