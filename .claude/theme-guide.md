# Theme System Guide

This guide explains how the theme system works in the True Tech Team component library and how to customize it.

## Overview

The theme system is built on three key technologies:

1. **SCSS Variables**: Design tokens defined at build time
2. **CSS Custom Properties**: Runtime theme values that can change without re-rendering
3. **React Context**: Theme state management

## Architecture

```
Theme System
├── SCSS Variables (_variables.scss)
│   └── Design tokens: spacing, typography, shadows, etc.
├── Color Primitives (_colors.scss)
│   └── 370+ color variables (37 families × 10 shades)
├── Theme Mappings
│   ├── Light Theme (_light-theme.scss)
│   └── Dark Theme (_dark-theme.scss)
├── React Context (ThemeContext.tsx)
│   └── Theme mode state management
└── Global Provider (GlobalProvider.tsx)
    └── Applies theme to document root
```

## Color System

### Color Primitives

**370+ CSS variables** organized by color family and shade:

```scss
// Pattern: --color-{family}-{shade}
--color-blue-50: #eff6ff;
--color-blue-100: #dbeafe;
--color-blue-200: #bfdbfe;
--color-blue-300: #93c5fd;
--color-blue-400: #60a5fa;
--color-blue-500: #3b82f6;  // Base shade
--color-blue-600: #2563eb;
--color-blue-700: #1d4ed8;
--color-blue-800: #1e40af;
--color-blue-900: #1e3a8a;
```

### Color Families (37 total)

**Neutrals**:
- `white`, `black`
- `gray`, `slate`, `zinc`, `stone`
- `warm-gray`, `cool-gray`, `blue-gray`, `true-gray`

**Primary Colors**:
- `red`, `orange`, `amber`, `yellow`, `lime`
- `green`, `emerald`, `teal`, `cyan`, `blue`
- `indigo`, `violet`, `purple`, `fuchsia`
- `pink`, `rose`

**Extended Palette**:
- `brown`, `sky`, `mint`, `olive`
- And more...

### Semantic Tokens

Map color primitives to semantic meaning that changes per theme:

**Light Theme** ([_light-theme.scss](../libs/ui-components/src/lib/styles/theme/_light-theme.scss)):

```scss
:root[data-theme='light'],
:root {
  // Primary colors
  --theme-primary: var(--color-blue-600);
  --theme-primary-hover: var(--color-blue-700);
  --theme-primary-active: var(--color-blue-800);

  // Secondary colors
  --theme-secondary: var(--color-gray-600);
  --theme-secondary-hover: var(--color-gray-700);

  // Background colors
  --theme-background-primary: var(--color-white);
  --theme-background-secondary: var(--color-gray-50);
  --theme-background-tertiary: var(--color-gray-100);

  // Text colors
  --theme-text-primary: var(--color-gray-900);
  --theme-text-secondary: var(--color-gray-700);
  --theme-text-tertiary: var(--color-gray-500);
  --theme-text-on-primary: var(--color-white);

  // Border colors
  --theme-border-primary: var(--color-gray-300);
  --theme-border-secondary: var(--color-gray-200);

  // Status colors
  --theme-success: var(--color-green-600);
  --theme-warning: var(--color-amber-600);
  --theme-error: var(--color-red-600);
  --theme-info: var(--color-blue-600);
}
```

**Dark Theme** ([_dark-theme.scss](../libs/ui-components/src/lib/styles/theme/_dark-theme.scss)):

```scss
:root[data-theme='dark'] {
  // Primary colors (slightly lighter for better contrast)
  --theme-primary: var(--color-blue-500);
  --theme-primary-hover: var(--color-blue-400);
  --theme-primary-active: var(--color-blue-300);

  // Background colors (dark)
  --theme-background-primary: var(--color-gray-900);
  --theme-background-secondary: var(--color-gray-800);
  --theme-background-tertiary: var(--color-gray-700);

  // Text colors (light)
  --theme-text-primary: var(--color-gray-100);
  --theme-text-secondary: var(--color-gray-300);
  --theme-text-tertiary: var(--color-gray-500);
  --theme-text-on-primary: var(--color-white);

  // Border colors
  --theme-border-primary: var(--color-gray-700);
  --theme-border-secondary: var(--color-gray-800);

  // Status colors
  --theme-success: var(--color-green-500);
  --theme-warning: var(--color-amber-500);
  --theme-error: var(--color-red-500);
  --theme-info: var(--color-blue-500);
}
```

