# Portfolio Builder — Schema, Grid & Renderer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `@true-tech-team/portfolio-builder` package's foundation: the `PortfolioPage`
JSON schema, hand-rolled validation, the 12-column Bootstrap-style responsive grid, a curated
registry of content components (custom primitives + wrapped `react-components`), and the
`PageRenderer` tree that turns a `PortfolioPage` into a live page.

**Architecture:** A new npm-workspace spoke package following the `recipes`/`job-search`
convention. Every grid item is atomic (no nested grids) and is rendered through a
`ComponentType → { component, validate }` registry, so the renderer never hard-codes which
components exist. Responsive behavior is fully automatic and CSS-driven — no client-side
breakpoint detection.

**Tech Stack:** TypeScript, React 19, Next.js 16 (workspace package, not a route), SCSS Modules,
`@true-tech-team/react-components` v1.2.1, Vitest + React Testing Library (new to this repo).

**Spec:** `docs/superpowers/specs/2026-09-06-portfolio-builder-renderer-design.md`

## Global Constraints

- ESLint runs with `--max-warnings=0`: no `any` (`@typescript-eslint/no-explicit-any`), no unused
  vars, no `key={index}` (`react/no-array-index-key`), use `import type` for type-only imports.
- Import every library component only from the flat barrel `@true-tech-team/react-components` —
  no subpath imports exist or are supported.
- Confirmed CSS custom property names shipped in `@true-tech-team/react-components/index.css`
  (verified directly against the file, do not use any other names): mode-aware tokens are
  `--theme-primary`, `--theme-secondary`, `--theme-background-{primary,secondary,tertiary}`,
  `--theme-surface-{primary,secondary,elevated,overlay}`,
  `--theme-text-{primary,secondary,tertiary,disabled,on-primary,placeholder,contrast}`,
  `--theme-border-{primary,secondary,focus,hover}`, `--theme-shadow-{sm,md,lg,xl}`; structural
  (unprefixed) tokens are `--spacing-{xxs,xs,sm,md,lg,xl,xxl}`, `--font-family-{primary,mono}`,
  `--font-size-{xs,sm,base,lg,xl,2xl,3xl,4xl}`, `--font-weight-{light,normal,medium,semibold,bold}`,
  `--radius-{none,sm,md,lg,xl,full}`.
- `PageRenderer` and everything under `render/` must never render `GlobalProvider` — theme
  application belongs to whoever owns the whole document (a later sub-project). Only wrapper
  components that manage their own open/closed UI state (`ExpandableText`) or that construct
  browser-event closures passed to a client child (`NavBar`) get a `'use client'` directive;
  everything else stays a plain (server-renderable) component.
- No schema-validation library: validation is hand-rolled TypeScript functions returning
  `string[]` of error messages.
- No unit test runner exists yet in this repo (only Playwright e2e) — Task 1 adds Vitest +
  React Testing Library as new root devDependencies; this becomes the standard for future
  packages too.
- Every `GridItem.props` value is `Record<string, unknown>` — wrapper components narrow/validate
  it themselves; the registry never assumes a shape beyond that.

---

### Task 1: Add Vitest test infrastructure

**Files:**

- Modify: `package.json` (add devDependencies + `test`/`test:watch` scripts)
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `src/lib/__smoke__/smoke.test.ts` (deleted at the end of this task once real tests exist
  elsewhere — see Step 5)

**Interfaces:**

- Produces: a working `npm test` (`vitest run`) command that discovers `*.test.ts`/`*.test.tsx`
  files under both `src/**` and `packages/**`, with `jsdom` environment and
  `@testing-library/jest-dom` matchers globally available. All later tasks depend on this.

- [ ] **Step 1: Write a smoke test to prove the config works before it exists**

```ts
// src/lib/__smoke__/smoke.test.ts
import { describe, it, expect } from 'vitest';

describe('vitest smoke test', () => {
  it('runs a basic assertion', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails because there is no test runner yet**

Run: `npx vitest run`
Expected: command not found / fails (no `vitest` installed, no config).

- [ ] **Step 3: Install Vitest + React Testing Library and add config**

Add to root `package.json` `devDependencies` (alphabetical, matching the existing style):

```json
"@testing-library/jest-dom": "^6.6.3",
"@testing-library/react": "^16.1.0",
"@vitejs/plugin-react": "^4.3.4",
"jsdom": "^25.0.1",
"vitest": "^2.1.8"
```

Add to root `package.json` `scripts` (after `"e2e"`):

```json
"test": "vitest run",
"test:watch": "vitest"
```

Create `vitest.config.ts` at the repo root:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'packages/**/*.test.{ts,tsx}'],
    css: true,
  },
});
```

Create `vitest.setup.ts` at the repo root:

```ts
import '@testing-library/jest-dom/vitest';

// jsdom does not implement scrollIntoView; NavBar's smooth-scroll click handler calls it.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
```

Run `npm install` at the repo root to install the new devDependencies.

- [ ] **Step 4: Run the smoke test and confirm it passes**

Run: `npm test`
Expected: PASS — 1 test passed.

- [ ] **Step 5: Delete the smoke test and commit**

The smoke test's only job was to prove the config works; every later task adds its own real
tests, so remove `src/lib/__smoke__/smoke.test.ts` and its now-empty `__smoke__` directory.

```bash
git add package.json package-lock.json vitest.config.ts vitest.setup.ts
git rm -r src/lib/__smoke__
git commit -m "test: add Vitest + React Testing Library test infrastructure"
```

---

### Task 2: Scaffold the `portfolio-builder` package

**Files:**

- Create: `packages/portfolio-builder/package.json`
- Create: `packages/portfolio-builder/src/index.ts`
- Modify: `next.config.js` (add to `transpilePackages`)

**Interfaces:**

- Produces: an installable, importable `@true-tech-team/portfolio-builder` workspace package with
  an empty-but-valid public surface. Every later task adds real exports to `src/index.ts`.

- [ ] **Step 1: Write a failing test that imports the package by its published name**

```ts
// packages/portfolio-builder/src/index.test.ts
import { describe, it, expect } from 'vitest';
import * as PortfolioBuilder from '@true-tech-team/portfolio-builder';

describe('@true-tech-team/portfolio-builder package', () => {
  it('is importable by its workspace package name', () => {
    expect(PortfolioBuilder).toBeDefined();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails to resolve the module**

Run: `npm test -- packages/portfolio-builder/src/index.test.ts`
Expected: FAIL — cannot find module `@true-tech-team/portfolio-builder` (package doesn't exist
yet, isn't installed/symlinked into `node_modules`).

- [ ] **Step 3: Create the package and register it**

```json
// packages/portfolio-builder/package.json
{
  "name": "@true-tech-team/portfolio-builder",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "peerDependencies": {
    "@true-tech-team/react-components": "^1.2.1",
    "react": "^19.0.0"
  }
}
```

```ts
// packages/portfolio-builder/src/index.ts
export const PORTFOLIO_BUILDER_SCHEMA_VERSION = 1;
```

In `next.config.js`, add `'@true-tech-team/portfolio-builder'` to the `transpilePackages` array
(alongside the existing five entries).

Run `npm install` at the repo root to symlink the new package into
`node_modules/@true-tech-team/portfolio-builder`.

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npm test -- packages/portfolio-builder/src/index.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/portfolio-builder next.config.js package.json package-lock.json
git commit -m "feat(portfolio-builder): scaffold package"
```

---

### Task 3: Schema types and hand-rolled validation

**Files:**

- Create: `packages/portfolio-builder/src/schema/types.ts`
- Create: `packages/portfolio-builder/src/schema/validate.ts`
- Test: `packages/portfolio-builder/src/schema/validate.test.ts`
- Modify: `packages/portfolio-builder/src/index.ts` (export the schema module)

**Interfaces:**

- Produces: `PortfolioPage`, `PageSection`, `SectionRow`, `GridItem`, `ComponentType` (types);
  `COMPONENT_TYPES: readonly ComponentType[]`, `isComponentType(value: string): value is
ComponentType`, `validatePortfolioPage(page: unknown): { valid: boolean; errors: string[] }`.
  Later tasks (registry, renderer) import `ComponentType` and `GridItem`/`PageSection`/
  `SectionRow`/`PortfolioPage` from here. `PortfolioPage.themeOverride` is typed against the
  existing `ThemeOverride` type from `@true-tech-team/react-components` (per the spec) but is not
  runtime-validated here — a deep-partial theme object's shape is out of scope for this sub-
  project's small, structural validator; sub-project 2 (theme presets) owns that concern.

- [ ] **Step 1: Write the failing validation tests**

```ts
// packages/portfolio-builder/src/schema/validate.test.ts
import { describe, it, expect } from 'vitest';
import { validatePortfolioPage } from './validate';
import type { PortfolioPage } from './types';

function makeValidPage(): PortfolioPage {
  return {
    schemaVersion: 1,
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'developer-01',
    showNav: true,
    sections: [
      {
        id: 'about',
        name: 'About',
        showInNav: true,
        background: 'primary',
        rows: [
          {
            id: 'row-1',
            items: [
              { id: 'item-1', component: 'heading', span: 8, props: { text: 'Hi' } },
              { id: 'item-2', component: 'avatar', span: 4, props: { initials: 'JT' } },
            ],
          },
        ],
      },
    ],
  };
}

describe('validatePortfolioPage', () => {
  it('accepts a well-formed page', () => {
    const result = validatePortfolioPage(makeValidPage());
    expect(result).toEqual({ valid: true, errors: [] });
  });

  it('rejects a row whose item spans sum to more than 12', () => {
    const page = makeValidPage();
    page.sections[0].rows[0].items[0].span = 10;
    page.sections[0].rows[0].items[1].span = 10;
    const result = validatePortfolioPage(page);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('exceeds 12'))).toBe(true);
  });

  it('rejects an unknown component type', () => {
    const page = makeValidPage();
    // @ts-expect-error -- deliberately invalid for the test
    page.sections[0].rows[0].items[0].component = 'not-a-real-component';
    const result = validatePortfolioPage(page);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('unknown component'))).toBe(true);
  });

  it('rejects a page missing a slug', () => {
    const page = makeValidPage();
    // @ts-expect-error -- deliberately invalid for the test
    page.slug = '';
    const result = validatePortfolioPage(page);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('slug'))).toBe(true);
  });

  it('rejects a non-object input', () => {
    const result = validatePortfolioPage(null);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npm test -- packages/portfolio-builder/src/schema/validate.test.ts`
Expected: FAIL — `./validate` and `./types` don't exist yet.

- [ ] **Step 3: Implement the schema types and validator**

