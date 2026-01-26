#!/usr/bin/env node

/**
 * Combine Next.js landing app and Storybook builds for Netlify deployment.
 *
 * This script:
 * 1. Copies the Next.js static export to dist/netlify
 * 2. Copies the Storybook build to dist/netlify/storybook
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const NETLIFY_OUTPUT = path.join(ROOT_DIR, 'dist', 'netlify');
const LANDING_APP_OUTPUT = path.join(ROOT_DIR, 'libs', 'landing-app', 'out');
const STORYBOOK_OUTPUT = path.join(ROOT_DIR, 'dist', 'storybook', 'ui-components');

/**
 * Recursively copy a directory
 */
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source directory does not exist: ${src}`);
    process.exit(1);
  }

  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Remove a directory recursively
 */
function rmDirSync(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

console.log('🚀 Combining builds for Netlify deployment...\n');

// Clean previous build
console.log('🧹 Cleaning previous Netlify build...');
rmDirSync(NETLIFY_OUTPUT);

// Check if landing app output exists
if (!fs.existsSync(LANDING_APP_OUTPUT)) {
  console.error(`❌ Landing app output not found at: ${LANDING_APP_OUTPUT}`);
  console.error('   Make sure to run "nx build landing-app" with static export enabled.');
  process.exit(1);
}

// Check if storybook output exists
if (!fs.existsSync(STORYBOOK_OUTPUT)) {
  console.error(`❌ Storybook output not found at: ${STORYBOOK_OUTPUT}`);
  console.error('   Make sure to run "nx build-storybook ui-components".');
  process.exit(1);
}

// Copy landing app
console.log('📦 Copying landing app...');
copyDirSync(LANDING_APP_OUTPUT, NETLIFY_OUTPUT);
console.log(`   ✅ Landing app copied to ${NETLIFY_OUTPUT}`);

// Copy storybook to /storybook subdirectory
console.log('📚 Copying Storybook...');
const storybookDest = path.join(NETLIFY_OUTPUT, 'storybook');
copyDirSync(STORYBOOK_OUTPUT, storybookDest);
console.log(`   ✅ Storybook copied to ${storybookDest}`);

console.log('\n✨ Build combination complete!');
console.log(`   Output directory: ${NETLIFY_OUTPUT}`);
console.log('   - Landing app: /');
console.log('   - Storybook: /storybook');
