import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const protectedDir = join(process.cwd(), 'src', 'app', '(protected)');
// Comments are stripped so prose that merely mentions Header/Footer/ProjectGate cannot trip a guard.
const read = (...parts: string[]) =>
  readFileSync(join(protectedDir, ...parts), 'utf8').replace(/\/\/.*$/gm, '');
const CHROME = /components\/layout\/(Header|Footer)|ProjectGate/;

describe('portfolio preview route chrome', () => {
  it('is a sibling of portfolio-builder, not nested under its chrome layout', () => {
    expect(existsSync(join(protectedDir, 'portfolio-preview', 'page.tsx'))).toBe(true);
    expect(existsSync(join(protectedDir, 'portfolio-builder', 'preview'))).toBe(false);
  });

  it('has no (protected)-level layout that would wrap siblings in chrome', () => {
    expect(existsSync(join(protectedDir, 'layout.tsx'))).toBe(false);
  });

  it('its layout renders no Header, Footer or ProjectGate', () => {
    expect(read('portfolio-preview', 'layout.tsx')).not.toMatch(CHROME);
  });

  it('the app routes still render Header, Footer and ProjectGate', () => {
    const layout = read('portfolio-builder', 'layout.tsx');
    expect(layout).toMatch(/<Header \/>/);
    expect(layout).toMatch(/<Footer \/>/);
    expect(layout).toMatch(/<ProjectGate/);
  });
});
