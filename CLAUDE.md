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

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Auth route group
│   │   ├── login/
│   │   └── signup/
│   ├── (protected)/          # Protected route group
│   │   └── dashboard/
│   ├── api/                   # API routes
│   │   └── auth/              # Auth API endpoints
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.scss          # Global styles
├── components/
│   ├── auth/                 # Auth components (LoginForm, SignupForm)
│   ├── home/                 # Landing page sections
│   ├── layout/               # Header, Footer
│   └── Providers.tsx         # Client providers wrapper
├── context/                  # React contexts
├── lib/
│   ├── auth/                 # Auth utilities
│   ├── data/                 # Static data (projects, features, team)
│   └── supabase/             # Supabase client setup
│       ├── client.ts         # Browser client
│       └── server.ts         # Server client
└── middleware.ts             # Next.js middleware (auth protection)
```

## Tech Stack

- **Next.js 16** with App Router
- **Supabase Auth** via `@supabase/ssr`
- **SCSS Modules** for styling
- **@true-tech-team/ui-components** for UI

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

**Always use components from `@true-tech-team/ui-components`**:

```typescript
import { Button, Input, Icon, GlobalProvider } from '@true-tech-team/ui-components';
```

Wrap the app with `GlobalProvider` for theming (done in `layout.tsx` or `Providers.tsx`).

## Styling

- Use SCSS Modules (`.module.scss`) for component styles
- Global styles in `app/globals.scss`
- `@true-tech-team/ui-components/index.css` is imported once in `app/layout.tsx` — the
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

| Route        | Description                         |
| ------------ | ----------------------------------- |
| `/`          | Landing page (hero, projects, team) |
| `/login`     | User login                          |
| `/signup`    | User registration                   |
| `/dashboard` | Protected dashboard                 |

## Deployment

Configured for Netlify (`netlify.toml`, `@netlify/plugin-nextjs`). `npm run build` builds the
Next.js app; Netlify publishes `.next` directly.

## Note on ui-components

`@true-tech-team/ui-components` is installed as an npm alias pointing at the actual published
package name (`@true-tech-team/react-components`) — see that repo's CLAUDE.md for why the names
differ. Import statements use `@true-tech-team/ui-components` as normal.

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
