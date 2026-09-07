# Portfolio Builder — Theme Presets & Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 20 named `ThemePreset` objects (16 light, 4 dark) built from two fixed color-shade
formulas, plus a standalone `ThemePicker` component, to the existing
`@true-tech-team/portfolio-builder` package.

**Architecture:** Two small pure generator functions (`buildLightPreset`/`buildDarkPreset`)
produce `ThemePreset` objects from a family-name triple, avoiding 20 independently hand-authored
color palettes. Presets reference the component library's existing 37-family color scale via
`var(--color-family-shade)` strings — no new hex values anywhere. `ThemePicker` is a presentational
component with no route; a later sub-project (the editor) embeds it.

**Tech Stack:** TypeScript, React 19, SCSS Modules, `@true-tech-team/react-components`,
Vitest + React Testing Library (already set up by the renderer sub-project).

**Spec:** `docs/superpowers/specs/2026-09-06-portfolio-builder-themes-design.md`

## Global Constraints

- No `any` anywhere; `import type` for type-only imports; ESLint runs with `--max-warnings=0`.
- `ThemeOverride` (from `@true-tech-team/react-components`) has **no `mode` field** — it is
  `Partial<{ colors, spacing, typography, borderRadius, shadows }>`. `ThemePreset.mode` is its own
  top-level field, never written into `overrides`.
- Every preset's color values are `var(--color-<family>-<shade>)` string literals — never a
  hardcoded hex/rgb value. `<family>` must be one of the 32 values of the library's exported
  `ColorFamily` type; `<shade>` one of `50/100/200/.../900` (`ColorShade`).
- No theme _application_ in this sub-project — nothing here calls `GlobalProvider`. This
  sub-project only exports preset data and a presentational picker component.
- `vitest.setup.ts` already registers a global `afterEach(cleanup)` (added during the renderer
  sub-project's final review) — do **not** add a per-test-file `afterEach(cleanup)`; RTL cleanup
  between tests is already handled globally.
- `ThemePicker`'s selectable tiles are native `<button>` elements (not the library's `Button`),
  each wrapped in a non-interactive `Card` for the visual container. Reasoning: the library's
  `Button` has no documented `aria-pressed` support and its children slot isn't intended for the
  rich swatch-preview layout this needs, while a native `<button>` gives real, testable
  keyboard/ARIA behavior; `Card` (used with no `interactive`/`onClick` props of its own, so no
  nested-interactive-element conflict) supplies the visual card styling the spec calls for.

---

### Task 1: Color-shade formula generators

**Files:**

- Create: `packages/portfolio-builder/src/themes/types.ts`
- Create: `packages/portfolio-builder/src/themes/colorFormula.ts`
- Test: `packages/portfolio-builder/src/themes/colorFormula.test.ts`

**Interfaces:**

- Produces: `ThemePreset` (`{ id: string; name: string; mode: ThemeMode; overrides: ThemeOverride
}`), `buildLightPreset(id, name, primaryFamily, secondaryFamily, neutralFamily): ThemePreset`,
  `buildDarkPreset(id, name, primaryFamily, secondaryFamily, neutralFamily): ThemePreset`. Task 2
  (the 20 presets) is this module's only consumer.

- [ ] **Step 1: Write the failing tests**