```ts
// packages/portfolio-builder/src/schema/types.ts
import type { ThemeOverride } from '@true-tech-team/react-components';

export const COMPONENT_TYPES = [
  'heading',
  'text',
  'image',
  'spacer',
  'card',
  'badge',
  'avatar',
  'chip',
  'pill',
  'icon',
  'statusIndicator',
  'progressBar',
  'circularProgress',
  'kpi',
  'countUp',
  'reveal',
  'collapse',
  'flipCard',
  'carousel',
  'overflowText',
  'truncatedList',
  'button',
  'iconButton',
  'accordion',
  'tabs',
] as const;

export type ComponentType = (typeof COMPONENT_TYPES)[number];

export function isComponentType(value: string): value is ComponentType {
  return (COMPONENT_TYPES as readonly string[]).includes(value);
}

export type SectionBackground = 'primary' | 'secondary' | 'tertiary' | 'transparent';

export interface GridItem {
  id: string;
  component: ComponentType;
  span: number;
  props: Record<string, unknown>;
}

export interface SectionRow {
  id: string;
  items: GridItem[];
}

export interface PageSection {
  id: string;
  name: string;
  showInNav: boolean;
  background?: SectionBackground;
  rows: SectionRow[];
}

export interface PortfolioPage {
  schemaVersion: 1;
  slug: string;
  title: string;
  templateId: string;
  themeId?: string;
  themeOverride?: ThemeOverride;
  showNav: boolean;
  sections: PageSection[];
}
```

```ts
// packages/portfolio-builder/src/schema/validate.ts
import { isComponentType } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function validateGridItem(value: unknown, path: string): string[] {
  if (!isRecord(value)) return [`${path} must be an object`];
  const errors: string[] = [];
  if (typeof value.id !== 'string' || value.id.length === 0) {
    errors.push(`${path}.id is required and must be a non-empty string`);
  }
  if (typeof value.component !== 'string' || !isComponentType(value.component)) {
    errors.push(`${path}.component is an unknown component: ${String(value.component)}`);
  }
  if (typeof value.span !== 'number' || value.span < 1 || value.span > 12) {
    errors.push(`${path}.span must be a number between 1 and 12`);
  }
  if (!isRecord(value.props)) {
    errors.push(`${path}.props must be an object`);
  }
  return errors;
}

function validateSectionRow(value: unknown, path: string): string[] {
  if (!isRecord(value)) return [`${path} must be an object`];
  const errors: string[] = [];
  if (typeof value.id !== 'string' || value.id.length === 0) {
    errors.push(`${path}.id is required and must be a non-empty string`);
  }
  if (!Array.isArray(value.items)) {
    errors.push(`${path}.items must be an array`);
    return errors;
  }
  value.items.forEach((item, index) => {
    errors.push(...validateGridItem(item, `${path}.items[${index}]`));
  });
  const totalSpan = value.items.reduce((sum: number, item) => {
    return isRecord(item) && typeof item.span === 'number' ? sum + item.span : sum;
  }, 0);
  if (totalSpan > 12) {
    errors.push(`${path}: item spans sum to ${totalSpan}, which exceeds 12`);
  }
  return errors;
}

const VALID_BACKGROUNDS = ['primary', 'secondary', 'tertiary', 'transparent'];

function validatePageSection(value: unknown, path: string): string[] {
  if (!isRecord(value)) return [`${path} must be an object`];
  const errors: string[] = [];
  if (typeof value.id !== 'string' || value.id.length === 0) {
    errors.push(`${path}.id is required and must be a non-empty string`);
  }
  if (typeof value.name !== 'string' || value.name.length === 0) {
    errors.push(`${path}.name is required and must be a non-empty string`);
  }
  if (typeof value.showInNav !== 'boolean') {
    errors.push(`${path}.showInNav must be a boolean`);
  }
  if (value.background !== undefined && !VALID_BACKGROUNDS.includes(value.background as string)) {
    errors.push(`${path}.background must be one of ${VALID_BACKGROUNDS.join(', ')}`);
  }
  if (!Array.isArray(value.rows)) {
    errors.push(`${path}.rows must be an array`);
    return errors;
  }
  value.rows.forEach((row, index) => {
    errors.push(...validateSectionRow(row, `${path}.rows[${index}]`));
  });
  return errors;
}

export function validatePortfolioPage(value: unknown): ValidationResult {
  if (!isRecord(value)) {
    return { valid: false, errors: ['page must be an object'] };
  }
  const errors: string[] = [];
  if (value.schemaVersion !== 1) {
    errors.push('schemaVersion must be 1');
  }
  if (typeof value.slug !== 'string' || value.slug.length === 0) {
    errors.push('slug is required and must be a non-empty string');
  }
  if (typeof value.title !== 'string' || value.title.length === 0) {
    errors.push('title is required and must be a non-empty string');
  }
  if (typeof value.templateId !== 'string' || value.templateId.length === 0) {
    errors.push('templateId is required and must be a non-empty string');
  }
  if (typeof value.showNav !== 'boolean') {
    errors.push('showNav must be a boolean');
  }
  if (!Array.isArray(value.sections)) {
    errors.push('sections must be an array');
  } else {
    value.sections.forEach((section, index) => {
      errors.push(...validatePageSection(section, `sections[${index}]`));
    });
  }
  return { valid: errors.length === 0, errors };
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npm test -- packages/portfolio-builder/src/schema/validate.test.ts`
Expected: PASS — all 5 tests.

- [ ] **Step 5: Export from the package and commit**

```ts
// packages/portfolio-builder/src/index.ts
export const PORTFOLIO_BUILDER_SCHEMA_VERSION = 1;
export type {
  PortfolioPage,
  PageSection,
  SectionRow,
  GridItem,
  ComponentType,
  SectionBackground,
} from './schema/types';
export { COMPONENT_TYPES, isComponentType } from './schema/types';
export { validatePortfolioPage } from './schema/validate';
export type { ValidationResult } from './schema/validate';
```

```bash
git add packages/portfolio-builder
git commit -m "feat(portfolio-builder): add PortfolioPage schema and validation"
```

---

### Task 4: Responsive grid span calculation

**Files:**

- Create: `packages/portfolio-builder/src/grid/responsive.ts`
- Test: `packages/portfolio-builder/src/grid/responsive.test.ts`
- Modify: `packages/portfolio-builder/src/index.ts`

**Interfaces:**