## Design Tokens

### Spacing

Based on a **4px grid system** ([_variables.scss](../libs/ui-components/src/lib/styles/theme/_variables.scss)):

```scss
$spacing-unit: 4px;

// Named spacing
$spacing-xs: 4px;    // 1 unit
$spacing-sm: 8px;    // 2 units
$spacing-md: 16px;   // 4 units
$spacing-lg: 24px;   // 6 units
$spacing-xl: 32px;   // 8 units
$spacing-xxl: 48px;  // 12 units

// CSS variables
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-xxl: 48px;
```

### Typography

```scss
// Font families
--font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;

// Font sizes
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--font-size-2xl: 24px;
--font-size-3xl: 30px;
--font-size-4xl: 36px;

// Font weights
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

// Line heights
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

### Border Radius

```scss
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

### Shadows

```scss
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### Z-Index Scale

```scss
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
```

## Using the Theme System

### 1. Setting Up GlobalProvider

Wrap your app with `GlobalProvider` at the root:

```typescript
import { GlobalProvider } from '@true-tech-team/ui-components';
import '@true-tech-team/ui-components/style.css';

function App() {
  return (
    <GlobalProvider themeConfig={{ mode: 'light' }}>
      {/* Your app */}
    </GlobalProvider>
  );
}
```

### 2. Using the Theme Hook

Access and control theme from any component:

```typescript
import { useTheme } from '@true-tech-team/ui-components';

function ThemeToggle() {
  const { mode, setMode, toggleMode } = useTheme();

  return (
    <div>
      <p>Current theme: {mode}</p>
      <button onClick={toggleMode}>
        Switch to {mode === 'light' ? 'dark' : 'light'}
      </button>
      <button onClick={() => setMode('dark')}>Dark</button>
      <button onClick={() => setMode('light')}>Light</button>
    </div>
  );
}
```

### 3. Using Theme Variables in Components

**In SCSS**:

```scss
.myComponent {
  // Use semantic tokens (recommended)
  background: var(--theme-background-primary);
  color: var(--theme-text-primary);
  border: 1px solid var(--theme-border-primary);

  // Or use color primitives directly
  color: var(--color-blue-600);

  // Dark mode is automatic
  // No need for [data-theme='dark'] selectors
}
```

**In TypeScript/JSX**:

```tsx
function MyComponent() {
  return (
    <div
      style={{
        backgroundColor: 'var(--theme-background-primary)',
        color: 'var(--theme-text-primary)',
      }}
    >
      Content
    </div>
  );
}
```

### 4. Theme Overrides

Override theme values at runtime:

```typescript
<GlobalProvider
  themeConfig={{
    mode: 'dark',
    theme: {
      // Override specific tokens
      '--theme-primary': '#ff0000',
      '--theme-background-primary': '#1a1a1a',
    },
  }}
>
  {/* App */}
</GlobalProvider>
```

### 5. Component-Level Customization

Components expose CSS variables for customization:

```tsx
import { Button } from '@true-tech-team/ui-components';

<Button
  style={{
    '--button-bg': 'var(--color-purple-600)',
    '--button-text': 'var(--color-white)',
    '--button-radius': '20px',
  } as React.CSSProperties}
>
  Custom Button
</Button>
```

## Creating Custom Themes

### Option 1: Extend Existing Themes

Create a new SCSS file:

```scss
// custom-theme.scss
@import '@true-tech-team/ui-components/lib/styles/theme/light-theme';

:root[data-theme='custom'] {
  // Override tokens
  --theme-primary: var(--color-purple-600);
  --theme-secondary: var(--color-pink-600);
  --theme-background-primary: var(--color-gray-50);
}
```

Import in your app:

```typescript
import './custom-theme.scss';

<GlobalProvider themeConfig={{ mode: 'custom' }}>
```

### Option 2: Runtime Overrides

```typescript
const customTheme = {
  '--theme-primary': '#8b5cf6',
  '--theme-primary-hover': '#7c3aed',
  '--theme-background-primary': '#fafafa',
  '--theme-text-primary': '#1a1a1a',
  // ... more overrides
};

