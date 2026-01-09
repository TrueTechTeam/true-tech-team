# Common Commands and Workflows

This guide contains frequently used commands and workflows for the True Tech Team component library.

## Quick Reference

```bash
# Install dependencies
npm install

# Development
nx storybook ui-components         # Start Storybook dev server
nx test ui-components --watch      # Run tests in watch mode

# Building
nx build ui-components             # Build production bundle
nx lint ui-components              # Run ESLint

# Testing
nx test ui-components              # Run all tests
nx test ui-components --coverage   # Run with coverage report

# Storybook
nx build-storybook ui-components   # Build static Storybook

# Utility
nx graph                           # View project dependency graph
nx reset                           # Clear Nx cache
```

## Development Workflow

### Starting Development

```bash
# 1. Install dependencies
npm install

# 2. Start Storybook for component development
nx storybook ui-components

# 3. In another terminal, run tests in watch mode
nx test ui-components --watch
```

Storybook will open at `http://localhost:6006`

### Working on a Component

1. **Create component files** (see [component-guide.md](./component-guide.md)):
   ```bash
   mkdir libs/ui-components/src/lib/components/ComponentName
   cd libs/ui-components/src/lib/components/ComponentName
   # Create: Component.tsx, Component.module.scss, Component.test.tsx, Component.stories.tsx, index.ts
   ```

2. **Implement component**:
   - Write TypeScript component
   - Add SCSS styles
   - Write unit tests
   - Create Storybook stories

3. **Test in Storybook**:
   - View in browser at `http://localhost:6006`
   - Test light/dark themes with toolbar switcher
   - Verify all variants and sizes

4. **Run tests**:
   ```bash
   nx test ui-components --testFile=ComponentName.test.tsx
   ```

5. **Update exports**:
   - Add to `libs/ui-components/src/lib/components/index.ts`
   - Export from main `libs/ui-components/src/index.ts`

### Making Changes to Existing Components

1. **Find the component**:
   ```bash
   # Example: Button component
   cd libs/ui-components/src/lib/components/Button
   ```

2. **Make changes**:
   - Edit `Button.tsx`, `Button.module.scss`, etc.

3. **Update tests**:
   - Modify `Button.test.tsx` to cover new behavior

4. **Verify in Storybook**:
   - Check existing stories still work
   - Add new stories if needed

5. **Run tests**:
   ```bash
   nx test ui-components --testFile=Button.test.tsx
   ```

## Testing Workflows

### Run All Tests

```bash
nx test ui-components
```

### Run Specific Test File

```bash
nx test ui-components --testFile=Button.test.tsx
```

### Run Tests in Watch Mode

```bash
nx test ui-components --watch
```

### Run Tests with Coverage

```bash
nx test ui-components --coverage
```

Coverage report is generated in `coverage/libs/ui-components/`

Open `coverage/libs/ui-components/lcov-report/index.html` in browser.

### Update Snapshots

```bash
nx test ui-components --updateSnapshot
```

### Run Tests for Changed Files Only

```bash
nx affected:test
```

## Building

### Build Library

```bash
nx build ui-components
```

Output is in `dist/libs/ui-components/`:
- `index.mjs` - ESM bundle
- `index.d.ts` - TypeScript declarations
- `style.css` - Styles

### Build with Verbose Output

```bash
nx build ui-components --verbose
```

### Clean Build

```bash
# Clear cache and build
nx reset
nx build ui-components
```

## Linting and Formatting

### Run ESLint

```bash
# Lint all files
nx lint ui-components

# Lint and auto-fix
nx lint ui-components --fix
```

### Format with Prettier

```bash
# Format all files (if configured)
npx prettier --write "libs/ui-components/**/*.{ts,tsx,scss,json,md}"
```

### Lint Staged Files

```bash
# Only lint changed files
nx affected:lint
```

## Storybook

### Start Development Server

```bash
nx storybook ui-components
```

Opens at `http://localhost:6006`

### Build Static Storybook

