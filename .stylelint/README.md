# Stylelint CSS Variables Plugin

This directory contains a custom Stylelint plugin that validates CSS variable usage in the project.

## Overview

The `css-variables-in-theme` rule ensures that all CSS variables used in style files (`.scss`, `.css`) are either:
1. Defined in the theme files located at `libs/ui-components/src/lib/styles/theme/`, **OR**
2. Defined locally within the same file where they're being used

## Files

- **extract-theme-vars.js** - Utility script that extracts all CSS variable definitions from theme files
- **css-variables-plugin.js** - Custom Stylelint plugin that implements the validation rule

## How It Works

1. The plugin scans all theme files in `libs/ui-components/src/lib/styles/theme/` to build a list of valid theme CSS variables
2. It also scans the current file being linted to find any locally-defined CSS variables
3. It then checks all `var(--variable-name)` usages in your style files
4. If a CSS variable is used but not defined in either the theme files or the current file, it reports an error

## Usage

### Run the linter

```bash
npm run lint:styles
```

### Auto-fix issues (where possible)

```bash
npm run lint:styles:fix
```

### Example Error

If you use a CSS variable that doesn't exist in the theme or current file:

```scss
.my-class {
  color: var(--undefined-variable);  // ❌ Error
}
```

You'll see:

```
CSS variable "--undefined-variable" is not defined in the theme files (libs/ui-components/src/lib/styles/theme/) or in the current file
```

### Valid Usage

**Option 1: Use theme variables**

CSS variables from these theme files are always valid:

- `libs/ui-components/src/lib/styles/theme/_variables.scss`
- `libs/ui-components/src/lib/styles/theme/_light-theme.scss`
- `libs/ui-components/src/lib/styles/theme/_dark-theme.scss`
- `libs/ui-components/src/lib/styles/theme/_colors.scss`

```scss
.my-class {
  color: var(--theme-primary);          // ✅ Defined in theme
  padding: var(--spacing-md);           // ✅ Defined in theme
  border-radius: var(--radius-sm);      // ✅ Defined in theme
}
```

**Option 2: Define component-specific variables locally**

You can also define CSS variables within your component's style file:

```scss
.my-component {
  /* Define local CSS variables */
  --component-gap: 12px;
  --component-padding: 16px;
  --component-bg: var(--theme-surface-primary);  // ✅ Can reference theme vars

  /* Use them in the same file */
  gap: var(--component-gap);              // ✅ Defined locally
  padding: var(--component-padding);      // ✅ Defined locally
  background: var(--component-bg);        // ✅ Defined locally
}

.my-component-child {
  /* Can use variables defined anywhere in the same file */
  gap: var(--component-gap);              // ✅ Defined earlier in this file
}
```

## Benefits

- **Prevents typos** - Catches misspelled CSS variable names at lint time
- **Ensures consistency** - All CSS variables must come from the theme
- **Better DX** - Get immediate feedback when using undefined variables
- **Maintainability** - Makes it easy to track which variables are actually being used

## Configuration

The rule is configured in `.stylelintrc.json`:

```json
{
  "plugins": [
    "./.stylelint/css-variables-plugin.js"
  ],
  "rules": {
    "true-tech/css-variables-in-theme": true
  }
}
```

## Adding New CSS Variables

To add a new CSS variable to the project:

1. Add it to the appropriate theme file in `libs/ui-components/src/lib/styles/theme/`
2. The linter will automatically pick it up on the next run
3. No need to restart or reconfigure anything

## Disabling the Rule

If you need to disable the rule for a specific line or file:

```scss
/* stylelint-disable true-tech/css-variables-in-theme */
.my-class {
  color: var(--custom-variable);
}
/* stylelint-enable true-tech/css-variables-in-theme */
```

Or for a single line:

```scss
.my-class {
  /* stylelint-disable-next-line true-tech/css-variables-in-theme */
  color: var(--custom-variable);
}
```
