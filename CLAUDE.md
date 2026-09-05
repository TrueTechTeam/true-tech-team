# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repo — the main
True Tech Team site (Next.js portfolio + member dashboard).

## Commands

```bash
npm run dev              # Dev server at localhost:3000
npm run build            # Build for production
npm start                # Start production server (after build)
npm run lint             # Lint
npm run lint:fix         # Lint with auto-fix
npm run typecheck        # Type check
npm run format           # Format with Prettier
npm run format:check     # Check formatting
npm run lint:styles      # Stylelint for CSS/SCSS
npm run e2e              # Run Playwright e2e tests
```

## Directory Structure

This repo is a **hub-and-spoke monorepo** (npm workspaces, `packages/*`). The hub (`src/`) owns
routing, auth, and the dashboard shell; each member-facing project ("mini-app") is a spoke that
lives in its own workspace package. See
[Packages / Hub-and-Spoke Architecture](#packages--hub-and-spoke-architecture) before adding code
to either side.

```
src/
├── app/                       # Next.js App Router — hub routing only
│   ├── (auth)/                # Public auth pages (login, signup)
│   ├── (protected)/           # Authenticated routes
│   │   ├── admin/             # Admin panel (permissions, usage)
│   │   ├── dashboard/         # Mini-app launcher, driven by lib/apps/registry.ts
│   │   ├── recipes/           # Thin route wrappers → @true-tech-team/recipes
│   │   ├── job-search/        # Thin route wrappers → job-search spoke package
│   │   └── resume-builder/    # Thin route wrappers → resume-builder spoke code
│   ├── api/                   # API routes — auth/permission/usage wiring only;
│   │   │                      # business logic is imported from spoke packages
│   │   ├── auth/
│   │   ├── recipes/
│   │   ├── job-search/
│   │   └── resume-builder/
│   ├── layout.tsx             # Root layout
│   ├── page.tsx                # Home page
│   └── globals.scss           # Global styles
├── components/
│   ├── auth/                  # Auth components (LoginForm, SignupForm)
│   ├── home/                  # Landing page sections
│   └── layout/                # Header, Footer — hub chrome
├── context/                   # React contexts (hub-level, e.g. AuthContext)
├── lib/
│   ├── auth/                  # Auth/permission utilities
│   ├── apps/                  # registry.ts — the list of mini-apps shown on /dashboard
│   ├── data/                  # Static data (landing page projects, features, team)
│   └── supabase/               # Supabase client setup (client.ts, server.ts, middleware.ts)
└── middleware.ts                # Next.js middleware (auth protection)

packages/
├── agent-kit/                  # Shared: Anthropic tool-loop runner + NDJSON streaming
├── project-gateway/             # Shared: per-app permission + usage-limit gating
├── dashboard-kit/                # Shared: dashboard-shell UI (AppIcon, MiniAppHeader, ...)
├── recipes/                     # Spoke: Recipe AI Agent — all UI + business logic
└── job-search/                  # Spoke: Job Search (+ nested Resume Builder)
```

## Packages / Hub-and-Spoke Architecture

The site hosts multiple independent member-facing projects (Recipe AI Agent, Job Search, Resume
Builder, and more to come) from one dashboard. To keep them from turning into one tangled `src/`
tree, each project's UI and business logic lives in its own npm workspace package under
`packages/`, not scattered across `src/app` + `src/components` + `src/lib`.

**Hub** (`src/`) — owns:

- Routing (`src/app/**`) — thin `page.tsx`/`route.ts` files only. A page renders the spoke's
  top-level component; an API route does auth/permission/usage checks with Supabase, then calls
  into the spoke package for the actual logic.
- The dashboard shell, auth, and cross-app chrome: `Header`/`Footer`, `AuthContext`,
  `lib/auth`, `lib/supabase`, `lib/apps/registry.ts` (the list of mini-apps shown on `/dashboard`).

**Spoke packages** (`packages/<project>/`) — one per project (e.g. `@true-tech-team/recipes`).
Owns everything specific to that project: components, agent/business logic, DB row ↔ API type
mappers. A spoke package must not import from `src/app` or reach into another spoke package's
internals — if two spokes need the same thing, that thing belongs in a shared package instead.
A project that is conceptually "part of" a larger one (e.g. Resume Builder inside Job Search) is
nested as a subpath of that package (`packages/job-search/src/resume-builder/`) rather than
duplicating routing/permission plumbing for it.

**Shared packages** — anything used by **two or more** spokes (or by the hub and a spoke) is
pulled into its own package rather than duplicated or imported across spoke boundaries:

- `@true-tech-team/agent-kit` — the Anthropic tool-loop runner and NDJSON stream helpers used by
  every AI-agent-backed mini-app.
- `@true-tech-team/project-gateway` — the `ProjectGate` component + usage-limit checks every
  mini-app route wraps itself in.
- `@true-tech-team/dashboard-kit` — shared dashboard-shell UI (`AppIcon`, `MiniAppHeader`,
  `UsageIndicator`, `ConfirmDialog`, `FavoriteHeartButton`, `useUsageStatus`).

**Adding a new package**: create `packages/<name>/package.json` (`private: true`, `main`/`types`
pointing at `src/index.ts`, real deps in `peerDependencies`), run `npm install` at the repo root
to symlink it into `node_modules`, and add it to `transpilePackages` in `next.config.js` (Next.js
does not transpile workspace packages by default). Export the package's public surface from a
single `src/index.ts` — hub code and other packages should only ever import the package name, not
reach into its internal file paths.

**Rule of thumb**: if you're about to write `import ... from '../../../lib/<other-project>/...'`
or copy a component into a second project's folder, stop — either the code you're reaching for
belongs in a shared package, or the project you're building belongs in its own spoke package.

## Tech Stack

- **Next.js 16** with App Router
- **Supabase Auth** via `@supabase/ssr`
- **SCSS Modules** for styling
- **@true-tech-team/react-components** for UI

## Environment Variables

Create `.env.local` (copy from `.env.local.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_STORYBOOK_URL=/storybook
```

## Supabase Client Usage

```typescript
// Client components (browser)
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

// Server components/actions
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();
```

## Route Groups

- `(auth)` - Public auth pages (login, signup) - redirect to dashboard if authenticated
- `(protected)` - Authenticated routes - redirect to login if not authenticated

Middleware in `src/middleware.ts` handles auth redirects.

## Component Usage

**Always use components from `@true-tech-team/react-components`**:

```typescript
import { Button, Input, Icon, GlobalProvider } from '@true-tech-team/react-components';
```

Wrap the app with `GlobalProvider` for theming (done in `layout.tsx` or `Providers.tsx`).

## Styling

- Use SCSS Modules (`.module.scss`) for component styles
- Global styles in `app/globals.scss`
- `@true-tech-team/react-components/index.css` is imported once in `app/layout.tsx` — the
  `GlobalProvider` handles runtime theming on top of it
- Use CSS custom properties from the theme system

```scss
// page.module.scss
.hero {
  padding: var(--spacing-xxl) var(--spacing-md);
  background: var(--theme-surface);
}
```

## Pages

| Route             | Description                                             |
| ----------------- | ------------------------------------------------------- |
| `/`               | Landing page (hero, projects, team)                     |
| `/login`          | User login                                              |
| `/signup`         | User registration                                       |
| `/dashboard`      | Mini-app launcher (protected)                           |
| `/admin`          | Permission + usage admin panel (protected)              |
| `/recipes`        | Recipe AI Agent — `@true-tech-team/recipes` (protected) |
| `/job-search`     | Job Search mini-app (protected)                         |
| `/resume-builder` | Resume Builder mini-app (protected)                     |

## Deployment

Configured for Netlify (`netlify.toml`, `@netlify/plugin-nextjs`). `npm run build` builds the
Next.js app; Netlify publishes `.next` directly.

Netlify config is in `netlify.toml`.

## Adding New Pages

1. Create route directory in `src/app/` (use route groups for auth logic)
2. Add `page.tsx` for the route
3. Add `page.module.scss` for styles if needed
4. For protected routes, add to `(protected)/` group
5. Update middleware if custom auth logic needed

## Before Committing

Run these and confirm they all pass:

```bash
npm run lint            # eslint . --max-warnings=0
npm run typecheck       # tsc --noEmit
npm run format:check    # prettier --check
npm run lint:styles     # stylelint "**/*.{css,scss}"
npm run build            # next build
```

`npm run lint:fix`, `npm run format`, and `npm run lint:styles:fix` will auto-fix most issues.

## Commit Messages

Conventional Commits, enforced by commitlint (`commitlint.config.js` extends
`@commitlint/config-conventional`). A pre-commit hook (`.husky/pre-commit`) runs `npx lint-staged`,
which per `.lintstagedrc.json` runs Prettier + ESLint on staged `.ts/.tsx/.js/.jsx`, Prettier on
staged `.json/.md`, and Prettier + Stylelint on staged `.css/.scss`.

Examples:

```
feat(dashboard): add analytics card for admins
fix(auth): correct redirect loop on expired session
chore(deps): bump next to 16.0.11
```

## Pull Requests

Target branch: `master`. CI (`.github/workflows/pr.yml`) runs on every PR and must pass:

- **commit-lint** — validates commit messages via commitlint
- **ci** — `npm ci`, then `npm run lint`, `npm run lint:styles`, `npm run format:check`,
  `npm run typecheck`, `npm run build`

## Deployment

Netlify's git integration auto-deploys on every push to `master` — there is no GitHub Actions
deploy step (`pr.yml` only runs on pull requests). Netlify builds directly from `netlify.toml`:
build command `npm run build`, publish directory `.next`, `@netlify/plugin-nextjs` enabled.

Required environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_STORYBOOK_URL`) live in Netlify's dashboard (Site settings → Environment variables),
not in this repo.
