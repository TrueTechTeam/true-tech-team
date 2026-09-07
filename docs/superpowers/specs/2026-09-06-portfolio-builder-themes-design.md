# Portfolio Builder — Sub-project 2: Theme Presets & Picker

## Context

This is the second of six sub-projects that make up the **Portfolio Builder** mini-app (see
`docs/superpowers/specs/2026-09-06-portfolio-builder-renderer-design.md` for the full
decomposition and sub-project 1, the schema/grid/renderer engine, which this sub-project builds
on top of).

This document specs **only sub-project 2**: ~20 named theme presets and a reusable picker
component. It does not touch rendering, routing, or theme _application_ — see Non-goals.

## Goals

- Define a `ThemePreset` data shape and a registry of 20 named presets, each a `ThemeOverride`
  (the existing type from `@true-tech-team/react-components`, already used by
  `PortfolioPage.themeOverride` in sub-project 1) that a user can pick for their page.
- Build a standalone, reusable `ThemePicker` component that displays all presets as selectable
  swatches. It has no route of its own — sub-project 4 (the drag-and-drop editor) embeds it later.
- Keep preset authoring maintainable: 20 presets is enough hand-authored data that a systematic,
  formulaic approach (not 20 independently hand-tuned color palettes) is required.

## Non-goals (deferred to later sub-projects)

- **Theme application remains entirely out of scope**, per sub-project 1's spec: `PageRenderer`
  must never call `GlobalProvider`. This sub-project only produces preset _data_ and a picker
  _component_ — no code here applies a theme to anything. Sub-project 6 (publish route) and
  sub-project 4 (editor preview) are responsible for actually applying a selected
  `ThemeOverride`.
- No new route or page. `ThemePicker` is a component for sub-project 4 to embed.
- No spacing/typography/borderRadius/shadow overrides — presets only touch `colors`, per the
  "Preset color scope" decision below. A future sub-project could extend a preset with those if a
  real need surfaces.
- No custom-domain/branding upload (e.g., a company logo influencing theme) — out of scope for a
  personal-portfolio builder's theme presets.

## Preset data shape

```ts
interface ThemePreset {
  id: string;
  name: string;
  overrides: ThemeOverride; // from @true-tech-team/react-components
}
```

`PortfolioPage.themeId` (already defined in sub-project 1's schema) references a `ThemePreset.id`
here. `getThemePreset(id): ThemePreset | undefined` is the lookup, mirroring the
`getRegistryEntry` pattern from sub-project 1.

## Preset color scope

Each preset overrides a curated 17-key subset of `ThemeColorTokens`, not the full ~44-key set:

```
primary, primaryHover, primaryActive,
secondary, secondaryHover, secondaryActive,
backgroundPrimary, backgroundSecondary, backgroundTertiary,
surfacePrimary, surfaceSecondary, surfaceElevated,
textPrimary, textSecondary, textTertiary,
borderPrimary, borderSecondary
```

Semantic colors (`success`, `warning`, `error`, `info`) are **not** overridden by any preset —
they stay the library's defaults across all 20 themes, since a red "error" state should mean the
same thing regardless of which visual theme a page uses.

## Color source: the library's existing palette, not new hex values

`@true-tech-team/react-components` already ships 37 color families × 10 shades (50–900) as CSS
custom properties (`--color-{family}-{shade}`, confirmed shipped in the library's `index.css`;
e.g. `--color-blue-500`). Every preset's 17 color values are `var(--color-<family>-<shade>)`
string references into that existing system — not new hardcoded hex codes. This guarantees visual
consistency with the design system's existing palette and turns "author 340 colors by eye" (20
presets × 17 keys) into "pick a primary family, a secondary family, and a neutral family per
preset, then apply one of two fixed shade formulas."

### Shade formula (fixed, applied per preset by mode)

**Light-mode formula** (`primaryFamily`, `secondaryFamily`, `neutralFamily` are the three inputs
per preset):

```
primary          = var(--color-<primaryFamily>-500)
primaryHover      = var(--color-<primaryFamily>-600)
primaryActive     = var(--color-<primaryFamily>-700)
secondary         = var(--color-<secondaryFamily>-500)
secondaryHover    = var(--color-<secondaryFamily>-600)
secondaryActive   = var(--color-<secondaryFamily>-700)
backgroundPrimary   = var(--color-<neutralFamily>-50)
backgroundSecondary = var(--color-<neutralFamily>-100)
backgroundTertiary  = var(--color-<neutralFamily>-200)
surfacePrimary   = var(--color-<neutralFamily>-50)
surfaceSecondary = var(--color-<neutralFamily>-100)
surfaceElevated  = var(--color-<neutralFamily>-50)
textPrimary   = var(--color-<neutralFamily>-900)
textSecondary = var(--color-<neutralFamily>-600)
textTertiary  = var(--color-<neutralFamily>-400)
borderPrimary   = var(--color-<neutralFamily>-200)
borderSecondary = var(--color-<neutralFamily>-300)
mode = 'light'
```

**Dark-mode formula** (accent shades shift lighter so they pop against a dark background):

