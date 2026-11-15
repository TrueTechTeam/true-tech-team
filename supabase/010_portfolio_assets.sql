-- supabase/010_portfolio_assets.sql
-- ============================================================
-- PORTFOLIO ASSETS
-- Migration 010 — depends on 001_schema.sql
-- User-uploaded images and documents referenced from a
-- PortfolioPage's grid item props (an Image src, a link-button
-- href pointing at a resume PDF, etc).
--
-- NOTE: this migration has not been applied to any Supabase
-- project as part of this plan (no local dev environment, no
-- authenticated Supabase MCP connection available). Apply and
-- verify manually, then run `supabase db advisors` (or the MCP
-- get_advisors equivalent) before considering this task done.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.portfolio_assets (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    storage_path      TEXT NOT NULL UNIQUE,
    original_filename TEXT NOT NULL,
    mime_type         TEXT NOT NULL,
    size_bytes        INTEGER NOT NULL CHECK (size_bytes > 0),
    kind              TEXT NOT NULL CHECK (kind IN ('image', 'document')),
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS portfolio_assets_user_id_idx
    ON public.portfolio_assets (user_id);

-- ============================================================
-- STORAGE BUCKET
-- Public: published pages render images/download links with no
-- auth via getPublicUrl(). Writes are still governed by RLS below.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'portfolio-assets',
    'portfolio-assets',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.portfolio_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own portfolio assets"
    ON public.portfolio_assets FOR ALL
    TO authenticated
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Admins can view all portfolio assets"
    ON public.portfolio_assets FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- storage.objects: only the owner may write/delete inside their own
-- {user_id}/ folder. Public reads go through the bucket's public
-- flag above, not a permissive SELECT policy here.

CREATE POLICY "Users can upload to own portfolio-assets folder"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'portfolio-assets'
        AND (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
    );

CREATE POLICY "Users can view own portfolio-assets folder"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'portfolio-assets'
        AND (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
    );

CREATE POLICY "Users can delete own portfolio-assets folder"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'portfolio-assets'
        AND (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
    );