```ts
// packages/portfolio-builder/src/themes/colorFormula.test.ts
import { describe, it, expect } from 'vitest';
import { buildLightPreset, buildDarkPreset } from './colorFormula';

describe('buildLightPreset', () => {
  it('builds var() color references using the light-mode shade formula', () => {
    const preset = buildLightPreset('slate', 'Slate', 'blue', 'slate', 'slate');
    expect(preset.id).toBe('slate');
    expect(preset.name).toBe('Slate');
    expect(preset.mode).toBe('light');
    expect(preset.overrides.colors?.primary).toBe('var(--color-blue-500)');
    expect(preset.overrides.colors?.primaryHover).toBe('var(--color-blue-600)');
    expect(preset.overrides.colors?.primaryActive).toBe('var(--color-blue-700)');
    expect(preset.overrides.colors?.secondary).toBe('var(--color-slate-500)');
    expect(preset.overrides.colors?.secondaryHover).toBe('var(--color-slate-600)');
    expect(preset.overrides.colors?.secondaryActive).toBe('var(--color-slate-700)');
    expect(preset.overrides.colors?.backgroundPrimary).toBe('var(--color-slate-50)');
    expect(preset.overrides.colors?.backgroundSecondary).toBe('var(--color-slate-100)');
    expect(preset.overrides.colors?.backgroundTertiary).toBe('var(--color-slate-200)');
    expect(preset.overrides.colors?.surfacePrimary).toBe('var(--color-slate-50)');
    expect(preset.overrides.colors?.surfaceSecondary).toBe('var(--color-slate-100)');
    expect(preset.overrides.colors?.surfaceElevated).toBe('var(--color-slate-50)');
    expect(preset.overrides.colors?.textPrimary).toBe('var(--color-slate-900)');
    expect(preset.overrides.colors?.textSecondary).toBe('var(--color-slate-600)');
    expect(preset.overrides.colors?.textTertiary).toBe('var(--color-slate-400)');
    expect(preset.overrides.colors?.borderPrimary).toBe('var(--color-slate-200)');
    expect(preset.overrides.colors?.borderSecondary).toBe('var(--color-slate-300)');
  });

  it('does not set a mode field inside overrides', () => {
    const preset = buildLightPreset('slate', 'Slate', 'blue', 'slate', 'slate');
    expect(preset.overrides).not.toHaveProperty('mode');
  });
});

describe('buildDarkPreset', () => {
  it('builds var() color references using the dark-mode shade formula', () => {
    const preset = buildDarkPreset('midnight', 'Midnight', 'blue', 'indigo', 'slate');
    expect(preset.mode).toBe('dark');
    expect(preset.overrides.colors?.primary).toBe('var(--color-blue-400)');
    expect(preset.overrides.colors?.primaryHover).toBe('var(--color-blue-300)');
    expect(preset.overrides.colors?.primaryActive).toBe('var(--color-blue-200)');
    expect(preset.overrides.colors?.secondary).toBe('var(--color-indigo-400)');
    expect(preset.overrides.colors?.backgroundPrimary).toBe('var(--color-slate-900)');
    expect(preset.overrides.colors?.backgroundSecondary).toBe('var(--color-slate-800)');
    expect(preset.overrides.colors?.backgroundTertiary).toBe('var(--color-slate-700)');
    expect(preset.overrides.colors?.surfacePrimary).toBe('var(--color-slate-800)');
    expect(preset.overrides.colors?.surfaceSecondary).toBe('var(--color-slate-700)');
    expect(preset.overrides.colors?.surfaceElevated).toBe('var(--color-slate-700)');
    expect(preset.overrides.colors?.textPrimary).toBe('var(--color-slate-50)');
    expect(preset.overrides.colors?.textSecondary).toBe('var(--color-slate-300)');
    expect(preset.overrides.colors?.textTertiary).toBe('var(--color-slate-500)');
    expect(preset.overrides.colors?.borderPrimary).toBe('var(--color-slate-700)');
    expect(preset.overrides.colors?.borderSecondary).toBe('var(--color-slate-600)');
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- packages/portfolio-builder/src/themes/colorFormula.test.ts`
Expected: FAIL — `./colorFormula` doesn't exist.

- [ ] **Step 3: Implement**

```ts
// packages/portfolio-builder/src/themes/types.ts
import type { ThemeMode, ThemeOverride } from '@true-tech-team/react-components';

export interface ThemePreset {
  id: string;
  name: string;
  mode: ThemeMode;
  overrides: ThemeOverride;
}
```