```
primary          = var(--color-<primaryFamily>-400)
primaryHover      = var(--color-<primaryFamily>-300)
primaryActive     = var(--color-<primaryFamily>-200)
secondary         = var(--color-<secondaryFamily>-400)
secondaryHover    = var(--color-<secondaryFamily>-300)
secondaryActive   = var(--color-<secondaryFamily>-200)
backgroundPrimary   = var(--color-<neutralFamily>-900)
backgroundSecondary = var(--color-<neutralFamily>-800)
backgroundTertiary  = var(--color-<neutralFamily>-700)
surfacePrimary   = var(--color-<neutralFamily>-800)
surfaceSecondary = var(--color-<neutralFamily>-700)
surfaceElevated  = var(--color-<neutralFamily>-700)
textPrimary   = var(--color-<neutralFamily>-50)
textSecondary = var(--color-<neutralFamily>-300)
textTertiary  = var(--color-<neutralFamily>-500)
borderPrimary   = var(--color-<neutralFamily>-700)
borderSecondary = var(--color-<neutralFamily>-600)
mode = 'dark'
```

The implementation plan builds these as two small generator functions
(`buildLightPreset(id, name, primaryFamily, secondaryFamily, neutralFamily)` and
`buildDarkPreset(...)`) rather than 20 independently hand-written object literals — the
repetition across 20 near-identical structures justifies the abstraction.

## The 20 presets

| #   | id             | Name         | Mode  | Primary family | Secondary family | Neutral family |
| --- | -------------- | ------------ | ----- | -------------- | ---------------- | -------------- |
| 1   | `slate`        | Slate        | light | blue           | slate            | slate          |
| 2   | `coral-reef`   | Coral Reef   | light | coral          | turquoise        | stone          |
| 3   | `forest`       | Forest       | light | green          | brown            | stone          |
| 4   | `sunset`       | Sunset       | light | orange         | pink             | stone          |
| 5   | `ocean`        | Ocean        | light | cyan           | navy             | slate          |
| 6   | `lavender`     | Lavender     | light | violet         | purple           | gray           |
| 7   | `blush`        | Blush        | light | pink           | rose             | stone          |
| 8   | `mint`         | Mint         | light | mint           | teal             | gray           |
| 9   | `amber-glow`   | Amber Glow   | light | amber          | gold             | stone          |
| 10  | `arctic`       | Arctic       | light | sky            | cyan             | zinc           |
| 11  | `terracotta`   | Terracotta   | light | brown          | coral            | stone          |
| 12  | `sage`         | Sage         | light | olive          | green            | stone          |
| 13  | `rose-gold`    | Rose Gold    | light | rose           | gold             | neutral        |
| 14  | `steel`        | Steel        | light | gray           | sky              | zinc           |
| 15  | `sand`         | Sand         | light | gold           | brown            | stone          |
| 16  | `emerald`      | Emerald      | light | emerald        | teal             | slate          |
| 17  | `midnight`     | Midnight     | dark  | blue           | indigo           | slate          |
| 18  | `charcoal`     | Charcoal     | dark  | amber          | orange           | zinc           |
| 19  | `indigo-night` | Indigo Night | dark  | violet         | fuchsia          | slate          |
| 20  | `plum`         | Plum         | dark  | magenta        | purple           | neutral        |

16 light presets, 4 dark presets — enough dark-mode variety for users who want that aesthetic
without making it the default (portfolio/professional content generally reads better light-mode
first).

## `ThemePicker` component

```ts
interface ThemePickerProps {
  presets: ThemePreset[];
  selectedId?: string;
  onSelect: (id: string) => void;
}
```

Renders a grid of swatch cards — one per preset — each showing a small color preview built
**from that preset's own override values** (not the ambient page theme, since the picker must
show all 20 themes side-by-side regardless of which theme happens to be active around it) plus
the preset's name. Built from `@true-tech-team/react-components`'s `Card` for each swatch
container; the selected preset gets a visible selected state (e.g. a border/ring using the
ambient theme's own `--theme-primary`, since that part of the UI _does_ belong to the ambient
theme, unlike the swatch previews themselves).

No new custom grid/primitive component is needed here — `ThemePicker` is a single component that
lays out `Card`s in a CSS grid (a plain `.module.scss` grid, not the portfolio page's 12-column
grid from sub-project 1, since this is chrome/UI, not user-authored page content).

## Testing

- Unit tests for `buildLightPreset`/`buildDarkPreset` (correct `var()` string construction for a
  few sample family/shade combinations, correct `mode` value).
- A test asserting all 20 presets have unique `id`s and that `getThemePreset` resolves each one.
- React Testing Library tests for `ThemePicker`: renders one swatch per preset with the correct
  name; calls `onSelect` with the right id on click; marks the currently `selectedId` preset as
  selected (e.g. via an `aria-pressed`/`aria-selected` attribute or a distinguishing class,
  decided at implementation time).

## Open items carried to later sub-projects

- Whether a preset's accent colors should also flow into non-color tokens (e.g. a "playful" theme
  wanting a larger `borderRadius`) is deferred — presets are colors-only for now, per this spec's
  Non-goals.
- How `ThemePicker` is actually wired into an editing flow (a property panel, a modal, etc.) is
  entirely sub-project 4's concern; this sub-project only guarantees the component exists, is
  tested, and is exported from the package's public surface.
