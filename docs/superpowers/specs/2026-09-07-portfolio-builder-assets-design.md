# Portfolio Builder — Sub-project 3: Asset Upload & Storage

## Context

This is the third of six sub-projects that make up the **Portfolio Builder** mini-app (see
`docs/superpowers/specs/2026-09-06-portfolio-builder-renderer-design.md` for the full
decomposition; sub-project 1, the schema/grid/renderer, and sub-project 2, theme presets, are
already complete on this branch).

This is the first thing in this repo to touch Supabase Storage — confirmed via research before
sub-project 1 that no bucket, RLS-on-`storage.objects` policy, or upload-and-persist flow exists
anywhere in the codebase today (the existing resume-builder upload only extracts text server-side
and never persists the file).

## Goals

- A Supabase Storage bucket + a `portfolio_assets` Postgres metadata table, so a user can upload
  an image (for an Image/Card/Carousel item's `src`) or a document (for a "download resume"
  link-button's `href`) and have it durably, securely stored and referenced from their page JSON.
- Direct-from-browser uploads (the standard, secure Supabase pattern): the client calls
  `supabase.storage.from(...).upload(...)` itself, governed entirely by RLS — no new API route.
- A small package-level upload/delete/list utility other sub-projects (and eventually the editor)
  call, following this codebase's existing "take the Supabase client as a parameter" convention
  (`checkAppAccess(supabase, userId, appSlug)` in `src/lib/auth/appAccess.ts`) rather than the
  spoke package constructing or importing a client of its own.

## Non-goals (deferred to later sub-projects)

- **No upload UI** (dropzone, progress bar, asset picker/gallery) — unlike sub-project 2's
  `ThemePicker`, the original decomposition scopes sub-project 3 as storage infrastructure only.
  A real upload UI is sub-project 4 (the editor)'s concern.
- **No image processing/resizing/optimization** — files are stored as uploaded. If thumbnailing
  or format conversion is ever needed, that's a separate future concern (e.g. a Supabase Storage
  transform or an Edge Function), not this sub-project.
- **No usage/quota limiting beyond the flat per-file size caps below.** This repo has an existing
  `project-gateway` usage-limit pattern (`getAppUsage`/`recordAppUsage`) used to rate-limit AI
  agent runs, but applying it here (e.g. "max total storage per user") is out of scope unless
  abuse becomes a real problem — YAGNI for a personal-portfolio image/resume upload.
- **No virus/malware scanning.** Standard Supabase Storage risk profile; not addressed here.

## Storage bucket

Bucket id/name: **`portfolio-assets`**, **public** (`public: true`). Published portfolio pages
must render images and serve document links with zero auth and no signed URLs — a public bucket
lets `getPublicUrl()` return a directly-usable URL. The public flag only affects _reads_; writes
remain fully governed by RLS (below).

**Path convention:** `{userId}/{assetId}-{sanitizedFilename}` — e.g.
`3f2a.../7c91a2b3-headshot.jpg`. The UUID prefix (`assetId`, generated client-side via
`crypto.randomUUID()`) guarantees no collision even if two uploads share a filename, and keeps the
original filename visible for readability/downloads. Because every upload gets a fresh path, there
is never a need to _replace_ an existing object — delete-and-re-upload is the only mutation path,
so no `UPDATE` policy on `storage.objects` is needed.

**Allowed types & size limits** (enforced both client-side, for fast feedback, and at the bucket
level, so the limit can't be bypassed by a client that skips the check):

| Kind     | MIME types                                           | Max size |
| -------- | ---------------------------------------------------- | -------- |
| image    | `image/jpeg`, `image/png`, `image/webp`, `image/gif` | 5 MB     |
| document | `application/pdf`                                    | 10 MB    |

The bucket's own `file_size_limit` is set to the larger of the two (10 MB) as a hard ceiling;
finer per-kind limits (5 MB for images) are enforced in the package's upload function, since a
Postgres/Storage bucket only supports one flat size limit, not one per MIME type.

## `portfolio_assets` table

Mirrors the existing `resume_documents` table's shape and RLS pattern exactly (see
`supabase/005_resume_builder.sql`):