<GlobalProvider themeConfig={{ mode: 'light', theme: customTheme }}>
```

### Option 3: Brand-Specific Themes

Create multiple theme files:

```scss
// brand-a-theme.scss
:root[data-theme='brand-a'] {
  --theme-primary: var(--color-blue-600);
  // ... brand A colors
}

// brand-b-theme.scss
:root[data-theme='brand-b'] {
  --theme-primary: var(--color-red-600);
  // ... brand B colors
}
```

Switch themes:

```typescript
const { setMode } = useTheme();
setMode('brand-a');
```

## Utility Classes

### Spacing Utilities

Generated from 0 to 20 (0px to 80px in 4px increments):

**Margin**:
```html
<div class="m-4">   <!-- margin: 16px -->
<div class="mt-2">  <!-- margin-top: 8px -->
<div class="mb-6">  <!-- margin-bottom: 24px -->
<div class="mx-3">  <!-- margin-left: 12px; margin-right: 12px -->
<div class="my-5">  <!-- margin-top: 20px; margin-bottom: 20px -->
```

**Padding**:
```html
<div class="p-4">   <!-- padding: 16px -->
<div class="pt-2">  <!-- padding-top: 8px -->
<div class="px-6">  <!-- padding-left: 24px; padding-right: 24px -->
```

### Flexbox Utilities

```html
<div class="flex">              <!-- display: flex -->
<div class="flex-col">          <!-- flex-direction: column -->
<div class="justify-center">   <!-- justify-content: center -->
<div class="justify-between">  <!-- justify-content: space-between -->
<div class="items-center">     <!-- align-items: center -->
<div class="gap-4">             <!-- gap: 16px -->
```

### Color Utilities

**Background colors**:
```html
<div class="bg-primary">    <!-- background: var(--theme-primary) -->
<div class="bg-secondary">  <!-- background: var(--theme-secondary) -->
<div class="bg-blue-500">   <!-- background: var(--color-blue-500) -->
```

**Text colors**:
```html
<div class="text-primary">   <!-- color: var(--theme-text-primary) -->
<div class="text-secondary"> <!-- color: var(--theme-text-secondary) -->
<div class="text-red-600">   <!-- color: var(--color-red-600) -->
```

## SCSS Mixins

### Spacing Mixins

Located in [libs/ui-components/src/lib/styles/mixins/_spacing.scss](../libs/ui-components/src/lib/styles/mixins/_spacing.scss):

```scss
@import '../../styles/mixins/spacing';

.component {
  @include px(4);   // padding-left: 16px; padding-right: 16px;
  @include py(2);   // padding-top: 8px; padding-bottom: 8px;
  @include p(3);    // padding: 12px;

  @include mx(4);   // margin-left: 16px; margin-right: 16px;
  @include my(2);   // margin-top: 8px; margin-bottom: 8px;
  @include m(3);    // margin: 12px;

  @include mt(2);   // margin-top: 8px;
  @include mb(4);   // margin-bottom: 16px;
  @include ml(1);   // margin-left: 4px;
  @include mr(3);   // margin-right: 12px;

  @include pt(2);   // padding-top: 8px;
  @include pb(4);   // padding-bottom: 16px;
  @include pl(1);   // padding-left: 4px;
  @include pr(3);   // padding-right: 12px;
}
```

### Reset Mixins

```scss
@import '../../styles/mixins/reset';

.button {
  @include button-reset;  // Removes default button styles
}

.list {
  @include list-reset;    // Removes default list styles
}
```

## Best Practices

### ✅ DO: Use Semantic Tokens

```scss
// Good: Uses semantic tokens that adapt to theme
.component {
  background: var(--theme-background-primary);
  color: var(--theme-text-primary);
  border: 1px solid var(--theme-border-primary);
}
```

### ❌ DON'T: Hardcode Colors

```scss
// Bad: Hardcoded colors don't adapt to theme
.component {
  background: #ffffff;
  color: #000000;
  border: 1px solid #cccccc;
}
```

### ✅ DO: Use Color Primitives for Brand Colors

```scss
// Good: When you need a specific color regardless of theme
.brandLogo {
  color: var(--color-blue-600);  // Always blue
}
```

### ✅ DO: Provide Fallbacks

```scss
.component {
  // Provide fallback if custom property isn't set
  background: var(--component-bg, var(--theme-background-primary));
}
```

### ✅ DO: Use Spacing Units

```scss
// Good: Uses 4px grid
.component {
  @include px(4);   // 16px
  @include py(2);   // 8px
  gap: $spacing-md; // 16px
}

