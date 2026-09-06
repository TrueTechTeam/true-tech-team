# Portfolio Builder — Sub-project 1: Schema, Grid Model & Renderer

## Context

This is the first of six sub-projects that together make up the **Portfolio Builder** mini-app: a
drag-and-drop, single-page website/portfolio builder for True Tech Team members, aimed at
job-seekers and professionals who want a personal site (developers, designers, writers,
photographers, consultants, students, etc.).

Full project decomposition, in build order:

1. **Schema, grid model & renderer** (this spec) — the JSON page format and the engine that turns
   it into a live page. Everything below depends on this.
2. Theme presets — ~20 `ThemeOverride` objects fitting `@true-tech-team/react-components`'s theme
   token structure, plus a theme picker.
3. Asset upload/storage — Supabase Storage bucket + RLS for images and documents (resumes, etc.)
   referenced from page JSON.
4. Drag-and-drop editor — visual builder UI with a component palette and per-element property
   panel, built on top of (1).
5. Per-profession starter templates — pre-built `PortfolioPage` JSON for each target job/role.
6. Publish route — serving a saved page at `/p/[slug]`.

This document specs **only sub-project 1**.

## Goals

- Define a JSON schema (`PortfolioPage`) that fully describes a single-page site: layout, content,
  and theme — sufficient on its own (plus resolved asset URLs) to reconstruct the page in a
  browser with no other state.
- Define a 12-column, row-based grid model (Bootstrap-style: section → row → items, spans sum to
  ≤12) that collapses responsively without any client-side breakpoint-detection JS.
- Build a renderer (`PageRenderer` and friends) that takes a `PortfolioPage` and renders it, using
  `@true-tech-team/react-components` wherever a suitable component already exists, and a small set
  of custom primitives where it doesn't.
- Establish the component registry pattern used to constrain what can be placed on the grid to
  "simple visual" components (no inputs, no data-driven components).

## Non-goals (deferred to later sub-projects)

- Any editor UI (drag-and-drop, property panels, component palette) — sub-project 4.
- Theme presets and the theme picker — sub-project 2 (this spec only requires that `themeOverride`
  conforms to the existing `ThemeOverride` type from `react-components`).
- Asset upload, storage, and resolution of asset references to real URLs — sub-project 3. This
  spec defines the _shape_ of an asset reference in props but treats resolution as already done
  (an `Image` prop receives a plain URL string).
- Per-profession template content — sub-project 5.
- The publish route / persistence API — sub-project 6. This spec is DB-agnostic; `PortfolioPage`
  is just a JSON value that some future API route will read/write.

## Package layout

New spoke package, following the `recipes`/`job-search` convention:

```
packages/portfolio-builder/
├── package.json                # @true-tech-team/portfolio-builder, private, main/types -> src/index.ts
└── src/
    ├── index.ts                 # public exports only
    ├── schema/
    │   ├── types.ts             # PortfolioPage, PageSection, SectionRow, GridItem, ComponentType
    │   └── validate.ts          # runtime validation (zod) for a loaded PortfolioPage
    ├── grid/
    │   ├── responsive.ts        # pure span-collapsing function + unit tests
    │   └── Grid.module.scss     # shared row/item CSS (12-col, media-query breakpoint switch)
    ├── components/
    │   ├── registry.ts          # ComponentType -> { component, propSchema }
    │   ├── primitives/          # custom: Heading, Text, Image, Spacer
    │   └── (re-exports/wrappers around react-components where prop-shaping is needed)
    └── render/
        ├── PageRenderer.tsx
        ├── NavBar.tsx            # derived from sections, not part of the schema tree
        ├── SectionRenderer.tsx
        ├── RowRenderer.tsx
        └── ItemRenderer.tsx
```

`next.config.js` gets `@true-tech-team/portfolio-builder` added to `transpilePackages`. No routes
or API wiring are added to `src/app` in this sub-project — there is no page to visit yet, only a
library other sub-projects (and their tests/storybook-style fixtures) consume.

## Data schema

```ts
interface PortfolioPage {
  schemaVersion: 1;
  slug: string;
  title: string;
  templateId: string;
  themeId?: string; // preset id, if unmodified from a sub-project-2 preset
  themeOverride?: ThemeOverride; // from @true-tech-team/react-components
  showNav: boolean;
  sections: PageSection[];
}

interface PageSection {
  id: string; // stable id; used as the scroll-anchor (#id) and dedupe key
  name: string; // display name; becomes the nav label when showInNav is true
  showInNav: boolean;
  background?: 'primary' | 'secondary' | 'tertiary' | 'transparent';
  rows: SectionRow[];
}

interface SectionRow {
  id: string;
  items: GridItem[]; // sum of item.span must be <= 12; validated, not enforced at the type level
}

interface GridItem {
  id: string;
  component: ComponentType;
  span: number; // 1-12, desktop-authored width
  props: Record<string, unknown>; // shape depends on `component`; validated against its propSchema
}

type ComponentType =
  | 'heading'
  | 'text'
  | 'image'
  | 'spacer' // custom primitives
  | 'card'
  | 'badge'
  | 'avatar'
  | 'chip'
  | 'pill'
  | 'icon'
  | 'statusIndicator'
  | 'progressBar'
  | 'circularProgress'
  | 'kpi'
  | 'countUp'
  | 'reveal'
  | 'collapse'
  | 'flipCard'
  | 'carousel'
  | 'overflowText'
  | 'truncatedList'
  | 'button'
  | 'iconButton'
  | 'accordion'
  | 'tabs'; // react-components wrappers
```

