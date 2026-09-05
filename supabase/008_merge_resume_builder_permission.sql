-- ============================================================
-- Merge the 'resume-builder' access grant into 'job-search'
-- Migration 008 — Resume Builder is now only reachable from within
-- Job Search, so the two mini-apps share a single app_permissions slug.
-- ============================================================

-- Anyone who currently has 'resume-builder' but not 'job-search' gets
-- 'job-search' granted instead, preserving their access.
INSERT INTO public.app_permissions (user_id, app_slug, granted_by)
SELECT user_id, 'job-search', granted_by
FROM public.app_permissions
WHERE app_slug = 'resume-builder'
ON CONFLICT (user_id, app_slug) DO NOTHING;

-- The old slug is no longer checked anywhere in the app.
DELETE FROM public.app_permissions WHERE app_slug = 'resume-builder';
