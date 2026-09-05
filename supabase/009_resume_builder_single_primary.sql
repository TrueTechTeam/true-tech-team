-- ============================================================
-- One primary resume per user
-- Migration 009 — depends on 005_resume_builder.sql / 007_resume_customize.sql
--
-- Each user now edits exactly one "primary" resume (source_document_id IS
-- NULL) in the Resume Builder. Per-job tailored copies keep working exactly
-- as before (source_document_id / job_search_job_id set) and are unlimited —
-- this constraint only caps the number of *primary* documents per user at 1.
--
-- WARNING: destructive. If any user currently has more than one primary
-- resume, this keeps only the most-recently-updated one and DELETES the
-- rest. source_document_id is ON DELETE SET NULL, so any tailored copies
-- that pointed at a deleted primary survive, just with their lineage back
-- to that source cleared.
-- ============================================================

DELETE FROM public.resume_documents a
USING public.resume_documents b
WHERE a.source_document_id IS NULL
  AND b.source_document_id IS NULL
  AND a.user_id = b.user_id
  AND a.updated_at < b.updated_at;

CREATE UNIQUE INDEX IF NOT EXISTS resume_documents_one_primary_per_user
    ON public.resume_documents (user_id)
    WHERE source_document_id IS NULL;