```sql
CREATE TABLE IF NOT EXISTS public.portfolio_assets (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    storage_path      TEXT NOT NULL UNIQUE,
    original_filename TEXT NOT NULL,
    mime_type         TEXT NOT NULL,
    size_bytes        INTEGER NOT NULL CHECK (size_bytes > 0),
    kind              TEXT NOT NULL CHECK (kind IN ('image', 'document')),
    created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

One row per uploaded object — this is what lets a future "my uploads" UI list assets without
calling the Storage `.list()` API, and gives clean paired deletion (delete the DB row and the
Storage object together, in that order — see Error handling below).

## Migration & RLS

New file `supabase/010_portfolio_assets.sql` (next sequential number on this branch). **Known
risk, flagged for merge time:** the branch this worktree forked from
(`feat/hub-and-spoke-monorepo`) has separate, uncommitted work already claiming
`supabase/010_app_access_requests.sql` — a numbering collision is likely when these branches
converge and will need a trivial rename of one file; not addressed further here since it can't be
resolved without visibility into that other branch's final state.

```sql
-- ============================================================
-- PORTFOLIO ASSETS
-- Migration 010 — depends on 001_schema.sql
-- User-uploaded images and documents referenced from a
-- PortfolioPage's grid item props (an Image src, a link-button
-- href pointing at a resume PDF, etc).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.portfolio_assets (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    storage_path      TEXT NOT NULL UNIQUE,
    original_filename TEXT NOT NULL,
    mime_type         TEXT NOT NULL,
    size_bytes        INTEGER NOT NULL CHECK (size_bytes > 0),
    kind              TEXT NOT NULL CHECK (kind IN ('image', 'document')),
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS portfolio_assets_user_id_idx
    ON public.portfolio_assets (user_id);

-- ============================================================
-- STORAGE BUCKET
-- Public: published pages render images/download links with no
-- auth via getPublicUrl(). Writes are still governed by RLS below.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'portfolio-assets',
    'portfolio-assets',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.portfolio_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own portfolio assets"
    ON public.portfolio_assets FOR ALL
    TO authenticated
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Admins can view all portfolio assets"
    ON public.portfolio_assets FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- storage.objects: only the owner may write/delete inside their own
-- {user_id}/ folder. Public reads go through the bucket's public
-- flag above, not a permissive SELECT policy here.

CREATE POLICY "Users can upload to own portfolio-assets folder"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'portfolio-assets'
        AND (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
    );

CREATE POLICY "Users can view own portfolio-assets folder"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'portfolio-assets'
        AND (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
    );

CREATE POLICY "Users can delete own portfolio-assets folder"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'portfolio-assets'
        AND (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
    );
```

**Deliberate deviations from this repo's existing RLS style, applied to new code only:** existing
migrations use bare `auth.uid()` (not wrapped in `(select ...)`, which the current Supabase
security guidance flags as a performance issue — the function gets called per-row instead of
once) and `auth.role() = 'authenticated'` (deprecated in favor of `TO authenticated`, and unsafe
if anonymous sign-ins are ever enabled, since anonymous users also carry the `authenticated`
Postgres role). This migration uses the current recommended patterns since it's new code, not a
retrofit of the older migrations (rewriting those is out of scope for this sub-project):
`(select auth.uid())` and `TO authenticated` for the `portfolio_assets` table policies, and
`(select auth.jwt()->>'sub')` for the `storage.objects` folder-comparison policies specifically —
confirmed against Supabase's current documented example for per-user-folder storage policies
(fetched live while writing this spec, not recalled from training data), which uses
`auth.jwt()->>'sub'` rather than `auth.uid()::text` for that comparison.

## Package-level upload utility

`packages/portfolio-builder/src/assets/`:

```ts
// types.ts
export interface PortfolioAsset {
  id: string;
  userId: string;
  storagePath: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  kind: 'image' | 'document';
  createdAt: string;
  publicUrl: string;
}
```

```ts
// upload.ts (signatures; full implementation is a plan concern)
export async function uploadPortfolioAsset(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<PortfolioAsset>;

export async function deletePortfolioAsset(
  supabase: SupabaseClient,
  assetId: string
): Promise<void>;

export async function listPortfolioAssets(
  supabase: SupabaseClient,
  userId: string
): Promise<PortfolioAsset[]>;
```

`SupabaseClient` comes from `@supabase/supabase-js`, added as a `peerDependency` of
`@true-tech-team/portfolio-builder` (already a root dependency of the app, matching how `react`
and `@true-tech-team/react-components` are peer-declared today).

`uploadPortfolioAsset` determines `kind` from `file.type` (`image/*` → `'image'`,
`application/pdf` → `'document'`; anything else is rejected before any network call), validates
size against the per-kind limit above, generates `assetId` via `crypto.randomUUID()`, sanitizes
the filename (strip anything outside `[a-zA-Z0-9._-]`), uploads to
`{userId}/{assetId}-{sanitizedFilename}`, inserts the `portfolio_assets` row, resolves the public
URL, and returns the combined `PortfolioAsset`.

**Error handling:** if the Storage upload succeeds but the subsequent DB insert fails, the
function must delete the now-orphaned Storage object before rethrowing — otherwise a failed
upload leaves an untracked file with no metadata row and no way for the user to find or remove
it. `deletePortfolioAsset` deletes the DB row first, then the Storage object, so a mid-failure
leaves an orphaned Storage object (harmless, invisible to the user, cleanable manually) rather
than a DB row pointing at a file that no longer exists (which would break page rendering if that
row's storage path were ever referenced again).

## Testing

- Unit tests for filename sanitization and kind-detection-from-MIME-type (pure functions, no
  network).
- Unit tests for size-limit validation (image over 5MB rejected, document over 10MB rejected,
  valid sizes accepted) using a mocked `SupabaseClient` (this package has no integration/E2E test
  infrastructure — the `SupabaseClient` parameter is mocked the same way `checkAppAccess`-style
  functions would be tested elsewhere in this codebase, i.e. a lightweight object satisfying just
  the methods called: `storage.from().upload()`, `storage.from().getPublicUrl()`,
  `from().insert()`, `from().delete()`).
- A test asserting `uploadPortfolioAsset` calls the Storage delete when the DB insert fails
  (verifies the orphan-cleanup error-handling path).
- SQL-level testing (RLS policy correctness, bucket config) is out of scope for this package's
  Vitest suite — verified manually/via Supabase's own advisor tooling when the migration is
  actually applied to a project, consistent with how the existing 9 migrations in this repo have
  no automated test coverage either.

## Open items carried to later sub-projects

- How the editor (sub-project 4) surfaces uploaded assets to a user (a picker/gallery UI) is
  entirely its concern — this sub-project only guarantees `listPortfolioAssets` exists to build
  that on top of.
- Whether documents beyond PDF (e.g. `.docx`) are ever needed for "download resume"-style buttons
  is deferred until a real need surfaces — adding a MIME type later is a small, additive change to
  both the bucket's `allowed_mime_types` and the package's kind-detection logic.
