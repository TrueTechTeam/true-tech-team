-- supabase/011_portfolio_pages.sql
-- ============================================================
-- PORTFOLIO PAGES
-- Migration 011 — depends on 001_schema.sql
-- A user's editable/publishable portfolio page. `data` holds the
-- parts of PortfolioPage (from @true-tech-team/portfolio-builder)
-- not already pulled into their own column: schemaVersion,
-- sections, themeOverride. schemaVersion is stored per-row so a
-- data migration can tell pre-pivot rows (no schemaVersion key)
-- from current ones.
--
-- NOTE: this migration has not been applied to any Supabase
-- project as part of this plan (no local dev environment, no
-- authenticated Supabase MCP connection available). Apply and
-- verify manually, then run `supabase db advisors` (or the MCP
-- get_advisors equivalent) before considering this task done —
-- same as 010_portfolio_assets.sql.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.portfolio_pages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    slug        TEXT NOT NULL UNIQUE,
    title       TEXT NOT NULL,
    template_id TEXT NOT NULL,
    theme_id    TEXT,
    published   BOOLEAN NOT NULL DEFAULT false,
    data        JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(data) = 'object'),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS portfolio_pages_user_id_idx
    ON public.portfolio_pages (user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE TRIGGER portfolio_pages_updated_at
    BEFORE UPDATE ON public.portfolio_pages
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.portfolio_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own portfolio pages"
    ON public.portfolio_pages FOR ALL
    TO authenticated
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Admins can view all portfolio pages"
    ON public.portfolio_pages FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Anyone (including signed-out visitors) can read a PUBLISHED page —
-- this is what the future /p/[slug] publish route (sub-project 6)
-- will rely on. The first anon-readable table in this app.
CREATE POLICY "Anyone can view published portfolio pages"
    ON public.portfolio_pages FOR SELECT
    TO anon, authenticated
    USING (published = true);
