# True Tech Team

Nx monorepo for the True Tech Team React component library and applications.

## Projects

### @true-tech-team/ui-components

A comprehensive, themeable React component library with TypeScript and SCSS Modules.

**Location:** `libs/ui-components`

**Features:**

- 🎨 37 color families (370+ colors)
- 🌓 Dark/light mode theming
- 📏 4px grid spacing system
- 🧩 Reusable components (Button, Icon, more coming)
- 🛠️ 500+ utility classes
- 📦 Tree-shakeable, optimized builds

[View Component Library Documentation](./libs/ui-components/README.md)

## Quick Start

```bash
# Install dependencies
npm install

# Build the component library
nx build ui-components

# Run tests
nx test ui-components

# Lint
nx lint ui-components
```

## Development

This is an Nx monorepo. Use Nx commands to work with projects:

```bash
# Build a specific project
nx build <project-name>

# Run all builds
nx run-many -t build

# Test a project
nx test <project-name>

# Lint a project
nx lint <project-name>
```

## Project Structure

```
true-tech-team/
├── libs/
│   └── ui-components/          # React component library
│       ├── src/
│       │   ├── lib/
│       │   │   ├── components/ # UI components
│       │   │   ├── styles/     # SCSS themes and utilities
│       │   │   ├── types/      # TypeScript types
│       │   │   ├── hooks/      # React hooks
│       │   │   ├── contexts/   # React contexts
│       │   │   ├── providers/  # Provider components
│       │   │   ├── utils/      # Utility functions
│       │   │   └── assets/     # Icons and static assets
│       │   └── index.ts        # Main export
│       └── README.md
├── nx.json
├── package.json
└── tsconfig.base.json
```

## Built With

- **Nx** - Monorepo tooling
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **SCSS Modules** - Component styling
- **Jest** - Testing framework

## License

MIT