```bash
nx build-storybook ui-components
```

Output is in `dist/storybook/ui-components/`

### Preview Static Build

```bash
# Build first
nx build-storybook ui-components

# Serve with any static server
npx http-server dist/storybook/ui-components
```

## Theme Development

### Testing Themes

1. **In Storybook**:
   - Use theme switcher in toolbar
   - Toggle between light and dark

2. **Manual testing**:
   ```typescript
   // In browser console
   document.documentElement.setAttribute('data-theme', 'dark');
   document.documentElement.setAttribute('data-theme', 'light');
   ```

### Adding New Theme Colors

1. **Add color primitive** to [_colors.scss](../libs/ui-components/src/lib/styles/theme/_colors.scss):
   ```scss
   --color-brand-500: #ff0000;
   ```

2. **Add semantic token** to both theme files:
   ```scss
   // _light-theme.scss
   --theme-brand: var(--color-brand-600);

   // _dark-theme.scss
   --theme-brand: var(--color-brand-500);
   ```

3. **Update TypeScript types** in [theme.types.ts](../libs/ui-components/src/lib/types/theme.types.ts)

4. **Test in Storybook**

### Modifying Design Tokens

Edit [_variables.scss](../libs/ui-components/src/lib/styles/theme/_variables.scss):

```scss
// Example: Change spacing scale
$spacing-unit: 4px;  // Change to 8px for larger spacing

// Example: Add new shadow
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

Rebuild to see changes:
```bash
nx build ui-components
```

## Type Checking

### Check Types

```bash
# Check TypeScript types
npx tsc --noEmit -p libs/ui-components/tsconfig.json
```

### Generate Type Declarations

Type declarations are automatically generated during build:

```bash
nx build ui-components
# Creates dist/libs/ui-components/index.d.ts
```

## Dependency Management

### Install New Dependency

```bash
# For library (production dependency)
npm install <package> --workspace=@true-tech-team/ui-components

# For development
npm install -D <package>
```

### Update Dependencies

```bash
# Update all Nx packages
npx nx migrate latest

# Install updated packages
npm install

# Run migrations
npx nx migrate --run-migrations
```

### Check for Outdated Packages

```bash
npm outdated
```

## Git Workflows

### Create Feature Branch

```bash
git checkout -b feature/component-name
```

### Commit Changes

```bash
git add .
git commit -m "feat(ui-components): add ComponentName component"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance

### Push and Create PR

```bash
git push origin feature/component-name
# Create PR on GitHub
```

## Troubleshooting

### Clear Nx Cache

```bash
nx reset
```

### Clear Node Modules and Reinstall

```bash
# Windows PowerShell
Remove-Item -Recurse -Force node_modules
npm install

# Bash
rm -rf node_modules
npm install
```

### Fix Peer Dependency Issues

```bash
npm install --legacy-peer-deps
```

### Rebuild Everything

```bash
# Clear cache
nx reset

# Clean dist
Remove-Item -Recurse -Force dist

# Reinstall
npm install

# Rebuild
nx build ui-components
```

### Debug Build Issues

```bash
# Build with verbose logging
nx build ui-components --verbose

# Check Vite config
cat libs/ui-components/vite.config.ts
```

### Debug Test Issues

```bash
# Run with verbose output
nx test ui-components --verbose

# Run single test file
nx test ui-components --testFile=Component.test.tsx --verbose

# Debug in VSCode
# Add breakpoint in test file and run "Debug Jest Tests"
```

### SCSS Module Type Errors

If you see "Cannot find module '*.module.scss'":

1. Check `libs/ui-components/src/globals.d.ts` exists:
   ```typescript
   declare module '*.module.scss' {
     const classes: { [key: string]: string };
     export default classes;
   }
   ```

