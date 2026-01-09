# True Tech Team - Component Library Project Overview

## Project Architecture

This is an **Nx monorepo** hosting a publishable React component library called `@true-tech-team/ui-components`. The library is designed for web applications with a comprehensive theming system, utility classes, and modern development tooling.

### Key Technologies

- **Nx 20.8.0**: Monorepo build system and task orchestration
- **React 18.3.1**: UI framework with automatic JSX runtime
- **TypeScript 5.7.2**: Strict type safety throughout
- **Vite 6.4.1**: Lightning-fast builds and HMR
- **SCSS Modules**: Component styling with CSS variables
- **Storybook 8.0**: Component documentation and visual testing
- **Jest + Testing Library**: Unit testing with jsdom

## Critical Design Decisions

### 1. SCSS Modules Over CSS-in-JS

**Decision**: Use SCSS Modules instead of Emotion or styled-components

**Rationale**:
- Better Windows compatibility (no native dependencies)
- Zero runtime overhead (all CSS generated at build time)
- Superior theming capabilities with CSS custom properties
- Familiar syntax for developers coming from traditional CSS
- Better integration with design tokens and global styles

**Implementation**:
- Component styles: `Component.module.scss`
- Global styles: `libs/ui-components/src/lib/styles/`
- CSS variables for runtime theme switching

### 2. 4px Grid System

**Decision**: All spacing uses multiples of 4px (0-20 units = 0-80px)

**Rationale**:
- Creates visual rhythm and consistency
- Aligns with modern design systems (Material Design, etc.)
- Simplifies responsive design calculations
- Easy mental math (4, 8, 16, 24, 32...)

**Implementation**:
```scss
$spacing-unit: 4px;
$spacing-xs: 4px;   // 1 unit
$spacing-sm: 8px;   // 2 units
$spacing-md: 16px;  // 4 units
$spacing-lg: 24px;  // 6 units
$spacing-xl: 32px;  // 8 units
```

**Utility classes**: `.m-0` through `.m-20`, `.p-0` through `.p-20` (with all directions)

### 3. CSS Variables for Theme Switching

**Decision**: Use CSS custom properties instead of context-based re-renders

**Rationale**:
- Theme changes require zero React re-renders
- Near-instant theme switching performance
- Easier to override at component level
- Works seamlessly with SSR

**Implementation**:
```typescript
// Change theme mode
document.documentElement.setAttribute('data-theme', 'dark');

// CSS automatically switches
:root[data-theme='light'] { --theme-primary: var(--color-blue-600); }
:root[data-theme='dark'] { --theme-primary: var(--color-blue-500); }
```

### 4. Component Decorator Pattern

**Decision**: All components use HOC decorator for consistency

**Rationale**:
- Enforces consistent prop handling across all components
- Automatic CSS variable injection
- Standardized className merging
- Built-in data attribute support

**Usage**:
```typescript
export const MyComponent = withComponentDecorator(
  ({ className, ...props }) => { /* ... */ }
);
```

### 5. Single Publishable Package

**Decision**: Publish as one package instead of splitting by domain

**Rationale**:
- Simpler dependency management for consumers
- Easier version coordination
- Better tree-shaking with modern bundlers
- Can always split later if needed

**Package name**: `@true-tech-team/ui-components`

## Project Structure

```
true-tech-team/
├── libs/
│   └── ui-components/                    # Main component library
│       ├── .storybook/                   # Storybook configuration
│       ├── src/
│       │   ├── lib/
│       │   │   ├── assets/               # Icons, images, fonts
│       │   │   ├── components/           # React components
│       │   │   │   ├── Button/
│       │   │   │   │   ├── Button.tsx
│       │   │   │   │   ├── Button.module.scss
│       │   │   │   │   ├── Button.test.tsx
│       │   │   │   │   ├── Button.stories.tsx
│       │   │   │   │   └── index.ts
│       │   │   │   └── Icon/
│       │   │   ├── contexts/             # React contexts
│       │   │   │   └── ThemeContext/
│       │   │   ├── decorators/           # HOCs and enhancers
│       │   │   │   └── ComponentDecorator/
│       │   │   ├── hooks/                # Custom React hooks
│       │   │   ├── providers/            # Provider components
│       │   │   │   └── GlobalProvider/
│       │   │   ├── styles/               # Global styles and themes
│       │   │   │   ├── global/           # Utility classes
│       │   │   │   ├── theme/            # Theme files
│       │   │   │   └── index.scss        # Main entry
│       │   │   ├── types/                # TypeScript types
│       │   │   └── utils/                # Utility functions
│       │   ├── index.ts                  # Main export file
│       │   ├── test-setup.ts             # Jest setup
│       │   └── globals.d.ts              # Global type declarations
│       ├── jest.config.ts
│       ├── project.json                  # Nx project config
│       ├── tsconfig.json
│       └── vite.config.ts
├── .claude/                              # Claude guidance files
├── eslint.config.mjs                     # ESLint flat config
├── nx.json                               # Nx workspace config
├── package.json
├── tsconfig.base.json
└── ProjectSetup.md                       # Original requirements
```