- Consumes: nothing (pure function, no dependency on Task 3's types beyond a plain `number`).
- Produces: `collapsedSpans(span: number): { desktop: number; tablet: number; mobile: number }`.
  `ItemRenderer` (Task 15) is this function's only consumer.

- [ ] **Step 1: Write the failing tests**

```ts
// packages/portfolio-builder/src/grid/responsive.test.ts
import { describe, it, expect } from 'vitest';
import { collapsedSpans } from './responsive';

describe('collapsedSpans', () => {
  it('keeps the authored span for desktop', () => {
    expect(collapsedSpans(4).desktop).toBe(4);
    expect(collapsedSpans(12).desktop).toBe(12);
  });

  it('collapses spans of 6 or less to 6 on tablet', () => {
    expect(collapsedSpans(1).tablet).toBe(6);
    expect(collapsedSpans(6).tablet).toBe(6);
  });

  it('collapses spans of 7 or more to 12 on tablet', () => {
    expect(collapsedSpans(7).tablet).toBe(12);
    expect(collapsedSpans(12).tablet).toBe(12);
  });

  it('always collapses to 12 on mobile', () => {
    expect(collapsedSpans(1).mobile).toBe(12);
    expect(collapsedSpans(12).mobile).toBe(12);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- packages/portfolio-builder/src/grid/responsive.test.ts`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement**

```ts
// packages/portfolio-builder/src/grid/responsive.ts
export interface CollapsedSpans {
  desktop: number;
  tablet: number;
  mobile: number;
}

export function collapsedSpans(span: number): CollapsedSpans {
  return {
    desktop: span,
    tablet: span <= 6 ? 6 : 12,
    mobile: 12,
  };
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm test -- packages/portfolio-builder/src/grid/responsive.test.ts`
Expected: PASS — all 4 tests.

- [ ] **Step 5: Export and commit**

```ts
// add to packages/portfolio-builder/src/index.ts
export { collapsedSpans } from './grid/responsive';
export type { CollapsedSpans } from './grid/responsive';
```

```bash
git add packages/portfolio-builder
git commit -m "feat(portfolio-builder): add automatic responsive span collapsing"
```

---

### Task 5: Custom primitives — Heading, Text, Image, Spacer

**Files:**

- Create: `packages/portfolio-builder/src/components/primitives/Heading.tsx`
- Create: `packages/portfolio-builder/src/components/primitives/Heading.module.scss`
- Create: `packages/portfolio-builder/src/components/primitives/Text.tsx`
- Create: `packages/portfolio-builder/src/components/primitives/Text.module.scss`
- Create: `packages/portfolio-builder/src/components/primitives/Image.tsx`
- Create: `packages/portfolio-builder/src/components/primitives/Spacer.tsx`
- Test: `packages/portfolio-builder/src/components/primitives/primitives.test.tsx`

**Interfaces:**

- Consumes: nothing external.
- Produces: `HeadingItem`, `validateHeadingProps`; `TextItem`, `validateTextProps`; `ImageItem`,
  `validateImageProps`; `SpacerItem`, `validateSpacerProps` — each `(props: Record<string,
unknown>) => string[]` / `(props: Record<string, unknown>) => React.ReactElement`. Task 6 (Card
  wrapper) and Task 12 (Carousel wrapper) both reuse `ImageItem` directly. Task 14 (registry)
  wires all four in.

- [ ] **Step 1: Write the failing tests**

```tsx
// packages/portfolio-builder/src/components/primitives/primitives.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeadingItem, validateHeadingProps } from './Heading';
import { TextItem, validateTextProps } from './Text';
import { ImageItem, validateImageProps } from './Image';
import { SpacerItem, validateSpacerProps } from './Spacer';

describe('HeadingItem', () => {
  it('renders the given text at the given level', () => {
    render(<HeadingItem text="Hello" level={3} />);
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Hello');
  });

  it('flags a missing text prop', () => {
    expect(validateHeadingProps({})).toContain('text is required and must be a string');
  });
});

describe('TextItem', () => {
  it('renders the given text', () => {
    render(<TextItem text="A paragraph." />);
    expect(screen.getByText('A paragraph.')).toBeInTheDocument();
  });

  it('flags a missing text prop', () => {
    expect(validateTextProps({})).toContain('text is required and must be a string');
  });
});

describe('ImageItem', () => {
  it('renders an img with the given src and alt', () => {
    render(<ImageItem src="/photo.jpg" alt="A portrait" />);
    const img = screen.getByRole('img', { name: 'A portrait' });
    expect(img).toHaveAttribute('src', '/photo.jpg');
  });

  it('flags a missing src prop', () => {
    expect(validateImageProps({ alt: 'x' })).toContain('src is required and must be a string');
  });

  it('flags a missing alt prop', () => {
    expect(validateImageProps({ src: '/x.jpg' })).toContain('alt is required and must be a string');
  });
});

describe('SpacerItem', () => {
  it('renders a block with the given height', () => {
    render(<SpacerItem height={48} data-testid="spacer" />);
    expect(screen.getByTestId('spacer')).toHaveStyle({ height: '48px' });
  });

  it('flags a non-numeric height prop', () => {
    expect(validateSpacerProps({ height: 'tall' })).toContain(
      'height is required and must be a number'
    );
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- packages/portfolio-builder/src/components/primitives/primitives.test.tsx`
Expected: FAIL — none of the four modules exist yet.

- [ ] **Step 3: Implement the four primitives**

```tsx
// packages/portfolio-builder/src/components/primitives/Heading.tsx
import styles from './Heading.module.scss';

export interface HeadingItemProps {
  text: string;
  level?: 1 | 2 | 3 | 4;
  align?: 'left' | 'center' | 'right';
}

export function validateHeadingProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.text !== 'string' || props.text.length === 0) {
    errors.push('text is required and must be a string');
  }
  return errors;
}

const LEVEL_TAGS = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4' } as const;

export function HeadingItem(props: Record<string, unknown>) {
  const text = typeof props.text === 'string' ? props.text : '';
  const level =
    props.level === 1 || props.level === 2 || props.level === 3 || props.level === 4
      ? props.level
      : 2;
  const align =
    props.align === 'left' || props.align === 'center' || props.align === 'right'
      ? props.align
      : 'left';
  const Tag = LEVEL_TAGS[level];
  return (
    <Tag className={styles.heading} style={{ textAlign: align }}>
      {text}
    </Tag>
  );
}
```

```scss
// packages/portfolio-builder/src/components/primitives/Heading.module.scss
.heading {
  margin: 0;
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-semibold);
  color: var(--theme-text-primary);
}
```

```tsx
// packages/portfolio-builder/src/components/primitives/Text.tsx
import styles from './Text.module.scss';

export interface TextItemProps {
  text: string;
  size?: 'sm' | 'base' | 'lg';
  align?: 'left' | 'center' | 'right';
}

export function validateTextProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.text !== 'string' || props.text.length === 0) {
    errors.push('text is required and must be a string');
  }
  return errors;
}

export function TextItem(props: Record<string, unknown>) {
  const text = typeof props.text === 'string' ? props.text : '';
  const size =
    props.size === 'sm' || props.size === 'base' || props.size === 'lg' ? props.size : 'base';
  const align =
    props.align === 'left' || props.align === 'center' || props.align === 'right'
      ? props.align
      : 'left';
  return (
    <p className={styles.text} data-size={size} style={{ textAlign: align }}>
      {text}
    </p>
  );
}
```

```scss
// packages/portfolio-builder/src/components/primitives/Text.module.scss
.text {
  margin: 0;
  font-family: var(--font-family-primary);
  color: var(--theme-text-secondary);
}
.text[data-size='sm'] {
  font-size: var(--font-size-sm);
}
.text[data-size='base'] {
  font-size: var(--font-size-base);
}
.text[data-size='lg'] {
  font-size: var(--font-size-lg);
}
```

```tsx
// packages/portfolio-builder/src/components/primitives/Image.tsx
export interface ImageItemProps {
  src: string;
  alt: string;
  rounded?: boolean;
  objectFit?: 'cover' | 'contain';
}

export function validateImageProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.src !== 'string' || props.src.length === 0) {
    errors.push('src is required and must be a string');
  }
  if (typeof props.alt !== 'string' || props.alt.length === 0) {
    errors.push('alt is required and must be a string');
  }
  return errors;
}

export function ImageItem(props: Record<string, unknown>) {
  const src = typeof props.src === 'string' ? props.src : '';
  const alt = typeof props.alt === 'string' ? props.alt : '';
  const rounded = props.rounded === true;
  const objectFit = props.objectFit === 'contain' ? 'contain' : 'cover';
  return (
    // eslint-disable-next-line @next/next/no-img-element -- portfolio image src is arbitrary user-uploaded content, not a static import Next can optimize
    <img
      src={src}
      alt={alt}
      style={{
        width: '100%',
        height: '100%',
        objectFit,
        borderRadius: rounded ? 'var(--radius-lg)' : undefined,
      }}
    />
  );
}
```

```tsx
// packages/portfolio-builder/src/components/primitives/Spacer.tsx
export interface SpacerItemProps {
  height: number;
}

export function validateSpacerProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.height !== 'number') {
    errors.push('height is required and must be a number');
  }
  return errors;
}

export function SpacerItem(props: Record<string, unknown> & { 'data-testid'?: string }) {
  const height = typeof props.height === 'number' ? props.height : 0;
  return <div data-testid={props['data-testid']} style={{ height: `${height}px` }} />;
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm test -- packages/portfolio-builder/src/components/primitives/primitives.test.tsx`
Expected: PASS — all 8 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/portfolio-builder
git commit -m "feat(portfolio-builder): add Heading, Text, Image, Spacer primitives"
```

---

### Task 6: Link components — LinkButton and IconLinkButton

**Files:**

- Create: `packages/portfolio-builder/src/components/wrappers/links.tsx`
- Create: `packages/portfolio-builder/src/components/wrappers/links.module.scss`
- Test: `packages/portfolio-builder/src/components/wrappers/links.test.tsx`

**Interfaces:**

- Consumes: `NavLink` from `@true-tech-team/react-components` (the library's `Button` cannot
  render as a link — see spec — so external-linking items are built on `NavLink`, styled to look
  button-like).
- Produces: `LinkButtonItem`, `validateLinkButtonProps` (registry type `'button'`);
  `IconLinkButtonItem`, `validateIconLinkButtonProps` (registry type `'iconButton'`). Task 14
  (registry) wires both in.

- [ ] **Step 1: Write the failing tests**

```tsx
// packages/portfolio-builder/src/components/wrappers/links.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  LinkButtonItem,
  validateLinkButtonProps,
  IconLinkButtonItem,
  validateIconLinkButtonProps,
} from './links';

describe('LinkButtonItem', () => {
  it('renders a link with the given label and href', () => {
    render(<LinkButtonItem label="Visit GitHub" href="https://github.com/example" />);
    const link = screen.getByRole('link', { name: 'Visit GitHub' });
    expect(link).toHaveAttribute('href', 'https://github.com/example');
  });

  it('opens in a new tab when openInNewTab is set', () => {
    render(<LinkButtonItem label="Resume" href="/resume.pdf" openInNewTab />);
    expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute('target', '_blank');
  });

  it('flags a missing href', () => {
    expect(validateLinkButtonProps({ label: 'x' })).toContain(
      'href is required and must be a string'
    );
  });

  it('flags a missing label', () => {
    expect(validateLinkButtonProps({ href: '/x' })).toContain(
      'label is required and must be a string'
    );
  });
});

describe('IconLinkButtonItem', () => {
  it('renders an accessible icon-only link', () => {
    render(
      <IconLinkButtonItem
        href="https://linkedin.com/in/example"
        icon="external-link"
        ariaLabel="LinkedIn"
      />
    );
    const link = screen.getByRole('link', { name: 'LinkedIn' });
    expect(link).toHaveAttribute('href', 'https://linkedin.com/in/example');
  });

  it('flags a missing ariaLabel', () => {
    expect(validateIconLinkButtonProps({ href: '/x', icon: 'home' })).toContain(
      'ariaLabel is required and must be a string'
    );
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- packages/portfolio-builder/src/components/wrappers/links.test.tsx`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement**

```tsx
// packages/portfolio-builder/src/components/wrappers/links.tsx
import { NavLink } from '@true-tech-team/react-components';
import type { IconName } from '@true-tech-team/react-components';
import styles from './links.module.scss';

export interface LinkButtonItemProps {
  label: string;
  href: string;
  icon?: IconName;
  openInNewTab?: boolean;
}

export function validateLinkButtonProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.label !== 'string' || props.label.length === 0) {
    errors.push('label is required and must be a string');
  }
  if (typeof props.href !== 'string' || props.href.length === 0) {
    errors.push('href is required and must be a string');
  }
  return errors;
}

export function LinkButtonItem(props: Record<string, unknown>) {
  const label = typeof props.label === 'string' ? props.label : '';
  const href = typeof props.href === 'string' ? props.href : '#';
  const icon = typeof props.icon === 'string' ? (props.icon as IconName) : undefined;
  const target = props.openInNewTab === true ? '_blank' : undefined;
  return (
    <NavLink href={href} icon={icon} target={target} variant="pill">
      {label}
    </NavLink>
  );
}

export interface IconLinkButtonItemProps {
  href: string;
  icon: IconName;
  ariaLabel: string;
  openInNewTab?: boolean;
}

export function validateIconLinkButtonProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.href !== 'string' || props.href.length === 0) {
    errors.push('href is required and must be a string');
  }
  if (typeof props.icon !== 'string' || props.icon.length === 0) {
    errors.push('icon is required and must be a string');
  }
  if (typeof props.ariaLabel !== 'string' || props.ariaLabel.length === 0) {
    errors.push('ariaLabel is required and must be a string');
  }
  return errors;
}

export function IconLinkButtonItem(props: Record<string, unknown>) {
  const href = typeof props.href === 'string' ? props.href : '#';
  const icon = typeof props.icon === 'string' ? (props.icon as IconName) : 'external-link';
  const ariaLabel = typeof props.ariaLabel === 'string' ? props.ariaLabel : '';
  const target = props.openInNewTab === true ? '_blank' : undefined;
  return (
    <NavLink href={href} icon={icon} target={target} variant="ghost" aria-label={ariaLabel}>
      <span className={styles.srOnly}>{ariaLabel}</span>
    </NavLink>
  );
}
```

```scss
// packages/portfolio-builder/src/components/wrappers/links.module.scss
.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm test -- packages/portfolio-builder/src/components/wrappers/links.test.tsx`
Expected: PASS — all 6 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/portfolio-builder
git commit -m "feat(portfolio-builder): add link-button components for external links"
```

---

### Task 7: Display wrappers — Badge, Chip, Pill, StatusIndicator, Icon

**Files:**

- Create: `packages/portfolio-builder/src/components/wrappers/display.tsx`
- Test: `packages/portfolio-builder/src/components/wrappers/display.test.tsx`

**Interfaces:**

- Consumes: `Badge`, `Chip`, `Pill`, `StatusIndicator`, `Icon` from `@true-tech-team/react-components`.
- Produces: `BadgeItem`/`validateBadgeProps`, `ChipItem`/`validateChipProps`,
  `PillItem`/`validatePillProps`, `StatusIndicatorItem`/`validateStatusIndicatorProps`,
  `IconItem`/`validateIconProps`. `PillItem` is reused directly by Task 13's `TruncatedList`
  wrapper. Task 14 (registry) wires all five in.

- [ ] **Step 1: Write the failing tests**