2. Restart TypeScript server in VSCode:
   - `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### SVG Import Errors

If SVG imports fail:

1. Check `vite.config.ts` has svgr plugin:
   ```typescript
   import svgr from 'vite-plugin-svgr';

   plugins: [
     svgr({
       svgrOptions: { exportType: 'default', ref: true },
       include: '**/*.svg?react',
     }),
   ]
   ```

2. Import with `?react` suffix:
   ```typescript
   import Icon from './icon.svg?react';
   ```

## Nx Specific Commands

### View Project Graph

```bash
nx graph
```

Opens interactive dependency graph in browser.

### Run Affected Commands

```bash
# Only test affected projects
nx affected:test

# Only build affected projects
nx affected:build

# Only lint affected projects
nx affected:lint
```

### Show Project Configuration

```bash
nx show project ui-components
```

### List All Targets

```bash
nx show project ui-components --web
```

## CI/CD Commands

### Commands for CI Pipeline

```bash
# Install dependencies
npm ci

# Run linter
nx lint ui-components

# Run tests with coverage
nx test ui-components --coverage --ci

# Build library
nx build ui-components

# Build Storybook
nx build-storybook ui-components
```

### GitHub Actions Example

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: nx lint ui-components
      - run: nx test ui-components --coverage --ci
      - run: nx build ui-components
```

## Publishing (Future)

### Prepare for Publishing

1. **Update version** in `libs/ui-components/package.json`:
   ```json
   {
     "version": "1.0.0"
   }
   ```

2. **Build**:
   ```bash
   nx build ui-components
   ```

3. **Test locally**:
   ```bash
   cd dist/libs/ui-components
   npm pack
   # Test the .tgz file in another project
   ```

### Publish to npm (When Ready)

```bash
# Login to npm
npm login

# Publish
cd dist/libs/ui-components
npm publish --access public

# Or with tag
npm publish --access public --tag beta
```

## Useful VSCode Tasks

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Storybook",
      "type": "shell",
      "command": "nx storybook ui-components",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Test Watch",
      "type": "shell",
      "command": "nx test ui-components --watch",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Build",
      "type": "shell",
      "command": "nx build ui-components",
      "problemMatcher": ["$tsc"],
      "group": {
        "kind": "build",
        "isDefault": true
      }
    }
  ]
}
```

Run tasks with `Ctrl+Shift+B` (Windows) or `Cmd+Shift+B` (Mac).

## Performance Optimization

### Analyze Bundle Size

```bash
# Build and analyze
nx build ui-components --stats-json

# Use a bundle analyzer
npx vite-bundle-visualizer dist/libs/ui-components
```

### Check Build Performance

```bash
# Build with timing
time nx build ui-components

# Or on Windows PowerShell
Measure-Command { nx build ui-components }
```

## Documentation

### Generate Component Documentation

Component documentation is automatically generated from:
- JSDoc comments in TypeScript
- Storybook stories
- README files

### Update README

Edit [libs/ui-components/README.md](../libs/ui-components/README.md) with:
- Installation instructions
- Usage examples
- API documentation
- Contributing guidelines

## Additional Resources

- [project-overview.md](./project-overview.md) - Project architecture
- [component-guide.md](./component-guide.md) - Creating components
- [theme-guide.md](./theme-guide.md) - Theme system
- [testing-guide.md](./testing-guide.md) - Testing patterns
- [Nx Documentation](https://nx.dev)
- [Vite Documentation](https://vitejs.dev)
- [Storybook Documentation](https://storybook.js.org)

## Getting Help

### Check Logs

```bash
# Nx logs
cat .nx/cache/*.log

# Build logs
nx build ui-components --verbose 2>&1 | tee build.log
```

### Common Issues

1. **Port already in use**: Change Storybook port in `project.json`
2. **TypeScript errors**: Restart TS server in VSCode
3. **Module not found**: Check imports and file paths
4. **Tests failing**: Clear Jest cache: `nx test ui-components --clearCache`
5. **Build errors**: Clear Nx cache: `nx reset`

### Report Issues

If you encounter bugs or issues:
1. Check existing issues on GitHub
2. Create new issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment info (Node version, OS, etc.)
   - Error messages and logs