// Bad: Arbitrary values
.component {
  padding: 15px 17px;
  gap: 13px;
}
```

### ✅ DO: Define Component-Specific Variables

```scss
.button {
  // Define variables for customization
  background: var(--button-bg, var(--theme-primary));
  color: var(--button-text, var(--theme-text-on-primary));
  border-radius: var(--button-radius, var(--radius-md));
  padding: var(--button-padding, 8px 16px);
}
```

This allows users to customize:

```tsx
<Button
  style={{
    '--button-bg': '#custom',
    '--button-radius': '20px',
  }}
/>
```

## Dark Mode Best Practices

### Automatic Dark Mode

The theme system handles dark mode automatically. Just use semantic tokens:

```scss
.card {
  // Automatically adapts to dark mode
  background: var(--theme-background-primary);
  color: var(--theme-text-primary);
  box-shadow: var(--shadow-md);
}
```

### Testing Dark Mode

1. Use the theme toggle in your app
2. In Storybook, use the theme switcher toolbar
3. Test with system preferences: `prefers-color-scheme`

### Dark Mode Considerations

**Contrast**: Ensure sufficient contrast in both modes
- Light text on dark backgrounds
- Dark text on light backgrounds
- WCAG AA minimum: 4.5:1 for normal text

**Shadows**: Adjust shadow opacity
```scss
// Light mode
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);

// Dark mode
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
```

**Borders**: More prominent in dark mode
```scss
// Light mode
--theme-border-primary: var(--color-gray-300);

// Dark mode
--theme-border-primary: var(--color-gray-700);
```

## TypeScript Theme Types

Located in [libs/ui-components/src/lib/types/theme.types.ts](../libs/ui-components/src/lib/types/theme.types.ts):

```typescript
export type ThemeMode = 'light' | 'dark';

export type ColorFamily =
  | 'red' | 'orange' | 'amber' | 'yellow'
  | 'lime' | 'green' | 'emerald' | 'teal'
  | 'cyan' | 'blue' | 'indigo' | 'violet'
  | 'purple' | 'fuchsia' | 'pink' | 'rose'
  | 'gray' | 'slate' | 'zinc' | 'stone'
  | 'white' | 'black'
  // ... more families

export type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export interface ThemeConfig {
  mode?: ThemeMode;
  theme?: Record<string, string>;
}

export interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  themeOverride?: Record<string, string>;
  setThemeOverride: (override: Record<string, string>) => void;
}
```

## Theme Utilities

Located in [libs/ui-components/src/lib/utils/theme-utils.ts](../libs/ui-components/src/lib/utils/theme-utils.ts):

```typescript
import { getThemeValue, getColorValue } from '@true-tech-team/ui-components';

// Get current value of a CSS variable
const primaryColor = getThemeValue('--theme-primary');

// Get specific color value
const blue500 = getColorValue('blue', 500);

// Apply theme overrides programmatically
applyTheme({
  '--theme-primary': '#ff0000',
  '--theme-secondary': '#00ff00',
});
```

## Common Scenarios

### Scenario 1: Adding a New Semantic Token

1. Add to both theme files:

```scss
// _light-theme.scss
--theme-highlight: var(--color-yellow-200);

// _dark-theme.scss
--theme-highlight: var(--color-yellow-800);
```

2. Document in theme types:

```typescript
// theme.types.ts
export interface ThemeColorTokens {
  // ... existing
  highlight: string;
}
```

### Scenario 2: Adding a New Color Family

1. Add colors to `_colors.scss`:

```scss
--color-brand-50: #fff8f0;
--color-brand-100: #ffe8d5;
// ... through 900
```

2. Update TypeScript types:

```typescript
export type ColorFamily =
  | /* existing */
  | 'brand';
```

### Scenario 3: Creating Component Variants

```scss
.button {
  &--primary {
    --button-bg: var(--theme-primary);
  }

  &--success {
    --button-bg: var(--theme-success);
  }

  &--danger {
    --button-bg: var(--theme-error);
  }
}
```

## Additional Resources

- [project-overview.md](./project-overview.md) - Project architecture
- [component-guide.md](./component-guide.md) - Creating components
- [testing-guide.md](./testing-guide.md) - Testing patterns
- [CSS Variables MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Color contrast checker](https://webaim.org/resources/contrastchecker/)