```tsx
// packages/portfolio-builder/src/components/wrappers/display.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  BadgeItem,
  validateBadgeProps,
  ChipItem,
  validateChipProps,
  PillItem,
  validatePillProps,
  StatusIndicatorItem,
  validateStatusIndicatorProps,
  IconItem,
  validateIconProps,
} from './display';

describe('BadgeItem', () => {
  it('renders the given label', () => {
    render(<BadgeItem label="New" />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });
  it('flags a missing label', () => {
    expect(validateBadgeProps({})).toContain('label is required and must be a string or number');
  });
});

describe('ChipItem', () => {
  it('renders the given label', () => {
    render(<ChipItem label="React" />);
    expect(screen.getByText('React')).toBeInTheDocument();
  });
  it('flags a missing label', () => {
    expect(validateChipProps({})).toContain('label is required and must be a string');
  });
});

describe('PillItem', () => {
  it('renders the given label', () => {
    render(<PillItem label="Available for hire" />);
    expect(screen.getByText('Available for hire')).toBeInTheDocument();
  });
  it('flags a missing label', () => {
    expect(validatePillProps({})).toContain('label is required and must be a string');
  });
});

describe('StatusIndicatorItem', () => {
  it('renders the given label with the status dot', () => {
    render(<StatusIndicatorItem status="online" label="Available" />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });
  it('flags an invalid status', () => {
    expect(validateStatusIndicatorProps({ status: 'not-a-status' })).toContain(
      'status must be a known StatusIndicator status'
    );
  });
});

describe('IconItem', () => {
  it('renders an icon with an accessible label', () => {
    render(<IconItem name="home" ariaLabel="Home" />);
    expect(screen.getByLabelText('Home')).toBeInTheDocument();
  });
  it('flags a missing name', () => {
    expect(validateIconProps({})).toContain('name is required and must be a string');
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- packages/portfolio-builder/src/components/wrappers/display.test.tsx`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement**

```tsx
// packages/portfolio-builder/src/components/wrappers/display.tsx
import { Badge, Chip, Pill, StatusIndicator, Icon } from '@true-tech-team/react-components';
import type {
  BadgeProps,
  PillProps,
  StatusIndicatorProps,
  IconName,
} from '@true-tech-team/react-components';

export interface BadgeItemProps {
  label: string | number;
  variant?: BadgeProps['variant'];
  size?: BadgeProps['size'];
}

export function validateBadgeProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.label !== 'string' && typeof props.label !== 'number') {
    errors.push('label is required and must be a string or number');
  }
  return errors;
}

export function BadgeItem(props: Record<string, unknown>) {
  const label =
    typeof props.label === 'string' || typeof props.label === 'number' ? props.label : '';
  const variant =
    typeof props.variant === 'string' ? (props.variant as BadgeProps['variant']) : undefined;
  const size = typeof props.size === 'string' ? (props.size as BadgeProps['size']) : undefined;
  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  );
}

export interface ChipItemProps {
  label: string;
}

export function validateChipProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.label !== 'string' || props.label.length === 0) {
    errors.push('label is required and must be a string');
  }
  return errors;
}

export function ChipItem(props: Record<string, unknown>) {
  const label = typeof props.label === 'string' ? props.label : '';
  return <Chip>{label}</Chip>;
}

export interface PillItemProps {
  label: string;
  variant?: PillProps['variant'];
  color?: PillProps['color'];
}

export function validatePillProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.label !== 'string' || props.label.length === 0) {
    errors.push('label is required and must be a string');
  }
  return errors;
}

export function PillItem(props: Record<string, unknown>) {
  const label = typeof props.label === 'string' ? props.label : '';
  const variant =
    typeof props.variant === 'string' ? (props.variant as PillProps['variant']) : undefined;
  const color = typeof props.color === 'string' ? (props.color as PillProps['color']) : undefined;
  return (
    <Pill variant={variant} color={color}>
      {label}
    </Pill>
  );
}

const VALID_STATUSES = [
  'online',
  'offline',
  'away',
  'busy',
  'success',
  'warning',
  'error',
  'info',
  'neutral',
  'processing',
];

export interface StatusIndicatorItemProps {
  status?: StatusIndicatorProps['status'];
  label?: string;
}

export function validateStatusIndicatorProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (props.status !== undefined && !VALID_STATUSES.includes(props.status as string)) {
    errors.push('status must be a known StatusIndicator status');
  }
  return errors;
}

export function StatusIndicatorItem(props: Record<string, unknown>) {
  const status = VALID_STATUSES.includes(props.status as string)
    ? (props.status as StatusIndicatorProps['status'])
    : undefined;
  const label = typeof props.label === 'string' ? props.label : undefined;
  return (
    <StatusIndicator status={status} withText={label !== undefined}>
      {label}
    </StatusIndicator>
  );
}

export interface IconItemProps {
  name: IconName;
  ariaLabel: string;
  color?: string;
}

export function validateIconProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.name !== 'string' || props.name.length === 0) {
    errors.push('name is required and must be a string');
  }
  return errors;
}

export function IconItem(props: Record<string, unknown>) {
  const name = typeof props.name === 'string' ? (props.name as IconName) : 'info';
  const ariaLabel = typeof props.ariaLabel === 'string' ? props.ariaLabel : undefined;
  const color = typeof props.color === 'string' ? props.color : undefined;
  return <Icon name={name} aria-label={ariaLabel} color={color} />;
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm test -- packages/portfolio-builder/src/components/wrappers/display.test.tsx`
Expected: PASS — all 10 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/portfolio-builder
git commit -m "feat(portfolio-builder): add Badge, Chip, Pill, StatusIndicator, Icon wrappers"
```

---

### Task 8: Avatar wrapper

**Files:**

- Create: `packages/portfolio-builder/src/components/wrappers/avatar.tsx`
- Test: `packages/portfolio-builder/src/components/wrappers/avatar.test.tsx`

**Interfaces:**

- Consumes: `Avatar` from `@true-tech-team/react-components`.
- Produces: `AvatarItem`, `validateAvatarProps`. Task 14 (registry) wires it in as `'avatar'`.

- [ ] **Step 1: Write the failing tests**

```tsx
// packages/portfolio-builder/src/components/wrappers/avatar.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AvatarItem, validateAvatarProps } from './avatar';