## Theme System Architecture

### Color System

**370+ CSS Variables**: 37 color families × 10 shades (50-900)

**Color families**:
- Neutrals: white, black, gray, slate, zinc, stone
- Primary colors: red, orange, amber, yellow, lime, green, emerald, teal, cyan, blue, indigo, violet, purple, fuchsia, pink, rose
- Specialized: brown, warm-gray, cool-gray, blue-gray, true-gray

**Naming pattern**: `--color-{family}-{shade}` (e.g., `--color-blue-500`)

### Semantic Tokens

Map color primitives to semantic meaning:

**Light theme**:
```scss
--theme-primary: var(--color-blue-600);
--theme-secondary: var(--color-gray-600);
--theme-background-primary: var(--color-white);
--theme-text-primary: var(--color-gray-900);
```

**Dark theme**:
```scss
--theme-primary: var(--color-blue-500);
--theme-secondary: var(--color-gray-400);
--theme-background-primary: var(--color-gray-900);
--theme-text-primary: var(--color-gray-100);
```

### Theme Provider

```typescript
import { GlobalProvider } from '@true-tech-team/ui-components';

function App() {
  return (
    <GlobalProvider themeConfig={{ mode: 'dark' }}>
      {/* Your app */}
    </GlobalProvider>
  );
}
```

## Component Architecture

### Component Pattern

Every component follows this structure:

1. **Props interface** with TypeScript types
2. **forwardRef** for ref support
3. **Component decorator** HOC wrapper
4. **SCSS module** for styles
5. **Unit tests** with Testing Library
6. **Storybook stories** for documentation

### Example Component Structure

```
Button/
├── Button.tsx              # Component implementation
├── Button.module.scss      # Scoped styles
├── Button.test.tsx         # Unit tests
├── Button.stories.tsx      # Storybook documentation
└── index.ts                # Re-exports
```

## Build System

### Nx Tasks

- `nx build ui-components`: Build production bundle
- `nx test ui-components`: Run Jest tests
- `nx lint ui-components`: Run ESLint
- `nx storybook ui-components`: Dev Storybook server
- `nx build-storybook ui-components`: Build static Storybook

### Build Output

Vite produces:
- **ESM bundle**: `dist/libs/ui-components/index.mjs`
- **Type declarations**: `dist/libs/ui-components/index.d.ts`
- **CSS bundle**: `dist/libs/ui-components/style.css`
- **Source maps**: For debugging

Bundle sizes (gzipped):
- CSS: ~6.78 KB
- JS: ~2.74 KB

### Tree Shaking

Modern bundlers can tree-shake unused components:

```typescript
// Only Icon gets bundled
import { Icon } from '@true-tech-team/ui-components';
```

## Testing Strategy

### Test Coverage Requirements

**Minimum thresholds** (configured in `jest.config.ts`):
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### What to Test

1. **Component rendering**: All variants, sizes, states
2. **User interactions**: Clicks, hovers, keyboard navigation
3. **Accessibility**: ARIA attributes, roles, labels
4. **Props**: All prop combinations and edge cases
5. **Error handling**: Invalid inputs, missing required props
6. **Theme integration**: Light/dark mode rendering

### Test File Location

Co-located with components: `Component.test.tsx` next to `Component.tsx`

## Storybook Documentation

### Purpose

- Visual component documentation
- Interactive component playground
- Accessibility testing with a11y addon
- Design system showcase

