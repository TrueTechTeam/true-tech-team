-- ============================================================
-- Job Search Schema
-- Migration 004 — depends on 001_schema.sql
-- ============================================================

-- ============================================================
-- JOB SEARCH PROFILES
-- One row per user; profile + search-preference fields passed
-- to the Claude job-search agent as context. No API key column —
-- agents read ANTHROPIC_API_KEY server-side (see 003_usage_limits.sql
-- and the project-gateway package for the shared usage-limit model).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.job_search_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    -- Profile
    full_name           TEXT,
    title               TEXT,
    phone               TEXT,
    email               TEXT,
    location            TEXT,
    linkedin_url        TEXT,
    blog_url            TEXT,
    -- Search preferences
    target_title        TEXT,
    industry            TEXT,
    org_types           TEXT[] NOT NULL DEFAULT '{}',
    dream_companies     TEXT,
    priorities          TEXT[] NOT NULL DEFAULT '{}',
    search_location     TEXT,
    work_type           TEXT NOT NULL DEFAULT 'any' CHECK (work_type IN ('any', 'remote', 'hybrid', 'onsite')),
    willing_to_relocate BOOLEAN NOT NULL DEFAULT FALSE,
    salary_min          TEXT,
    salary_max          TEXT,
    experience_level    TEXT NOT NULL DEFAULT 'mid' CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead')),
    skills_focus        TEXT,
    exciting_work       TEXT,
    ideal_workday       TEXT,
    career_goal         TEXT,
    avoid_types         TEXT,
    open_prompt         TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS job_search_profiles_user_id_idx
    ON public.job_search_profiles (user_id);

-- ============================================================
-- JOB SEARCH JOBS
-- Suggestions produced by the job-search agent. status flows
-- suggested -> applied | dismissed; never hard-deleted.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.job_search_jobs (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status           TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'applied', 'dismissed')),
    title            TEXT NOT NULL,
    company          TEXT NOT NULL,
    company_website  TEXT,
    application_url  TEXT,
    description      TEXT,
    location         TEXT,
    work_type        TEXT,
    salary           TEXT,
    match_score      SMALLINT CHECK (match_score BETWEEN 0 AND 100),
    match_reason     TEXT,
    found_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    posted_date      TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS job_search_jobs_user_id_idx
    ON public.job_search_jobs (user_id);
CREATE INDEX IF NOT EXISTS job_search_jobs_user_status_idx
    ON public.job_search_jobs (user_id, status);
CREATE INDEX IF NOT EXISTS job_search_jobs_user_match_score_idx
    ON public.job_search_jobs (user_id, match_score);

-- ============================================================
-- JOB SEARCH APPLICATIONS
-- Always created from a job (via the Apply dialog). removed is a
-- soft-delete flag — rows are kept for history, never hard-deleted.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.job_search_applications (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id            UUID NOT NULL REFERENCES public.job_search_jobs(id) ON DELETE CASCADE,
    status            TEXT NOT NULL DEFAULT 'applied' CHECK (
                          status IN ('applied', 'phone_screen', 'interview', 'offer', 'rejected', 'withdrawn')
                      ),
    applied_date      DATE,
    confirmation_link TEXT,
    contact_person    TEXT,
    salary            TEXT,
    interview_date    TIMESTAMPTZ,
    notes             TEXT,
    removed           BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS job_search_applications_user_status_idx
    ON public.job_search_applications (user_id, status);
CREATE INDEX IF NOT EXISTS job_search_applications_user_removed_idx
    ON public.job_search_applications (user_id, removed);
CREATE INDEX IF NOT EXISTS job_search_applications_job_id_idx
    ON public.job_search_applications (job_id);

-- ============================================================
-- UPDATED_AT TRIGGERS (reuses public.set_updated_at from 002_recipe_agent.sql)
-- ============================================================

CREATE TRIGGER job_search_profiles_updated_at
    BEFORE UPDATE ON public.job_search_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER job_search_jobs_updated_at
    BEFORE UPDATE ON public.job_search_jobs
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER job_search_applications_updated_at
    BEFORE UPDATE ON public.job_search_applications
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.job_search_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_search_jobs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_search_applications ENABLE ROW LEVEL SECURITY;

-- job_search_profiles: each user owns their own row
CREATE POLICY "Users manage own job search profile"
    ON public.job_search_profiles FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- job_search_jobs: each user owns their own rows; admins can see all
CREATE POLICY "Users manage own job search jobs"
    ON public.job_search_jobs FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all job search jobs"
    ON public.job_search_jobs FOR SELECT
    USING (public.is_admin());

-- job_search_applications: each user owns their own rows; admins can see all
CREATE POLICY "Users manage own job search applications"
    ON public.job_search_applications FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all job search applications"
    ON public.job_search_applications FOR SELECT
    USING (public.is_admin());
