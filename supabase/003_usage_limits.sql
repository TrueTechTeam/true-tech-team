-- ============================================================
-- APP USAGE LIMITS & EVENTS
-- Per-app usage caps enforced by @true-tech-team/project-gateway.
-- An app with no row in app_usage_limits is treated as unlimited.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.app_usage_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_slug TEXT NOT NULL UNIQUE,
    period TEXT NOT NULL DEFAULT 'day' CHECK (period IN ('day', 'month', 'all_time')),
    max_uses INTEGER NOT NULL CHECK (max_uses > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    app_slug TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS app_usage_events_user_app_idx
    ON public.app_usage_events (user_id, app_slug, created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.app_usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_usage_events ENABLE ROW LEVEL SECURITY;

-- Usage limits: every authenticated user needs to read the configured cap
-- to know where they stand; only admins configure it.
CREATE POLICY "Authenticated users can read usage limits"
    ON public.app_usage_limits FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage usage limits"
    ON public.app_usage_limits FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Usage events: users record and read only their own; admins see all.
CREATE POLICY "Users can record own usage"
    ON public.app_usage_events FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own usage"
    ON public.app_usage_events FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all usage"
    ON public.app_usage_events FOR SELECT
    USING (public.is_admin());
