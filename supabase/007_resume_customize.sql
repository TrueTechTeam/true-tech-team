-- ============================================================
-- Resume Customize — lineage columns + usage limit
-- Migration 007 — depends on 004_job_search.sql, 005_resume_builder.sql
--
-- Lets a saved resume_documents row be tailored toward a specific
-- job_search_jobs row, producing a new resume_documents row. These columns
-- record that lineage (which source resume, which job) the same way
-- resume_critiques.resume_document_id already records critique lineage.
-- ============================================================

ALTER TABLE public.resume_documents
    ADD COLUMN IF NOT EXISTS source_document_id UUID REFERENCES public.resume_documents(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS job_search_job_id  UUID REFERENCES public.job_search_jobs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS resume_documents_source_document_id_idx
    ON public.resume_documents (source_document_id);
CREATE INDEX IF NOT EXISTS resume_documents_job_search_job_id_idx
    ON public.resume_documents (job_search_job_id);

INSERT INTO public.app_usage_limits (app_slug, period, max_uses) VALUES
    ('resume-builder-customize', 'day', 3)
ON CONFLICT (app_slug) DO NOTHING;
