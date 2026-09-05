-- ============================================================
-- Resume Builder Schema
-- Migration 005 — depends on 001_schema.sql
-- ============================================================

-- ============================================================
-- RESUME DOCUMENTS
-- A user can have many. `data` stores the canonical ResumeData
-- JSON shape (profile, summary, skills, experience, education,
-- certifications) — the same shape every template component and
-- both resume agents (fill/critique) read and write.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.resume_documents (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    template_id TEXT NOT NULL,
    data        JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS resume_documents_user_id_idx
    ON public.resume_documents (user_id);

-- ============================================================
-- RESUME CRITIQUES
-- Append-only feedback records from the resume-critique agent.
-- resume_document_id is nullable so a critique record survives
-- if its source document is later deleted.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.resume_critiques (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resume_document_id     UUID REFERENCES public.resume_documents(id) ON DELETE SET NULL,
    target_job_description TEXT,
    feedback               JSONB NOT NULL DEFAULT '{}',
    created_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS resume_critiques_user_id_idx
    ON public.resume_critiques (user_id);
CREATE INDEX IF NOT EXISTS resume_critiques_resume_document_id_idx
    ON public.resume_critiques (resume_document_id);

-- ============================================================
-- UPDATED_AT TRIGGER (resume_documents only — critiques are append-only)
-- ============================================================

CREATE TRIGGER resume_documents_updated_at
    BEFORE UPDATE ON public.resume_documents
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.resume_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_critiques ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own resume documents"
    ON public.resume_documents FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all resume documents"
    ON public.resume_documents FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Users manage own resume critiques"
    ON public.resume_critiques FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all resume critiques"
    ON public.resume_critiques FOR SELECT
    USING (public.is_admin());