describe('AvatarItem', () => {
  it('renders an image avatar when src is given', () => {
    render(<AvatarItem src="/me.jpg" alt="Justin True" />);
    expect(screen.getByRole('img', { name: 'Justin True' })).toHaveAttribute('src', '/me.jpg');
  });

  it('renders initials when no src is given', () => {
    render(<AvatarItem initials="JT" />);
    expect(screen.getByText('JT')).toBeInTheDocument();
  });

  it('flags a page with neither src nor initials', () => {
    expect(validateAvatarProps({})).toContain('either src or initials is required');
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- packages/portfolio-builder/src/components/wrappers/avatar.test.tsx`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement**

```tsx
// packages/portfolio-builder/src/components/wrappers/avatar.tsx
import { Avatar } from '@true-tech-team/react-components';
import type { AvatarProps } from '@true-tech-team/react-components';

export interface AvatarItemProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: AvatarProps['size'];
  variant?: AvatarProps['variant'];
}

export function validateAvatarProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  const hasSrc = typeof props.src === 'string' && props.src.length > 0;
  const hasInitials = typeof props.initials === 'string' && props.initials.length > 0;
  if (!hasSrc && !hasInitials) {
    errors.push('either src or initials is required');
  }
  return errors;
}

export function AvatarItem(props: Record<string, unknown>) {
  const src = typeof props.src === 'string' ? props.src : undefined;
  const alt = typeof props.alt === 'string' ? props.alt : undefined;
  const initials = typeof props.initials === 'string' ? props.initials : undefined;
  const size = typeof props.size === 'string' ? (props.size as AvatarProps['size']) : undefined;
  const variant =
    typeof props.variant === 'string' ? (props.variant as AvatarProps['variant']) : undefined;
  return <Avatar src={src} alt={alt} initials={initials} size={size} variant={variant} />;
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm test -- packages/portfolio-builder/src/components/wrappers/avatar.test.tsx`
Expected: PASS — all 3 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/portfolio-builder
git commit -m "feat(portfolio-builder): add Avatar wrapper"
```

---

### Task 9: Metric wrappers — ProgressBar, CircularProgress, KPI, CountUp

**Files:**

- Create: `packages/portfolio-builder/src/components/wrappers/metrics.tsx`
- Test: `packages/portfolio-builder/src/components/wrappers/metrics.test.tsx`

**Interfaces:**

- Consumes: `ProgressBar`, `CircularProgress`, `KPI`, `CountUp` from `@true-tech-team/react-components`.
- Produces: `ProgressBarItem`/`validateProgressBarProps`,
  `CircularProgressItem`/`validateCircularProgressProps`, `KpiItem`/`validateKpiProps`,
  `CountUpItem`/`validateCountUpProps`. Task 14 (registry) wires all four in.

- [ ] **Step 1: Write the failing tests**

```tsx
// packages/portfolio-builder/src/components/wrappers/metrics.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ProgressBarItem,
  validateProgressBarProps,
  CircularProgressItem,
  validateCircularProgressProps,
  KpiItem,
  validateKpiProps,
  CountUpItem,
  validateCountUpProps,
} from './metrics';

describe('ProgressBarItem', () => {
  it('renders with the given value and label', () => {
    render(<ProgressBarItem value={75} label="React proficiency" showValue />);
    expect(screen.getByText('React proficiency')).toBeInTheDocument();
  });
  it('flags a non-numeric value', () => {
    expect(validateProgressBarProps({ value: 'high' })).toContain(
      'value is required and must be a number'
    );
  });
});

describe('CircularProgressItem', () => {
  it('renders with the given value', () => {
    const { container } = render(<CircularProgressItem value={50} />);
    expect(container.firstChild).toBeInTheDocument();
  });
  it('flags a non-numeric value', () => {
    expect(validateCircularProgressProps({})).toContain('value is required and must be a number');
  });
});

describe('KpiItem', () => {
  it('renders the given title and value', () => {
    render(<KpiItem title="Years of experience" value={5} />);
    expect(screen.getByText('Years of experience')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
  it('flags a missing title', () => {
    expect(validateKpiProps({ value: 5 })).toContain('title is required and must be a string');
  });
  it('flags a missing value', () => {
    expect(validateKpiProps({ title: 'x' })).toContain(
      'value is required and must be a string or number'
    );
  });
});

describe('CountUpItem', () => {
  it('renders without crashing', () => {
    const { container } = render(<CountUpItem value={100} suffix="+" />);
    expect(container.firstChild).toBeInTheDocument();
  });
  it('flags a non-numeric value', () => {
    expect(validateCountUpProps({})).toContain('value is required and must be a number');
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- packages/portfolio-builder/src/components/wrappers/metrics.test.tsx`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement**

```tsx
// packages/portfolio-builder/src/components/wrappers/metrics.tsx
import { ProgressBar, CircularProgress, KPI, CountUp } from '@true-tech-team/react-components';
import type { KPIProps } from '@true-tech-team/react-components';

export interface ProgressBarItemProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
}

export function validateProgressBarProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.value !== 'number') {
    errors.push('value is required and must be a number');
  }
  return errors;
}

export function ProgressBarItem(props: Record<string, unknown>) {
  const value = typeof props.value === 'number' ? props.value : 0;
  const max = typeof props.max === 'number' ? props.max : undefined;
  const label = typeof props.label === 'string' ? props.label : undefined;
  const showValue = props.showValue === true;
  return <ProgressBar value={value} max={max} label={label} showValue={showValue} />;
}

export interface CircularProgressItemProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
}

export function validateCircularProgressProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.value !== 'number') {
    errors.push('value is required and must be a number');
  }
  return errors;
}

export function CircularProgressItem(props: Record<string, unknown>) {
  const value = typeof props.value === 'number' ? props.value : 0;
  const max = typeof props.max === 'number' ? props.max : undefined;
  const label = typeof props.label === 'string' ? props.label : undefined;
  const showValue = props.showValue === true;
  return <CircularProgress value={value} max={max} label={label} showValue={showValue} />;
}

export interface KpiItemProps {
  title: string;
  value: string | number;
  subtitle?: string;
  changeText?: string;
  changeType?: KPIProps['changeType'];
}

export function validateKpiProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.title !== 'string' || props.title.length === 0) {
    errors.push('title is required and must be a string');
  }
  if (typeof props.value !== 'string' && typeof props.value !== 'number') {
    errors.push('value is required and must be a string or number');
  }
  return errors;
}

export function KpiItem(props: Record<string, unknown>) {
  const title = typeof props.title === 'string' ? props.title : '';
  const value =
    typeof props.value === 'string' || typeof props.value === 'number' ? props.value : '';
  const subtitle = typeof props.subtitle === 'string' ? props.subtitle : undefined;
  const change = typeof props.changeText === 'string' ? props.changeText : undefined;
  const changeType =
    typeof props.changeType === 'string' ? (props.changeType as KPIProps['changeType']) : undefined;
  return (
    <KPI title={title} value={value} subtitle={subtitle} change={change} changeType={changeType} />
  );
}

export interface CountUpItemProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function validateCountUpProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.value !== 'number') {
    errors.push('value is required and must be a number');
  }
  return errors;
}

export function CountUpItem(props: Record<string, unknown>) {
  const value = typeof props.value === 'number' ? props.value : 0;
  const prefix = typeof props.prefix === 'string' ? props.prefix : undefined;
  const suffix = typeof props.suffix === 'string' ? props.suffix : undefined;
  const decimals = typeof props.decimals === 'number' ? props.decimals : undefined;
  return <CountUp value={value} prefix={prefix} suffix={suffix} decimals={decimals} />;
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm test -- packages/portfolio-builder/src/components/wrappers/metrics.test.tsx`
Expected: PASS — all 8 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/portfolio-builder
git commit -m "feat(portfolio-builder): add ProgressBar, CircularProgress, KPI, CountUp wrappers"
```

---

### Task 10: Card wrapper

**Files:**

- Create: `packages/portfolio-builder/src/components/wrappers/card.tsx`
- Test: `packages/portfolio-builder/src/components/wrappers/card.test.tsx`

**Interfaces:**

- Consumes: `Card` from `@true-tech-team/react-components`; `HeadingItem` (Task 5), `TextItem`
  (Task 5), `ImageItem` (Task 5).
- Produces: `CardItem`, `validateCardProps`. Task 14 (registry) wires it in as `'card'`.

- [ ] **Step 1: Write the failing tests**

```tsx
// packages/portfolio-builder/src/components/wrappers/card.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardItem, validateCardProps } from './card';

describe('CardItem', () => {
  it('renders header, body, and footer text', () => {
    render(<CardItem header="Project Alpha" body="A cool project." footer="View source" />);
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('A cool project.')).toBeInTheDocument();
    expect(screen.getByText('View source')).toBeInTheDocument();
  });

  it('renders an image thumbnail when imageSrc is given', () => {
    render(<CardItem body="A cool project." imageSrc="/thumb.jpg" imageAlt="Screenshot" />);
    expect(screen.getByRole('img', { name: 'Screenshot' })).toHaveAttribute('src', '/thumb.jpg');
  });

  it('flags a missing body', () => {
    expect(validateCardProps({})).toContain('body is required and must be a string');
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- packages/portfolio-builder/src/components/wrappers/card.test.tsx`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement**

```tsx
// packages/portfolio-builder/src/components/wrappers/card.tsx
import { Card } from '@true-tech-team/react-components';
import type { CardProps } from '@true-tech-team/react-components';
import { HeadingItem } from '../primitives/Heading';
import { TextItem } from '../primitives/Text';
import { ImageItem } from '../primitives/Image';

export interface CardItemProps {
  header?: string;
  body: string;
  footer?: string;
  imageSrc?: string;
  imageAlt?: string;
  variant?: CardProps['variant'];
}

export function validateCardProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.body !== 'string' || props.body.length === 0) {
    errors.push('body is required and must be a string');
  }
  return errors;
}

export function CardItem(props: Record<string, unknown>) {
  const header = typeof props.header === 'string' ? props.header : undefined;
  const body = typeof props.body === 'string' ? props.body : '';
  const footer = typeof props.footer === 'string' ? props.footer : undefined;
  const imageSrc = typeof props.imageSrc === 'string' ? props.imageSrc : undefined;
  const imageAlt = typeof props.imageAlt === 'string' ? props.imageAlt : '';
  const variant =
    typeof props.variant === 'string' ? (props.variant as CardProps['variant']) : undefined;

  return (
    <Card
      variant={variant}
      header={header ? <HeadingItem text={header} level={4} /> : undefined}
      footer={footer ? <TextItem text={footer} size="sm" /> : undefined}
    >
      {imageSrc ? <ImageItem src={imageSrc} alt={imageAlt} /> : null}
      <TextItem text={body} />
    </Card>
  );
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm test -- packages/portfolio-builder/src/components/wrappers/card.test.tsx`
Expected: PASS — all 3 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/portfolio-builder
git commit -m "feat(portfolio-builder): add Card wrapper"
```

---

### Task 11: Expand/reveal wrappers — ExpandableText, Accordion, Reveal, FlipCard

**Files:**

- Create: `packages/portfolio-builder/src/components/wrappers/expand.tsx`
- Test: `packages/portfolio-builder/src/components/wrappers/expand.test.tsx`

**Interfaces:**

- Consumes: `Collapse`, `NavLink`, `Accordion`, `Reveal`, `FlipCard` from
  `@true-tech-team/react-components`.
- Produces: `ExpandableTextItem`/`validateExpandableTextProps` (registry type `'collapse'`),
  `AccordionItem`/`validateAccordionProps` (registry type `'accordion'`),
  `RevealItem`/`validateRevealProps` (registry type `'reveal'`),
  `FlipCardItem`/`validateFlipCardProps` (registry type `'flipCard'`). `ExpandableTextItem` is the
  one component in this task with its own client-side state, so it alone carries `'use client'`.
  Task 14 (registry) wires all four in.

- [ ] **Step 1: Write the failing tests**

```tsx
// packages/portfolio-builder/src/components/wrappers/expand.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ExpandableTextItem,
  validateExpandableTextProps,
  AccordionItem,
  validateAccordionProps,
  RevealItem,
  validateRevealProps,
  FlipCardItem,
  validateFlipCardProps,
} from './expand';

describe('ExpandableTextItem', () => {
  it('shows the body after the title is clicked', async () => {
    render(<ExpandableTextItem title="Read more" body="The full story." />);
    expect(screen.queryByText('The full story.')).not.toBeVisible();
    await userEvent.click(screen.getByText('Read more'));
    expect(screen.getByText('The full story.')).toBeVisible();
  });
  it('flags a missing title', () => {
    expect(validateExpandableTextProps({ body: 'x' })).toContain(
      'title is required and must be a non-empty string'
    );
  });
});

describe('AccordionItem', () => {
  it('renders the given header', () => {
    render(<AccordionItem header="FAQ" body="An answer." />);
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });
  it('flags a missing body', () => {
    expect(validateAccordionProps({ header: 'x' })).toContain(
      'body is required and must be a string'
    );
  });
});

describe('RevealItem', () => {
  it('renders the given text', () => {
    render(<RevealItem text="Welcome" />);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });
  it('flags a missing text', () => {
    expect(validateRevealProps({})).toContain('text is required and must be a string');
  });
});

describe('FlipCardItem', () => {
  it('renders the front text', () => {
    render(<FlipCardItem frontText="Front" backText="Back" />);
    expect(screen.getByText('Front')).toBeInTheDocument();
  });
  it('flags a missing backText', () => {
    expect(validateFlipCardProps({ frontText: 'x' })).toContain(
      'backText is required and must be a string'
    );
  });
});
```

Add `@testing-library/user-event` (used by the click test above) to root `package.json`
`devDependencies`:

```json
"@testing-library/user-event": "^14.5.2"
```

- [ ] **Step 2: Run and confirm failure**

Run `npm install` (for the new devDependency), then:
Run: `npm test -- packages/portfolio-builder/src/components/wrappers/expand.test.tsx`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement**

```tsx
// packages/portfolio-builder/src/components/wrappers/expand.tsx
'use client';

import { useState } from 'react';
import { Collapse, NavLink, Accordion, Reveal, FlipCard } from '@true-tech-team/react-components';
import type { RevealProps } from '@true-tech-team/react-components';

export interface ExpandableTextItemProps {
  title: string;
  body: string;
  defaultOpen?: boolean;
}

export function validateExpandableTextProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.title !== 'string' || props.title.length === 0) {
    errors.push('title is required and must be a non-empty string');
  }
  if (typeof props.body !== 'string' || props.body.length === 0) {
    errors.push('body is required and must be a non-empty string');
  }
  return errors;
}

export function ExpandableTextItem(props: Record<string, unknown>) {
  const title = typeof props.title === 'string' ? props.title : '';
  const body = typeof props.body === 'string' ? props.body : '';
  const [isOpen, setIsOpen] = useState(props.defaultOpen === true);
  return (
    <div>
      <NavLink
        href="#"
        onClick={(event) => {
          event.preventDefault();
          setIsOpen((previous) => !previous);
        }}
        aria-expanded={isOpen}
      >
        {title}
      </NavLink>
      <Collapse isOpen={isOpen}>
        <p>{body}</p>
      </Collapse>
    </div>
  );
}

export interface AccordionItemProps {
  header: string;
  body: string;
  defaultOpen?: boolean;
}

export function validateAccordionProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.header !== 'string' || props.header.length === 0) {
    errors.push('header is required and must be a string');
  }
  if (typeof props.body !== 'string' || props.body.length === 0) {
    errors.push('body is required and must be a string');
  }
  return errors;
}

export function AccordionItem(props: Record<string, unknown>) {
  const header = typeof props.header === 'string' ? props.header : '';
  const body = typeof props.body === 'string' ? props.body : '';
  const defaultOpen = props.defaultOpen === true;
  return (
    <Accordion header={header} defaultOpen={defaultOpen}>
      {body}
    </Accordion>
  );
}

export interface RevealItemProps {
  text: string;
  animation?: RevealProps['animation'];
  playOnMount?: boolean;
}

export function validateRevealProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.text !== 'string' || props.text.length === 0) {
    errors.push('text is required and must be a string');
  }
  return errors;
}

export function RevealItem(props: Record<string, unknown>) {
  const text = typeof props.text === 'string' ? props.text : '';
  const animation =
    typeof props.animation === 'string' ? (props.animation as RevealProps['animation']) : undefined;
  const playOnMount = props.playOnMount === true;
  return (
    <Reveal animation={animation} playOnMount={playOnMount}>
      <p>{text}</p>
    </Reveal>
  );
}

export interface FlipCardItemProps {
  frontText: string;
  backText: string;
  height?: number;
  width?: number;
}

export function validateFlipCardProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.frontText !== 'string' || props.frontText.length === 0) {
    errors.push('frontText is required and must be a string');
  }
  if (typeof props.backText !== 'string' || props.backText.length === 0) {
    errors.push('backText is required and must be a string');
  }
  return errors;
}

export function FlipCardItem(props: Record<string, unknown>) {
  const frontText = typeof props.frontText === 'string' ? props.frontText : '';
  const backText = typeof props.backText === 'string' ? props.backText : '';
  const height = typeof props.height === 'number' ? props.height : 240;
  const width = typeof props.width === 'number' ? props.width : undefined;
  return (
    <FlipCard
      height={height}
      width={width}
      front={<div>{frontText}</div>}
      back={<div>{backText}</div>}
    />
  );
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm test -- packages/portfolio-builder/src/components/wrappers/expand.test.tsx`
Expected: PASS — all 8 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/portfolio-builder package.json package-lock.json
git commit -m "feat(portfolio-builder): add ExpandableText, Accordion, Reveal, FlipCard wrappers"
```

---

### Task 12: List wrappers — Carousel, Tabs, OverflowText, TruncatedList

**Files:**

- Create: `packages/portfolio-builder/src/components/wrappers/lists.tsx`
- Test: `packages/portfolio-builder/src/components/wrappers/lists.test.tsx`

**Interfaces:**

- Consumes: `Carousel`, `Tabs`, `TabList`, `Tab`, `TabPanel`, `OverflowText`, `TruncatedList` from
  `@true-tech-team/react-components`; `ImageItem` (Task 5); `PillItem` (Task 7).
- Produces: `CarouselItem`/`validateCarouselProps`, `TabsItem`/`validateTabsProps`,
  `OverflowTextItem`/`validateOverflowTextProps`,
  `TruncatedListItem`/`validateTruncatedListProps`. Task 14 (registry) wires all four in.
- Constraint: `Tabs` composes `TabList`/`Tab`/`TabPanel` and requires a unique `value` per tab —
  this wrapper uses each tab's `label` as that value, so labels must be unique within one `tabs`
  item (documented in the JSDoc on `TabsItemProps`, enforced by `validateTabsProps`).

- [ ] **Step 1: Write the failing tests**

```tsx
// packages/portfolio-builder/src/components/wrappers/lists.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  CarouselItem,
  validateCarouselProps,
  TabsItem,
  validateTabsProps,
  OverflowTextItem,
  validateOverflowTextProps,
  TruncatedListItem,
  validateTruncatedListProps,
} from './lists';

describe('CarouselItem', () => {
  it('renders a slide image for each slide', () => {
    render(
      <CarouselItem
        slides={[
          { imageSrc: '/1.jpg', alt: 'One' },
          { imageSrc: '/2.jpg', alt: 'Two' },
        ]}
      />
    );
    expect(screen.getByRole('img', { name: 'One' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Two' })).toBeInTheDocument();
  });
  it('flags an empty slides array', () => {
    expect(validateCarouselProps({ slides: [] })).toContain(
      'slides must contain at least one slide'
    );
  });
  it('flags a missing slides array', () => {
    expect(validateCarouselProps({})).toContain('slides must contain at least one slide');
  });
});

describe('TabsItem', () => {
  it('renders every tab label', () => {
    render(
      <TabsItem
        tabs={[
          { label: 'Overview', content: 'A.' },
          { label: 'Details', content: 'B.' },
        ]}
      />
    );
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });
  it('flags duplicate tab labels', () => {
    const errors = validateTabsProps({
      tabs: [
        { label: 'A', content: '1' },
        { label: 'A', content: '2' },
      ],
    });
    expect(errors).toContain('tab labels must be unique within one tabs item');
  });
  it('flags an empty tabs array', () => {
    expect(validateTabsProps({ tabs: [] })).toContain('tabs must contain at least one tab');
  });
});

describe('OverflowTextItem', () => {
  it('renders the given text', () => {
    render(<OverflowTextItem text="A long line of text." />);
    expect(screen.getByText('A long line of text.')).toBeInTheDocument();
  });
  it('flags a missing text', () => {
    expect(validateOverflowTextProps({})).toContain('text is required and must be a string');
  });
});

describe('TruncatedListItem', () => {
  it('renders each item as a pill', () => {
    render(<TruncatedListItem items={['React', 'TypeScript', 'Next.js']} maxVisible={2} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });
  it('flags a missing items array', () => {
    expect(validateTruncatedListProps({})).toContain('items must be a non-empty array of strings');
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- packages/portfolio-builder/src/components/wrappers/lists.test.tsx`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement**

```tsx
// packages/portfolio-builder/src/components/wrappers/lists.tsx
import {
  Carousel,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  OverflowText,
  TruncatedList,
} from '@true-tech-team/react-components';
import { ImageItem } from '../primitives/Image';
import { PillItem } from './display';

export interface CarouselSlide {
  imageSrc: string;
  alt?: string;
  caption?: string;
}

function isCarouselSlide(value: unknown): value is CarouselSlide {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as CarouselSlide).imageSrc === 'string'
  );
}

export interface CarouselItemProps {
  slides: CarouselSlide[];
  autoPlay?: boolean;
}

export function validateCarouselProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (
    !Array.isArray(props.slides) ||
    props.slides.length === 0 ||
    !props.slides.every(isCarouselSlide)
  ) {
    errors.push('slides must contain at least one slide');
  }
  return errors;
}

export function CarouselItem(props: Record<string, unknown>) {
  const slides = Array.isArray(props.slides) ? props.slides.filter(isCarouselSlide) : [];
  const autoPlay = props.autoPlay === true;
  return (
    <Carousel autoPlay={autoPlay}>
      {slides.map((slide) => (
        <div key={slide.imageSrc}>
          <ImageItem src={slide.imageSrc} alt={slide.alt ?? ''} />
          {slide.caption ? <p>{slide.caption}</p> : null}
        </div>
      ))}
    </Carousel>
  );
}

export interface TabItem {
  label: string;
  content: string;
}

function isTabItem(value: unknown): value is TabItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as TabItem).label === 'string' &&
    typeof (value as TabItem).content === 'string'
  );
}

/**
 * `Tabs` composes TabList/Tab/TabPanel and needs a unique `value` per tab; this wrapper uses
 * each tab's `label` as that value, so labels must be unique within one `tabs` item.
 */
export interface TabsItemProps {
  tabs: TabItem[];
}

export function validateTabsProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (!Array.isArray(props.tabs) || props.tabs.length === 0 || !props.tabs.every(isTabItem)) {
    errors.push('tabs must contain at least one tab');
    return errors;
  }
  const labels = props.tabs.map((tab) => tab.label);
  if (new Set(labels).size !== labels.length) {
    errors.push('tab labels must be unique within one tabs item');
  }
  return errors;
}

export function TabsItem(props: Record<string, unknown>) {
  const tabs = Array.isArray(props.tabs) ? props.tabs.filter(isTabItem) : [];
  if (tabs.length === 0) return null;
  return (
    <Tabs defaultValue={tabs[0].label}>
      <TabList>
        {tabs.map((tab) => (
          <Tab key={tab.label} value={tab.label}>
            {tab.label}
          </Tab>
        ))}
      </TabList>
      {tabs.map((tab) => (
        <TabPanel key={tab.label} value={tab.label}>
          {tab.content}
        </TabPanel>
      ))}
    </Tabs>
  );
}

export interface OverflowTextItemProps {
  text: string;
  lines?: number;
}

export function validateOverflowTextProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.text !== 'string' || props.text.length === 0) {
    errors.push('text is required and must be a string');
  }
  return errors;
}

export function OverflowTextItem(props: Record<string, unknown>) {
  const text = typeof props.text === 'string' ? props.text : '';
  const lines = typeof props.lines === 'number' ? props.lines : undefined;
  return <OverflowText lines={lines}>{text}</OverflowText>;
}

export interface TruncatedListItemProps {
  items: string[];
  maxVisible?: number;
}

export function validateTruncatedListProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (
    !Array.isArray(props.items) ||
    props.items.length === 0 ||
    !props.items.every((item) => typeof item === 'string')
  ) {
    errors.push('items must be a non-empty array of strings');
  }
  return errors;
}

export function TruncatedListItem(props: Record<string, unknown>) {
  const items = Array.isArray(props.items)
    ? props.items.filter((item): item is string => typeof item === 'string')
    : [];
  const maxVisible = typeof props.maxVisible === 'number' ? props.maxVisible : undefined;
  return (
    <TruncatedList
      items={items}
      maxVisible={maxVisible}
      renderItem={(item) => <PillItem label={item} />}
      keyExtractor={(item) => item}
    />
  );
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm test -- packages/portfolio-builder/src/components/wrappers/lists.test.tsx`
Expected: PASS — all 9 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/portfolio-builder
git commit -m "feat(portfolio-builder): add Carousel, Tabs, OverflowText, TruncatedList wrappers"
```

---

### Task 13: Component registry

**Files:**

- Create: `packages/portfolio-builder/src/components/registry.ts`
- Test: `packages/portfolio-builder/src/components/registry.test.ts`
- Modify: `packages/portfolio-builder/src/index.ts`

**Interfaces:**

- Consumes: `ComponentType`, `COMPONENT_TYPES` (Task 3); every wrapper/primitive component and
  validator from Tasks 5–12.
- Produces: `RegistryEntry` (`{ component: (props: Record<string, unknown>) => React.ReactElement
| null; validate: (props: Record<string, unknown>) => string[] }`), `getRegistryEntry(type:
ComponentType): RegistryEntry | undefined`. Task 15 (`ItemRenderer`) is this module's only
  consumer.

- [ ] **Step 1: Write the failing tests**

```ts
// packages/portfolio-builder/src/components/registry.test.ts
import { describe, it, expect } from 'vitest';
import { getRegistryEntry } from './registry';
import { COMPONENT_TYPES } from '../schema/types';

describe('component registry', () => {
  it('has an entry for every declared ComponentType', () => {
    for (const type of COMPONENT_TYPES) {
      expect(getRegistryEntry(type)).toBeDefined();
    }
  });

  it('returns undefined for an unregistered type', () => {
    // @ts-expect-error -- deliberately invalid for the test
    expect(getRegistryEntry('not-a-real-type')).toBeUndefined();
  });

  it('validates props through the matching entry', () => {
    const entry = getRegistryEntry('heading');
    expect(entry?.validate({})).toContain('text is required and must be a string');
    expect(entry?.validate({ text: 'Hi' })).toEqual([]);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- packages/portfolio-builder/src/components/registry.test.ts`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement**

```ts
// packages/portfolio-builder/src/components/registry.ts
import type { ComponentType } from '../schema/types';
import { HeadingItem, validateHeadingProps } from './primitives/Heading';
import { TextItem, validateTextProps } from './primitives/Text';
import { ImageItem, validateImageProps } from './primitives/Image';
import { SpacerItem, validateSpacerProps } from './primitives/Spacer';
import {
  LinkButtonItem,
  validateLinkButtonProps,
  IconLinkButtonItem,
  validateIconLinkButtonProps,
} from './wrappers/links';
import {
  BadgeItem,
  validateBadgeProps,
  ChipItem,
  validateChipProps,
  PillItem,
  validatePillProps,
  StatusIndicatorItem,
  validateStatusIndicatorProps,
  IconItem,
  validateIconProps,
} from './wrappers/display';
import { AvatarItem, validateAvatarProps } from './wrappers/avatar';
import {
  ProgressBarItem,
  validateProgressBarProps,
  CircularProgressItem,
  validateCircularProgressProps,
  KpiItem,
  validateKpiProps,
  CountUpItem,
  validateCountUpProps,
} from './wrappers/metrics';
import { CardItem, validateCardProps } from './wrappers/card';
import {
  ExpandableTextItem,
  validateExpandableTextProps,
  AccordionItem,
  validateAccordionProps,
  RevealItem,
  validateRevealProps,
  FlipCardItem,
  validateFlipCardProps,
} from './wrappers/expand';
import {
  CarouselItem,
  validateCarouselProps,
  TabsItem,
  validateTabsProps,
  OverflowTextItem,
  validateOverflowTextProps,
  TruncatedListItem,
  validateTruncatedListProps,
} from './wrappers/lists';

export interface RegistryEntry {
  component: (props: Record<string, unknown>) => React.ReactElement | null;
  validate: (props: Record<string, unknown>) => string[];
}

const REGISTRY: Record<ComponentType, RegistryEntry> = {
  heading: { component: HeadingItem, validate: validateHeadingProps },
  text: { component: TextItem, validate: validateTextProps },
  image: { component: ImageItem, validate: validateImageProps },
  spacer: { component: SpacerItem, validate: validateSpacerProps },
  card: { component: CardItem, validate: validateCardProps },
  badge: { component: BadgeItem, validate: validateBadgeProps },
  avatar: { component: AvatarItem, validate: validateAvatarProps },
  chip: { component: ChipItem, validate: validateChipProps },
  pill: { component: PillItem, validate: validatePillProps },
  icon: { component: IconItem, validate: validateIconProps },
  statusIndicator: { component: StatusIndicatorItem, validate: validateStatusIndicatorProps },
  progressBar: { component: ProgressBarItem, validate: validateProgressBarProps },
  circularProgress: { component: CircularProgressItem, validate: validateCircularProgressProps },
  kpi: { component: KpiItem, validate: validateKpiProps },
  countUp: { component: CountUpItem, validate: validateCountUpProps },
  reveal: { component: RevealItem, validate: validateRevealProps },
  collapse: { component: ExpandableTextItem, validate: validateExpandableTextProps },
  flipCard: { component: FlipCardItem, validate: validateFlipCardProps },
  carousel: { component: CarouselItem, validate: validateCarouselProps },
  overflowText: { component: OverflowTextItem, validate: validateOverflowTextProps },
  truncatedList: { component: TruncatedListItem, validate: validateTruncatedListProps },
  button: { component: LinkButtonItem, validate: validateLinkButtonProps },
  iconButton: { component: IconLinkButtonItem, validate: validateIconLinkButtonProps },
  accordion: { component: AccordionItem, validate: validateAccordionProps },
  tabs: { component: TabsItem, validate: validateTabsProps },
};

export function getRegistryEntry(type: ComponentType): RegistryEntry | undefined {
  return REGISTRY[type];
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm test -- packages/portfolio-builder/src/components/registry.test.ts`
Expected: PASS — all 3 tests.

- [ ] **Step 5: Export and commit**

```ts
// add to packages/portfolio-builder/src/index.ts
export { getRegistryEntry } from './components/registry';
export type { RegistryEntry } from './components/registry';
```

```bash
git add packages/portfolio-builder
git commit -m "feat(portfolio-builder): add component registry"
```

---

### Task 14: ItemRenderer and the shared grid CSS module

**Files:**

- Create: `packages/portfolio-builder/src/grid/Grid.module.scss`
- Create: `packages/portfolio-builder/src/render/ItemRenderer.tsx`
- Test: `packages/portfolio-builder/src/render/ItemRenderer.test.tsx`

**Interfaces:**

- Consumes: `GridItem` (Task 3), `collapsedSpans` (Task 4), `getRegistryEntry` (Task 13).
- Produces: `ItemRenderer({ item: GridItem })`. Task 15 (`RowRenderer`) is this module's only
  consumer.

- [ ] **Step 1: Write the failing tests**

```tsx
// packages/portfolio-builder/src/render/ItemRenderer.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ItemRenderer } from './ItemRenderer';
import type { GridItem } from '../schema/types';

describe('ItemRenderer', () => {
  it('renders a known, validly-configured component', () => {
    const item: GridItem = {
      id: 'item-1',
      component: 'heading',
      span: 6,
      props: { text: 'Hello' },
    };
    render(<ItemRenderer item={item} />);
    expect(screen.getByRole('heading')).toHaveTextContent('Hello');
  });

  it('sets the responsive span CSS custom properties', () => {
    const item: GridItem = { id: 'item-1', component: 'heading', span: 4, props: { text: 'Hi' } };
    render(<ItemRenderer item={item} />);
    const wrapper = screen.getByRole('heading').parentElement;
    expect(wrapper).toHaveStyle({
      '--span-desktop': '4',
      '--span-tablet': '6',
      '--span-mobile': '12',
    });
  });

  it('renders a placeholder for an unknown component type', () => {
    // @ts-expect-error -- deliberately invalid for the test
    const item: GridItem = { id: 'item-1', component: 'not-a-real-component', span: 6, props: {} };
    render(<ItemRenderer item={item} />);
    expect(screen.getByTestId('item-1')).toHaveAttribute('data-placeholder', 'true');
  });

  it('renders a placeholder when props fail validation', () => {
    const item: GridItem = { id: 'item-1', component: 'heading', span: 6, props: {} };
    render(<ItemRenderer item={item} />);
    expect(screen.getByTestId('item-1')).toHaveAttribute('data-placeholder', 'true');
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- packages/portfolio-builder/src/render/ItemRenderer.test.tsx`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement**

```scss
// packages/portfolio-builder/src/grid/Grid.module.scss
.row {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--spacing-md);
  width: 100%;
}

.item,
.itemPlaceholder {
  grid-column: span var(--span-mobile, 12);
  min-width: 0;
}

.itemPlaceholder {
  min-height: var(--spacing-xl);
  border: 1px dashed var(--theme-border-secondary);
  border-radius: var(--radius-md);
}

@media (min-width: 768px) {
  .item,
  .itemPlaceholder {
    grid-column: span var(--span-tablet, 12);
  }
}

@media (min-width: 1024px) {
  .item,
  .itemPlaceholder {
    grid-column: span var(--span-desktop, 12);
  }
}
```

```tsx
// packages/portfolio-builder/src/render/ItemRenderer.tsx
import type { CSSProperties } from 'react';
import type { GridItem } from '../schema/types';
import { getRegistryEntry } from '../components/registry';
import { collapsedSpans } from '../grid/responsive';
import styles from '../grid/Grid.module.scss';

export function ItemRenderer({ item }: { item: GridItem }) {
  const spans = collapsedSpans(item.span);
  const style = {
    '--span-desktop': String(spans.desktop),
    '--span-tablet': String(spans.tablet),
    '--span-mobile': String(spans.mobile),
  } as CSSProperties;

  const entry = getRegistryEntry(item.component);
  if (!entry || entry.validate(item.props).length > 0) {
    return (
      <div
        className={styles.itemPlaceholder}
        style={style}
        data-testid={item.id}
        data-placeholder="true"
      />
    );
  }

  const Component = entry.component;
  return (
    <div className={styles.item} style={style} data-testid={item.id}>
      <Component {...item.props} />
    </div>
  );
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm test -- packages/portfolio-builder/src/render/ItemRenderer.test.tsx`
Expected: PASS — all 4 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/portfolio-builder
git commit -m "feat(portfolio-builder): add ItemRenderer and grid CSS module"
```

---

### Task 15: RowRenderer

**Files:**

- Create: `packages/portfolio-builder/src/render/RowRenderer.tsx`
- Test: `packages/portfolio-builder/src/render/RowRenderer.test.tsx`

**Interfaces:**

- Consumes: `SectionRow` (Task 3), `ItemRenderer` (Task 14).
- Produces: `RowRenderer({ row: SectionRow })`. Task 16 (`SectionRenderer`) is this module's only
  consumer.

- [ ] **Step 1: Write the failing test**

```tsx
// packages/portfolio-builder/src/render/RowRenderer.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RowRenderer } from './RowRenderer';
import type { SectionRow } from '../schema/types';

describe('RowRenderer', () => {
  it('renders every item in the row, in order', () => {
    const row: SectionRow = {
      id: 'row-1',
      items: [
        { id: 'item-1', component: 'heading', span: 6, props: { text: 'First' } },
        { id: 'item-2', component: 'heading', span: 6, props: { text: 'Second' } },
      ],
    };
    render(<RowRenderer row={row} />);
    const headings = screen.getAllByRole('heading');
    expect(headings.map((h) => h.textContent)).toEqual(['First', 'Second']);
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- packages/portfolio-builder/src/render/RowRenderer.test.tsx`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement**

```tsx
// packages/portfolio-builder/src/render/RowRenderer.tsx
import type { SectionRow } from '../schema/types';
import { ItemRenderer } from './ItemRenderer';
import styles from '../grid/Grid.module.scss';

export function RowRenderer({ row }: { row: SectionRow }) {
  return (
    <div className={styles.row} data-testid={row.id}>
      {row.items.map((item) => (
        <ItemRenderer key={item.id} item={item} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm test -- packages/portfolio-builder/src/render/RowRenderer.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/portfolio-builder
git commit -m "feat(portfolio-builder): add RowRenderer"
```

---

### Task 16: SectionRenderer

**Files:**

- Create: `packages/portfolio-builder/src/render/Section.module.scss`
- Create: `packages/portfolio-builder/src/render/SectionRenderer.tsx`
- Test: `packages/portfolio-builder/src/render/SectionRenderer.test.tsx`

**Interfaces:**

- Consumes: `PageSection` (Task 3), `RowRenderer` (Task 15).
- Produces: `SectionRenderer({ section: PageSection })`. Task 18 (`PageRenderer`) is this module's
  only consumer.

- [ ] **Step 1: Write the failing tests**

```tsx
// packages/portfolio-builder/src/render/SectionRenderer.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionRenderer } from './SectionRenderer';
import type { PageSection } from '../schema/types';

function makeSection(overrides: Partial<PageSection> = {}): PageSection {
  return {
    id: 'about',
    name: 'About',
    showInNav: true,
    rows: [
      {
        id: 'row-1',
        items: [{ id: 'item-1', component: 'heading', span: 12, props: { text: 'About me' } }],
      },
    ],
    ...overrides,
  };
}

describe('SectionRenderer', () => {
  it('renders a section element with the section id as its anchor', () => {
    render(<SectionRenderer section={makeSection()} />);
    const section = screen.getByRole('region', { name: 'About' });
    expect(section).toHaveAttribute('id', 'about');
  });

  it('renders every row in the section', () => {
    render(<SectionRenderer section={makeSection()} />);
    expect(screen.getByText('About me')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- packages/portfolio-builder/src/render/SectionRenderer.test.tsx`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement**

```scss
// packages/portfolio-builder/src/render/Section.module.scss
.section {
  padding: var(--spacing-xxl) var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.backgroundPrimary {
  background: var(--theme-background-primary);
}
.backgroundSecondary {
  background: var(--theme-background-secondary);
}
.backgroundTertiary {
  background: var(--theme-background-tertiary);
}
.backgroundTransparent {
  background: transparent;
}
```

```tsx
// packages/portfolio-builder/src/render/SectionRenderer.tsx
import type { PageSection, SectionBackground } from '../schema/types';
import { RowRenderer } from './RowRenderer';
import styles from './Section.module.scss';

const BACKGROUND_CLASS: Record<SectionBackground, string> = {
  primary: styles.backgroundPrimary,
  secondary: styles.backgroundSecondary,
  tertiary: styles.backgroundTertiary,
  transparent: styles.backgroundTransparent,
};

export function SectionRenderer({ section }: { section: PageSection }) {
  const backgroundClass = BACKGROUND_CLASS[section.background ?? 'transparent'];
  return (
    <section
      id={section.id}
      aria-label={section.name}
      className={`${styles.section} ${backgroundClass}`}
    >
      {section.rows.map((row) => (
        <RowRenderer key={row.id} row={row} />
      ))}
    </section>
  );
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm test -- packages/portfolio-builder/src/render/SectionRenderer.test.tsx`
Expected: PASS — both tests.

- [ ] **Step 5: Commit**

```bash
git add packages/portfolio-builder
git commit -m "feat(portfolio-builder): add SectionRenderer"
```

---

### Task 17: NavBar

**Files:**

- Create: `packages/portfolio-builder/src/render/NavBar.tsx`
- Test: `packages/portfolio-builder/src/render/NavBar.test.tsx`

**Interfaces:**

- Consumes: `PageSection` (Task 3); `Navbar`, `NavbarBrand`, `NavbarNav`, `NavLink` from
  `@true-tech-team/react-components`.
- Produces: `NavBar({ title: string; sections: PageSection[] })`. Task 18 (`PageRenderer`) is this
  module's only consumer. This is a `'use client'` module — see Global Constraints.

- [ ] **Step 1: Write the failing tests**

```tsx
// packages/portfolio-builder/src/render/NavBar.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NavBar } from './NavBar';
import type { PageSection } from '../schema/types';

function makeSections(): PageSection[] {
  return [
    { id: 'about', name: 'About', showInNav: true, rows: [] },
    { id: 'hidden', name: 'Hidden Section', showInNav: false, rows: [] },
    { id: 'projects', name: 'Projects', showInNav: true, rows: [] },
  ];
}

describe('NavBar', () => {
  it('renders one link per section with showInNav true, in order', () => {
    render(<NavBar title="Justin True" sections={makeSections()} />);
    const links = screen.getAllByRole('link');
    expect(links.map((l) => l.textContent)).toEqual(['About', 'Projects']);
  });

  it('omits sections with showInNav false', () => {
    render(<NavBar title="Justin True" sections={makeSections()} />);
    expect(screen.queryByText('Hidden Section')).not.toBeInTheDocument();
  });

  it('links to the section id as a hash anchor', () => {
    render(<NavBar title="Justin True" sections={makeSections()} />);
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '#about');
  });

  it('renders the given title as the brand', () => {
    render(<NavBar title="Justin True" sections={makeSections()} />);
    expect(screen.getByText('Justin True')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- packages/portfolio-builder/src/render/NavBar.test.tsx`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement**

```tsx
// packages/portfolio-builder/src/render/NavBar.tsx
'use client';

import type { MouseEvent } from 'react';
import { Navbar, NavbarBrand, NavbarNav, NavLink } from '@true-tech-team/react-components';
import type { PageSection } from '../schema/types';

function scrollToSection(event: MouseEvent<HTMLAnchorElement>, sectionId: string) {
  event.preventDefault();
  const target = document.getElementById(sectionId);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
  window.history.pushState(null, '', `#${sectionId}`);
}

export interface NavBarProps {
  title: string;
  sections: PageSection[];
}

export function NavBar({ title, sections }: NavBarProps) {
  const navSections = sections.filter((section) => section.showInNav);
  return (
    <Navbar>
      <NavbarBrand>{title}</NavbarBrand>
      <NavbarNav>
        {navSections.map((section) => (
          <NavLink
            key={section.id}
            href={`#${section.id}`}
            onClick={(event) => scrollToSection(event, section.id)}
          >
            {section.name}
          </NavLink>
        ))}
      </NavbarNav>
    </Navbar>
  );
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm test -- packages/portfolio-builder/src/render/NavBar.test.tsx`
Expected: PASS — all 4 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/portfolio-builder
git commit -m "feat(portfolio-builder): add section-derived smooth-scroll NavBar"
```

---

### Task 18: PageRenderer and final package exports

**Files:**

- Create: `packages/portfolio-builder/src/render/PageRenderer.tsx`
- Test: `packages/portfolio-builder/src/render/PageRenderer.test.tsx`
- Modify: `packages/portfolio-builder/src/index.ts`

**Interfaces:**

- Consumes: `PortfolioPage` (Task 3), `NavBar` (Task 17), `SectionRenderer` (Task 16).
- Produces: `PageRenderer({ page: PortfolioPage })` — the package's top-level export and the only
  piece later sub-projects (editor preview, publish route) need to import to render a saved page.
  Per the spec, this component never renders `GlobalProvider`.

- [ ] **Step 1: Write the failing tests**

```tsx
// packages/portfolio-builder/src/render/PageRenderer.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageRenderer } from './PageRenderer';
import type { PortfolioPage } from '../schema/types';

function makePage(): PortfolioPage {
  return {
    schemaVersion: 1,
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'developer-01',
    showNav: true,
    sections: [
      {
        id: 'about',
        name: 'About',
        showInNav: true,
        rows: [
          {
            id: 'row-1',
            items: [{ id: 'item-1', component: 'heading', span: 12, props: { text: 'About me' } }],
          },
        ],
      },
      {
        id: 'projects',
        name: 'Projects',
        showInNav: true,
        rows: [
          {
            id: 'row-2',
            items: [
              { id: 'item-2', component: 'heading', span: 12, props: { text: 'My projects' } },
            ],
          },
        ],
      },
    ],
  };
}

describe('PageRenderer', () => {
  it('renders a nav link for every section when showNav is true', () => {
    render(<PageRenderer page={makePage()} />);
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument();
  });

  it('omits the nav entirely when showNav is false', () => {
    render(<PageRenderer page={{ ...makePage(), showNav: false }} />);
    expect(screen.queryByRole('link', { name: 'About' })).not.toBeInTheDocument();
  });

  it('renders every section', () => {
    render(<PageRenderer page={makePage()} />);
    expect(screen.getByText('About me')).toBeInTheDocument();
    expect(screen.getByText('My projects')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- packages/portfolio-builder/src/render/PageRenderer.test.tsx`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement**

```tsx
// packages/portfolio-builder/src/render/PageRenderer.tsx
import type { PortfolioPage } from '../schema/types';
import { NavBar } from './NavBar';
import { SectionRenderer } from './SectionRenderer';

export function PageRenderer({ page }: { page: PortfolioPage }) {
  return (
    <div>
      {page.showNav ? <NavBar title={page.title} sections={page.sections} /> : null}
      {page.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm test -- packages/portfolio-builder/src/render/PageRenderer.test.tsx`
Expected: PASS — all 3 tests.

- [ ] **Step 5: Export the full public surface and commit**

```ts
// packages/portfolio-builder/src/index.ts — final version, replaces earlier partial versions
export const PORTFOLIO_BUILDER_SCHEMA_VERSION = 1;

export type {
  PortfolioPage,
  PageSection,
  SectionRow,
  GridItem,
  ComponentType,
  SectionBackground,
} from './schema/types';
export { COMPONENT_TYPES, isComponentType } from './schema/types';

export { validatePortfolioPage } from './schema/validate';
export type { ValidationResult } from './schema/validate';

export { collapsedSpans } from './grid/responsive';
export type { CollapsedSpans } from './grid/responsive';

export { getRegistryEntry } from './components/registry';
export type { RegistryEntry } from './components/registry';

export { PageRenderer } from './render/PageRenderer';
```

```bash
git add packages/portfolio-builder
git commit -m "feat(portfolio-builder): add PageRenderer and finalize package exports"
```

---

### Task 19: Full-repo verification

**Files:** none (verification only).

**Interfaces:** none — this task confirms the whole package satisfies the repo's existing
"Before Committing" checklist from `CLAUDE.md`.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS — every test file from Tasks 1–18.

- [ ] **Step 2: Run lint, typecheck, and format checks**

Run: `npm run lint`
Expected: 0 errors, 0 warnings.

Run: `npm run typecheck`
Expected: 0 errors.

Run: `npm run format:check`
Expected: no unformatted files. If it fails, run `npm run format` and re-check.

Run: `npm run lint:styles`
Expected: 0 errors on the new `.module.scss` files.

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: build succeeds (the package isn't wired into any route yet, so this mainly confirms
`transpilePackages` resolves the new package and nothing in it breaks the Next.js build graph).

- [ ] **Step 4: Fix anything the checks above surfaced**

If any command in Steps 1–3 fails, fix the underlying issue in the relevant task's files (not by
disabling the check) and re-run that command until it passes.

- [ ] **Step 5: Commit**

Only commit if Step 4 required changes — if everything passed cleanly in Steps 1–3, there is
nothing new to commit here.

```bash
git add -A
git commit -m "fix(portfolio-builder): resolve lint/typecheck/format/build issues"
```