```ts
// packages/portfolio-builder/src/themes/colorFormula.ts
import type { ColorFamily } from '@true-tech-team/react-components';
import type { ThemePreset } from './types';

function colorVar(family: ColorFamily, shade: number): string {
  return `var(--color-${family}-${shade})`;
}

export function buildLightPreset(
  id: string,
  name: string,
  primaryFamily: ColorFamily,
  secondaryFamily: ColorFamily,
  neutralFamily: ColorFamily
): ThemePreset {
  return {
    id,
    name,
    mode: 'light',
    overrides: {
      colors: {
        primary: colorVar(primaryFamily, 500),
        primaryHover: colorVar(primaryFamily, 600),
        primaryActive: colorVar(primaryFamily, 700),
        secondary: colorVar(secondaryFamily, 500),
        secondaryHover: colorVar(secondaryFamily, 600),
        secondaryActive: colorVar(secondaryFamily, 700),
        backgroundPrimary: colorVar(neutralFamily, 50),
        backgroundSecondary: colorVar(neutralFamily, 100),
        backgroundTertiary: colorVar(neutralFamily, 200),
        surfacePrimary: colorVar(neutralFamily, 50),
        surfaceSecondary: colorVar(neutralFamily, 100),
        surfaceElevated: colorVar(neutralFamily, 50),
        textPrimary: colorVar(neutralFamily, 900),
        textSecondary: colorVar(neutralFamily, 600),
        textTertiary: colorVar(neutralFamily, 400),
        borderPrimary: colorVar(neutralFamily, 200),
        borderSecondary: colorVar(neutralFamily, 300),
      },
    },
  };
}

export function buildDarkPreset(
  id: string,
  name: string,
  primaryFamily: ColorFamily,
  secondaryFamily: ColorFamily,
  neutralFamily: ColorFamily
): ThemePreset {
  return {
    id,
    name,
    mode: 'dark',
    overrides: {
      colors: {
        primary: colorVar(primaryFamily, 400),
        primaryHover: colorVar(primaryFamily, 300),
        primaryActive: colorVar(primaryFamily, 200),
        secondary: colorVar(secondaryFamily, 400),
        secondaryHover: colorVar(secondaryFamily, 300),
        secondaryActive: colorVar(secondaryFamily, 200),
        backgroundPrimary: colorVar(neutralFamily, 900),
        backgroundSecondary: colorVar(neutralFamily, 800),
        backgroundTertiary: colorVar(neutralFamily, 700),
        surfacePrimary: colorVar(neutralFamily, 800),
        surfaceSecondary: colorVar(neutralFamily, 700),
        surfaceElevated: colorVar(neutralFamily, 700),
        textPrimary: colorVar(neutralFamily, 50),
        textSecondary: colorVar(neutralFamily, 300),
        textTertiary: colorVar(neutralFamily, 500),
        borderPrimary: colorVar(neutralFamily, 700),
        borderSecondary: colorVar(neutralFamily, 600),
      },
    },
  };
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm test -- packages/portfolio-builder/src/themes/colorFormula.test.ts`
Expected: PASS — all 3 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/portfolio-builder/src/themes
git commit -m "feat(portfolio-builder): add theme color-shade formula generators"
```

---

### Task 2: The 20 theme presets

**Files:**

- Create: `packages/portfolio-builder/src/themes/presets.ts`
- Test: `packages/portfolio-builder/src/themes/presets.test.ts`
- Modify: `packages/portfolio-builder/src/index.ts`

**Interfaces:**

- Consumes: `buildLightPreset`, `buildDarkPreset` (Task 1); `ThemePreset` (Task 1).
- Produces: `THEME_PRESETS: ThemePreset[]` (20 entries), `getThemePreset(id: string): ThemePreset
| undefined`. Task 3 (`ThemePicker`'s tests and any future consumer) uses these.

- [ ] **Step 1: Write the failing tests**

```ts
// packages/portfolio-builder/src/themes/presets.test.ts
import { describe, it, expect } from 'vitest';
import { THEME_PRESETS, getThemePreset } from './presets';

