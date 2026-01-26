# Landing App

A modern Next.js landing page application for the True Tech Team portfolio, featuring NextAuth authentication and integration with the UI Components library.

## Features

- **Next.js 16** - Built on the latest Next.js with App Router
- **NextAuth Authentication** - Credentials-based auth with JWT sessions
- **SCSS Modules** - Scoped styling with SCSS support
- **UI Components Integration** - Uses `@true-tech-team/ui-components` library
- **Responsive Design** - Mobile-first responsive layouts
- **Dark Mode Support** - Theme support via the UI components library

## Project Structure

```
libs/landing-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Auth route group (login, signup)
│   │   ├── (protected)/        # Protected routes (dashboard)
│   │   ├── api/auth/           # NextAuth API routes
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/
│   │   ├── auth/               # Authentication components
│   │   ├── home/               # Landing page sections
│   │   └── layout/             # Header, Footer
│   ├── lib/
│   │   ├── auth/               # NextAuth configuration
│   │   └── data/               # Static data (projects, features, team)
│   └── types/                  # TypeScript declarations
├── public/                     # Static assets
├── next.config.js              # Next.js configuration
└── .env.local.example          # Environment variables template
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Environment Setup

Copy the example environment file and configure it:

```bash
cp libs/landing-app/.env.local.example libs/landing-app/.env.local
```

Required environment variables:

```env
NEXTAUTH_URL=http://localhost:4200
NEXTAUTH_SECRET=your-secret-key-here
NEXT_PUBLIC_STORYBOOK_URL=/storybook
```

Generate a secret key:

```bash
openssl rand -base64 32
```

### Development

Run the development server:

```bash
npx nx serve landing-app
```

The app will be available at `http://localhost:4200`.

### Build

Build for production:

```bash
npx nx build landing-app
```

Or with production configuration:

```bash
npx nx build landing-app --configuration=production
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, projects, features, and team sections |
| `/login` | User login page |
| `/signup` | User registration page |
| `/dashboard` | Protected dashboard (requires authentication) |

## Authentication

The app uses NextAuth.js with a credentials provider. For the MVP, user data is stored in-memory.

To add database persistence, update `src/lib/auth/auth-options.ts` to use Prisma or another database adapter.

## Integration with UI Components

The landing app imports components from `@true-tech-team/ui-components`. The SCSS paths are configured in `next.config.js` to share styles with the component library.

## Scripts

From the monorepo root:

```bash
# Development
npx nx serve landing-app

# Build
npx nx build landing-app

# Lint
npx nx lint landing-app
```

## Deployment

The app is configured for Netlify deployment. Build output is generated to `dist/libs/landing-app`.

```bash
npm run build:netlify
```
