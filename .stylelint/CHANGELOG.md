# Stylelint Plugin Changelog

## Version 1.1.0 - File-Local Variables Support

### Added

- Support for file-local CSS variables (variables defined in the same file where they're used)
- The plugin now checks both theme files AND the current file for variable definitions
- Variables defined anywhere in the current file can be used throughout that file

### Changed

- Error message updated from:
  - Old: `CSS variable "--var" is not defined in the theme files (libs/ui-components/src/lib/styles/theme/)`
  - New: `CSS variable "--var" is not defined in the theme files (libs/ui-components/src/lib/styles/theme/) or in the current file`

### Technical Details

- Added file-local variable extraction before validation
- Variables are now validated against a combined set of theme variables + file-local variables
- Order of definition doesn't matter - a variable defined anywhere in the file can be used anywhere in that file

### Use Cases

This update enables component-specific CSS variables:

```scss
.component {
  /* Define component-specific variables */
  --component-gap: 8px;
  --component-padding: 16px;
  --component-bg: var(--theme-surface-primary);

  /* Use them in the same file */
  gap: var(--component-gap); /* ✅ Valid */
  padding: var(--component-padding); /* ✅ Valid */
  background: var(--component-bg); /* ✅ Valid */
}

.component-child {
  /* Can use variables from anywhere in the file */
  gap: var(--component-gap); /* ✅ Valid */
}
```

---

## Version 1.0.0 - Initial Release

### Added

- Custom Stylelint rule: `true-tech/css-variables-in-theme`
- Validation of CSS variables against theme files
- Support for theme files in `libs/ui-components/src/lib/styles/theme/`
- NPM scripts: `lint:styles` and `lint:styles:fix`
- Comprehensive documentation

### Features

- Validates all `var(--variable-name)` usage
- Checks against variables defined in theme files
- Prevents typos and undefined variable references
- Works with SCSS and CSS files
