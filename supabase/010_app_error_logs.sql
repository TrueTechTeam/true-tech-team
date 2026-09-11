-- ============================================================
-- APP ERROR LOGS
-- Durable, queryable record of agent/route failures per app, so an
-- incident can be diagnosed with a SQL query instead of relying on
-- ephemeral platform function logs. Written by
-- @true-tech-team/project-gateway's logAppError(), called from each
-- mini-app's API route on any agent-loop or DB-write failure.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.app_error_events (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    app_slug   TEXT NOT NULL,
    message    TEXT NOT NULL,
    context    JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS app_error_events_app_slug_idx
    ON public.app_error_events (app_slug, created_at);
CREATE INDEX IF NOT EXISTS app_error_events_user_idx
    ON public.app_error_events (user_id, created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.app_error_events ENABLE ROW LEVEL SECURITY;

-- Routes log errors under the requesting user's own session — no
-- service-role client involved, so INSERT needs an explicit policy.
CREATE POLICY "Users can record own app errors"
    ON public.app_error_events FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- This is an ops/diagnostic log, not a user-facing feature — only admins
-- need to read it.
CREATE POLICY "Admins can view all app errors"
    ON public.app_error_events FOR SELECT
    USING (public.is_admin());
