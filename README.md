# True Tech Team

The main True Tech Team site: a Next.js portfolio and member dashboard, with Supabase-backed
authentication and a recipe AI agent behind the login wall.

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **Supabase Auth** via `@supabase/ssr`
- **SCSS Modules** for styling
- **[@true-tech-team/ui-components](https://github.com/TrueTechTeam/react-components)** for shared UI

## Getting Started

### Prerequisites

- Node.js 22+
- npm

### Environment Setup

Copy the example environment file and fill in real values:

```bash
cp .env.local.example .env.local
```

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_STORYBOOK_URL=/storybook
```

### Development

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

### Build

```bash
npm run build
npm start
```

## Scripts

```bash
npm run dev              # Dev server
npm run build             # Production build
npm start                 # Start production server (after build)
npm run lint               # ESLint
npm run typecheck          # tsc --noEmit
npm run format:check       # Prettier check
npm run lint:styles        # Stylelint for CSS/SCSS
npm run e2e                # Playwright e2e tests
```

## Deployment

Deployed on Netlify via git integration — every push to `master` triggers a build
(`npm run build`, publishing `.next` via `@netlify/plugin-nextjs`). See `netlify.toml`.

## More

See [CLAUDE.md](./CLAUDE.md) for directory structure, coding conventions, and guidance for working
in this repo with Claude Code.