Notes:

- The navbar is **not** part of this tree. It's derived at render time from
  `sections.filter(s => s.showInNav)` — this matches the earlier decision that the nav is fixed
  page chrome, not a placeable/deletable item.
- `themeOverride`/`themeId` are typed against sub-project 2's eventual preset registry, but this
  spec only depends on the existing `ThemeOverride` type, which already exists in
  `react-components` today.
- Row-level span-sum validity (≤12) is a runtime validation concern (`schema/validate.ts`), not a
  type-level constraint — TypeScript can't express that, and the editor (sub-project 4) is
  responsible for never producing an invalid row in the first place.

## Grid & responsive model

Sections are lists of rows; rows are lists of items whose spans sum to ≤12 (Bootstrap-style, per
the approved design). Responsive collapsing is **fully automatic** and computed once per item as a
pure function — no client-side breakpoint detection, no per-breakpoint authoring:

```ts
function collapsedSpans(span: number): { desktop: number; tablet: number; mobile: number } {
  return {
    desktop: span,
    tablet: span <= 6 ? 6 : 12,
    mobile: 12,
  };
}
```

The renderer emits all three as CSS custom properties on the item wrapper
(`--span-desktop`, `--span-tablet`, `--span-mobile`), and `Grid.module.scss` picks the active one
via media queries:

```scss
.row {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--spacing-md);
}
.item {
  grid-column: span var(--span-mobile);
}
@media (min-width: 768px) {
  .item {
    grid-column: span var(--span-tablet);
  }
}
@media (min-width: 1024px) {
  .item {
    grid-column: span var(--span-desktop);
  }
}
```

This makes every published page correct on first paint with zero layout JS, and the exact same
CSS module drives both the published page and the editor's live preview (sub-project 4), so there
is only one responsive implementation to maintain.

## Component registry & custom components required

The registry maps each `ComponentType` to a React component and a prop-validation schema. Directly
reusable from `@true-tech-team/react-components` (no wrapping beyond prop-shape adaptation):
`Card`, `Badge`, `Avatar`, `Chip`, `Pill`, `Icon`, `StatusIndicator`, `ProgressBar`,
`CircularProgress`, `KPI`, `CountUp`, `Reveal`, `Collapse`, `FlipCard`, `Carousel`,
`OverflowText`, `TruncatedList`, `Button`, `IconButton`, `Accordion`, `Tabs`.

**Must be custom-built for this package** (confirmed gap — the library has no equivalent):

- `Heading` / `Text` — generic typographic primitives (size/weight/color driven by theme tokens).
- `Image` — displays a resolved URL (sub-project 3 fills in how that URL is obtained) with
  alt text, object-fit, and optional rounded/border-radius theme token.
- `Spacer` — empty block of configurable height, for manual vertical rhythm control.
- The `Row`/`Section` grid wrapper components themselves (the CSS described above) — the library
  has generic layout helpers (`AdaptiveGrid`, `MasonryLayout`, `ResponsiveStack`) but nothing that
  does constrained 12-col placement with per-breakpoint spans.
- `NavBar` — derived-from-sections, smooth-scroll nav; the library's `Navbar` component exists but
  expects manually-supplied nav items, not section-derived + smooth-scroll-anchor behavior, so this
  needs a thin wrapper around it.

Everything else (buttons linking out, badges, avatars, etc.) is the library component used as-is.

## Renderer architecture

```
PageRenderer(page)
├── NavBar            — derived from page.sections, not from the schema tree directly
└── SectionRenderer[]  — one per page.sections[i]
    └── RowRenderer[]  — one per section.rows[i]
        └── ItemRenderer[] — one per row.items[i]
```

`ItemRenderer` looks up `item.component` in the registry, validates `item.props` against that
component's schema, and renders the component. If the component type is unknown (e.g., a page was
saved against a registry that has since removed a type) or prop validation fails, it renders a
neutral empty placeholder rather than throwing — a saved page must never hard-crash the renderer
when the registry changes later. This failure mode is asserted directly in tests.

## Testing

- Unit tests for `collapsedSpans` (boundary values: 1, 6, 7, 12).
- Unit tests for `validate.ts` (valid page passes; row spans summing >12 fails; unknown
  `ComponentType` fails at the item level but is still handled gracefully by the renderer for
  data that predates a stricter validator).
- React Testing Library tests rendering a fixture `PortfolioPage` and asserting: correct
  section/row/item DOM structure; `NavBar` contains exactly the sections with `showInNav: true`,
  in order, each with a matching `href="#<id>"`; an item with an unknown `component` value renders
  the placeholder instead of throwing.

## Open items carried to later sub-projects

- Exact `propSchema` per component (what props each accepts) will be filled in incrementally as
  sub-project 4 (editor) and 5 (templates) need each one — this spec defines the registry
  _mechanism_, not every component's final prop list.
- How `Image`'s URL is obtained (upload, resize, CDN) is entirely sub-project 3's concern.