describe('THEME_PRESETS', () => {
  it('has exactly 20 presets', () => {
    expect(THEME_PRESETS).toHaveLength(20);
  });

  it('has unique ids', () => {
    const ids = THEME_PRESETS.map((preset) => preset.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has 16 light presets and 4 dark presets', () => {
    const light = THEME_PRESETS.filter((preset) => preset.mode === 'light');
    const dark = THEME_PRESETS.filter((preset) => preset.mode === 'dark');
    expect(light).toHaveLength(16);
    expect(dark).toHaveLength(4);
  });
});

describe('getThemePreset', () => {
  it('resolves every declared preset id to itself', () => {
    for (const preset of THEME_PRESETS) {
      expect(getThemePreset(preset.id)).toBe(preset);
    }
  });

  it('returns undefined for an unknown id', () => {
    expect(getThemePreset('not-a-real-id')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- packages/portfolio-builder/src/themes/presets.test.ts`
Expected: FAIL — `./presets` doesn't exist.

- [ ] **Step 3: Implement**

```ts
// packages/portfolio-builder/src/themes/presets.ts
import { buildLightPreset, buildDarkPreset } from './colorFormula';
import type { ThemePreset } from './types';

export const THEME_PRESETS: ThemePreset[] = [
  buildLightPreset('slate', 'Slate', 'blue', 'slate', 'slate'),
  buildLightPreset('coral-reef', 'Coral Reef', 'coral', 'turquoise', 'stone'),
  buildLightPreset('forest', 'Forest', 'green', 'brown', 'stone'),
  buildLightPreset('sunset', 'Sunset', 'orange', 'pink', 'stone'),
  buildLightPreset('ocean', 'Ocean', 'cyan', 'navy', 'slate'),
  buildLightPreset('lavender', 'Lavender', 'violet', 'purple', 'gray'),
  buildLightPreset('blush', 'Blush', 'pink', 'rose', 'stone'),
  buildLightPreset('mint', 'Mint', 'mint', 'teal', 'gray'),
  buildLightPreset('amber-glow', 'Amber Glow', 'amber', 'gold', 'stone'),
  buildLightPreset('arctic', 'Arctic', 'sky', 'cyan', 'zinc'),
  buildLightPreset('terracotta', 'Terracotta', 'brown', 'coral', 'stone'),
  buildLightPreset('sage', 'Sage', 'olive', 'green', 'stone'),
  buildLightPreset('rose-gold', 'Rose Gold', 'rose', 'gold', 'neutral'),
  buildLightPreset('steel', 'Steel', 'gray', 'sky', 'zinc'),
  buildLightPreset('sand', 'Sand', 'gold', 'brown', 'stone'),
  buildLightPreset('emerald', 'Emerald', 'emerald', 'teal', 'slate'),
  buildDarkPreset('midnight', 'Midnight', 'blue', 'indigo', 'slate'),
  buildDarkPreset('charcoal', 'Charcoal', 'amber', 'orange', 'zinc'),
  buildDarkPreset('indigo-night', 'Indigo Night', 'violet', 'fuchsia', 'slate'),
  buildDarkPreset('plum', 'Plum', 'magenta', 'purple', 'neutral'),
];

export function getThemePreset(id: string): ThemePreset | undefined {
  return THEME_PRESETS.find((preset) => preset.id === id);
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm test -- packages/portfolio-builder/src/themes/presets.test.ts`
Expected: PASS — all 5 tests.

- [ ] **Step 5: Export from the package and commit**

```ts
// add to packages/portfolio-builder/src/index.ts
export { THEME_PRESETS, getThemePreset } from './themes/presets';
export type { ThemePreset } from './themes/types';
```

```bash
git add packages/portfolio-builder
git commit -m "feat(portfolio-builder): add the 20 theme presets"
```

---

### Task 3: `ThemePicker` component

**Files:**

- Create: `packages/portfolio-builder/src/themes/ThemePicker.tsx`
- Create: `packages/portfolio-builder/src/themes/ThemePicker.module.scss`
- Test: `packages/portfolio-builder/src/themes/ThemePicker.test.tsx`
- Modify: `packages/portfolio-builder/src/index.ts`

**Interfaces:**

- Consumes: `ThemePreset` (Task 1); `Card` from `@true-tech-team/react-components`.
- Produces: `ThemePicker({ presets, selectedId, onSelect }: ThemePickerProps)`. This is the final
  public export of this sub-project — sub-project 4 (the editor) is its consumer.

- [ ] **Step 1: Write the failing tests**

```tsx
// packages/portfolio-builder/src/themes/ThemePicker.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemePicker } from './ThemePicker';
import type { ThemePreset } from './types';

function makePresets(): ThemePreset[] {
  return [
    {
      id: 'a',
      name: 'Preset A',
      mode: 'light',
      overrides: { colors: { primary: 'var(--color-blue-500)' } },
    },
    {
      id: 'b',
      name: 'Preset B',
      mode: 'dark',
      overrides: { colors: { primary: 'var(--color-violet-400)' } },
    },
  ];
}

describe('ThemePicker', () => {
  it('renders one tile per preset, named for that preset', () => {
    render(<ThemePicker presets={makePresets()} onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: 'Preset A' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Preset B' })).toBeInTheDocument();
  });

  it('calls onSelect with the clicked preset id', async () => {
    const onSelect = vi.fn();
    render(<ThemePicker presets={makePresets()} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Preset A' }));
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('marks only the currently selected preset with aria-pressed', () => {
    render(<ThemePicker presets={makePresets()} selectedId="b" onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: 'Preset A' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(screen.getByRole('button', { name: 'Preset B' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});
```

Add `@testing-library/user-event` if not already a devDependency — it was added to root
`package.json` during the renderer sub-project (Task 11), so this should already be available;
confirm before adding it again.

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- packages/portfolio-builder/src/themes/ThemePicker.test.tsx`
Expected: FAIL — `./ThemePicker` doesn't exist.

- [ ] **Step 3: Implement**

```tsx
// packages/portfolio-builder/src/themes/ThemePicker.tsx
import { Card } from '@true-tech-team/react-components';
import type { ThemePreset } from './types';
import styles from './ThemePicker.module.scss';

export interface ThemePickerProps {
  presets: ThemePreset[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

function Swatch({ preset }: { preset: ThemePreset }) {
  const colors = preset.overrides.colors ?? {};
  return (
    <span className={styles.swatchRow}>
      <span className={styles.swatch} style={{ background: colors.primary }} />
      <span className={styles.swatch} style={{ background: colors.secondary }} />
      <span className={styles.swatch} style={{ background: colors.backgroundPrimary }} />
    </span>
  );
}

export function ThemePicker({ presets, selectedId, onSelect }: ThemePickerProps) {
  return (
    <div className={styles.grid}>
      {presets.map((preset) => {
        const isSelected = preset.id === selectedId;
        return (
          <Card
            key={preset.id}
            padding="sm"
            className={isSelected ? styles.selectedCard : undefined}
          >
            <button
              type="button"
              className={styles.tile}
              aria-pressed={isSelected}
              onClick={() => onSelect(preset.id)}
            >
              <Swatch preset={preset} />
              <span className={styles.name}>{preset.name}</span>
            </button>
          </Card>
        );
      })}
    </div>
  );
}
```

```scss
// packages/portfolio-builder/src/themes/ThemePicker.module.scss
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--spacing-md);
}

.tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  font: inherit;
  color: inherit;
}

.swatchRow {
  display: flex;
  gap: var(--spacing-xs);
}

.swatch {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  border: 1px solid var(--theme-border-secondary);
}

.name {
  font-size: var(--font-size-sm);
  color: var(--theme-text-primary);
}

.selectedCard {
  border: 2px solid var(--theme-primary);
}
```

- [ ] **Step 4: Run and confirm pass**

Run: `npm test -- packages/portfolio-builder/src/themes/ThemePicker.test.tsx`
Expected: PASS — all 3 tests.

- [ ] **Step 5: Export from the package and commit**

```ts
// add to packages/portfolio-builder/src/index.ts
export { ThemePicker } from './themes/ThemePicker';
export type { ThemePickerProps } from './themes/ThemePicker';
```

```bash
git add packages/portfolio-builder
git commit -m "feat(portfolio-builder): add ThemePicker component"
```

---

### Task 4: Full-repo verification

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS — every test file from Tasks 1–3, plus everything from the renderer sub-project.

- [ ] **Step 2: Run lint, typecheck, format, and stylelint**

Run: `npm run lint` — 0 errors, 0 warnings.
Run: `npm run typecheck` — 0 errors.
Run: `npm run lint:styles` — 0 errors on the new `.module.scss` file.
Run: `npm run format:check` on the files this plan touched (the repo has pre-existing, unrelated
formatting issues in files outside this scope — do not run a repo-wide `npm run format`; check
only `packages/portfolio-builder/src/themes/**` and `packages/portfolio-builder/src/index.ts`).

- [ ] **Step 3: Run the production build**

Run: `npm run build` — confirm it still succeeds.

- [ ] **Step 4: Fix anything the checks above surfaced**

Fix in the relevant task's files (not by disabling checks) and re-run until clean.

- [ ] **Step 5: Commit only if Step 4 required changes**

```bash
git add -A
git commit -m "fix(portfolio-builder): resolve lint/typecheck/format/build issues"
```
