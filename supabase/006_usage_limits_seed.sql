-- ============================================================
-- Usage limit seed data for the new job-search and resume-builder
-- apps. See 003_usage_limits.sql for the app_usage_limits schema
-- (an app_slug with no row here is treated as unlimited).
-- ============================================================

INSERT INTO public.app_usage_limits (app_slug, period, max_uses) VALUES
    ('job-search', 'day', 5),
    ('resume-builder-fill', 'day', 1),
    ('resume-builder-critique', 'day', 1)
ON CONFLICT (app_slug) DO NOTHING;
