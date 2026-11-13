-- ============================================================
-- AI USAGE METRICS
-- Adds per-call token/model tracking to app_usage_events so the admin
-- panel can show estimated cost (total + daily), not just request counts.
-- Nullable: pre-existing rows and any future usage-limit-only callers
-- keep these columns null.
-- ============================================================

ALTER TABLE public.app_usage_events
    ADD COLUMN IF NOT EXISTS model TEXT,
    ADD COLUMN IF NOT EXISTS input_tokens INTEGER,
    ADD COLUMN IF NOT EXISTS output_tokens INTEGER;
