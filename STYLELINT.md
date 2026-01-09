# Stylelint Setup - CSS Variables Validation

This project uses Stylelint to ensure CSS variables used in style files are properly defined in the theme system.

## Quick Start

### Lint all style files
```bash
npm run lint:styles
```

### Auto-fix issues
```bash
npm run lint:styles:fix
```

## The Rule: `true-tech/css-variables-in-theme`

This custom rule validates that all CSS variables referenced with `var()` are either:
1. Defined in the theme files, **OR**
2. Defined locally within the same file where they're being used

### Theme Files Location
All CSS variables must be defined in:
```
libs/ui-components/src/lib/styles/theme/
├── _colors.scss          (Color palette: --color-red-500, etc.)
├── _variables.scss       (Core variables: --spacing-*, --font-*, etc.)
├── _light-theme.scss     (Light theme: --theme-primary, etc.)
└── _dark-theme.scss      (Dark theme: --theme-primary, etc.)
```

## Examples

### ✅ Valid - Variables defined in theme
```scss
.button {
  background: var(--theme-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  color: var(--theme-text-on-primary);
  transition: var(--transition-normal);
}
```

### ✅ Valid - Component-specific variables defined locally
```scss
.button {
  /* Define component-specific variables */
  --button-gap: 8px;
  --button-height: 40px;
  --button-bg: var(--theme-surface-primary);  /* Can reference theme vars */

  /* Use them in the same file */
  gap: var(--button-gap);           /* ✅ Defined locally */
  height: var(--button-height);     /* ✅ Defined locally */
  background: var(--button-bg);     /* ✅ Defined locally */
}

.button-icon {
  /* Can use variables defined anywhere in the same file */
  gap: var(--button-gap);           /* ✅ Defined earlier in this file */
}
```

### ❌ Invalid - Variables not in theme or current file
```scss
.button {
  background: var(--custom-bg);         /* Error: not defined anywhere */
  padding: var(--my-spacing);           /* Error: not defined anywhere */
}
```

### Error Message
```
CSS variable "--custom-bg" is not defined in the theme files (libs/ui-components/src/lib/styles/theme/) or in the current file
```

## Available Theme Variables

### Spacing
- `--spacing-xs` through `--spacing-xxl`
- Based on 4px grid system

### Typography
- Font sizes: `--font-size-xs` through `--font-size-4xl`
- Font weights: `--font-weight-light` through `--font-weight-bold`
- Line heights: `--line-height-tight`, `--line-height-normal`, `--line-height-relaxed`

### Colors - Theme Tokens
- Primary: `--theme-primary`, `--theme-primary-hover`, `--theme-primary-active`, etc.
- Secondary: `--theme-secondary`, `--theme-secondary-hover`, etc.
- Semantic: `--theme-success`, `--theme-warning`, `--theme-error`, `--theme-info`
- Text: `--theme-text-primary`, `--theme-text-secondary`, `--theme-text-tertiary`
- Backgrounds: `--theme-background-primary`, `--theme-background-secondary`, etc.
- Surfaces: `--theme-surface-primary`, `--theme-surface-secondary`, etc.
- Borders: `--theme-border-primary`, `--theme-border-focus`

### Colors - Palette
- 34+ color families with 9 shades each (50-900)
- Examples: `--color-red-500`, `--color-blue-600`, `--color-green-400`

### Border Radius
- `--radius-none`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-full`

### Transitions
- `--transition-fast`, `--transition-normal`, `--transition-slow`

### Z-Index
- `--z-dropdown`, `--z-sticky`, `--z-fixed`, `--z-modal`, `--z-popover`, `--z-tooltip`

## Adding New Variables

To add a new CSS variable:

1. Add it to the appropriate theme file in `libs/ui-components/src/lib/styles/theme/`
2. The linter will automatically recognize it
3. No configuration changes needed

## Disabling the Rule

### For a file
```scss
/* stylelint-disable true-tech/css-variables-in-theme */
.my-class {
  color: var(--custom-variable);
}
/* stylelint-enable true-tech/css-variables-in-theme */
```

### For a line
```scss
.my-class {
  /* stylelint-disable-next-line true-tech/css-variables-in-theme */
  color: var(--custom-variable);
}
```

## Benefits

✅ **Catch typos early** - Misspelled variable names are caught at lint time
✅ **Enforce consistency** - Theme variables ensure design system consistency
✅ **Component flexibility** - Local variables allow component-specific customization
✅ **Better DX** - Immediate feedback in your editor/CI pipeline
✅ **Maintainability** - Easy to track which variables are actually used
✅ **Refactoring safety** - Know which variables can be safely removed

## Configuration

The Stylelint configuration is in [.stylelintrc.json](.stylelintrc.json).

The custom plugin code is in [.stylelint/](.stylelint/):
- `css-variables-plugin.js` - The Stylelint plugin implementation
- `extract-theme-vars.js` - Utility to extract variables from theme files
- `README.md` - Technical documentation
- `test-example.scss` - Example test file

## Integration with CI/CD

Add to your CI pipeline:

```yaml
- name: Lint styles
  run: npm run lint:styles
```

## Troubleshooting

### "Variable is not defined" but it exists in theme
- Check the variable name spelling (including hyphens)
- Ensure the theme file is in `libs/ui-components/src/lib/styles/theme/`
- Verify the variable is defined with `:root` or `:root[data-theme='...']`

### Plugin not working
- Ensure Stylelint is installed: `npm list stylelint`
- Check `.stylelintrc.json` has the plugin listed
- Try clearing cache: `rm -rf node_modules/.cache`

## Resources

- [Stylelint Documentation](https://stylelint.io/)
- [Custom Plugin README](.stylelint/README.md)
- [Theme Files](libs/ui-components/src/lib/styles/theme/)