### Story Structure

Each component should have stories for:
- **Default**: Basic usage example
- **Variants**: All visual variants
- **Sizes**: All size options
- **States**: Disabled, loading, error, etc.
- **Interactive**: Complex interactions
- **Custom styling**: Override examples

### Theme Switching

Storybook includes a theme switcher in the toolbar for testing light/dark modes.

## Key Files Reference

### Configuration Files

- [nx.json](../nx.json) - Nx workspace configuration
- [package.json](../package.json) - Dependencies and scripts
- [tsconfig.base.json](../tsconfig.base.json) - Base TypeScript config
- [eslint.config.mjs](../eslint.config.mjs) - ESLint rules
- [libs/ui-components/vite.config.ts](../libs/ui-components/vite.config.ts) - Vite build config
- [libs/ui-components/jest.config.ts](../libs/ui-components/jest.config.ts) - Jest test config
- [libs/ui-components/project.json](../libs/ui-components/project.json) - Nx project targets

### Theme Files

- [libs/ui-components/src/lib/styles/theme/_colors.scss](../libs/ui-components/src/lib/styles/theme/_colors.scss) - 370+ color variables
- [libs/ui-components/src/lib/styles/theme/_variables.scss](../libs/ui-components/src/lib/styles/theme/_variables.scss) - Design tokens
- [libs/ui-components/src/lib/styles/theme/_light-theme.scss](../libs/ui-components/src/lib/styles/theme/_light-theme.scss) - Light theme
- [libs/ui-components/src/lib/styles/theme/_dark-theme.scss](../libs/ui-components/src/lib/styles/theme/_dark-theme.scss) - Dark theme

### Core Implementation Files

- [libs/ui-components/src/lib/contexts/ThemeContext/ThemeContext.tsx](../libs/ui-components/src/lib/contexts/ThemeContext/ThemeContext.tsx) - Theme state
- [libs/ui-components/src/lib/providers/GlobalProvider/GlobalProvider.tsx](../libs/ui-components/src/lib/providers/GlobalProvider/GlobalProvider.tsx) - Root provider
- [libs/ui-components/src/lib/decorators/ComponentDecorator/ComponentDecorator.tsx](../libs/ui-components/src/lib/decorators/ComponentDecorator/ComponentDecorator.tsx) - Component HOC
- [libs/ui-components/src/index.ts](../libs/ui-components/src/index.ts) - Main exports

## Development Workflow

### Starting Development

1. Install dependencies: `npm install`
2. Start Storybook: `nx storybook ui-components`
3. Run tests in watch mode: `nx test ui-components --watch`

### Adding a New Component

See [component-guide.md](./component-guide.md) for detailed instructions.

### Modifying the Theme

See [theme-guide.md](./theme-guide.md) for theme customization.

### Writing Tests

See [testing-guide.md](./testing-guide.md) for testing patterns.

## Known Issues and Limitations

### Peer Dependency Warnings

Vite 6.4.1 is newer than some plugins expect (built for Vite 5). This causes peer dependency warnings but doesn't affect functionality. Used `--legacy-peer-deps` during installation.

### Test Configuration

Jest/Babel configuration required adjustment for automatic JSX runtime. If you see JSX parsing errors, ensure `.babelrc` has:

```json
{
  "presets": [["@nx/react/babel", { "runtime": "automatic" }]]
}
```

## Future Considerations

### Potential Additions

- **More components**: Input, Select, Modal, Tooltip, Card, etc.
- **Form handling**: Integration with react-hook-form
- **Animations**: Framer Motion integration
- **React Native**: Separate package for mobile
- **Accessibility**: Automated a11y testing in CI
- **Visual regression**: Chromatic or Percy integration
- **Custom generators**: Nx generator for creating components

### Scaling Strategy

As the library grows:
- Consider splitting into domain-based packages (forms, navigation, data-display)
- Add performance monitoring (bundle size tracking)
- Implement automated releases with semantic versioning
- Create design token sync with Figma

## Questions or Issues?

Refer to the other Claude guidance files:
- [component-guide.md](./component-guide.md) - How to create components
- [theme-guide.md](./theme-guide.md) - Theme system details
- [testing-guide.md](./testing-guide.md) - Testing patterns
- [commands.md](./commands.md) - Common commands
