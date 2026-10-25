import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Guards the server/client boundary that the section-type split exists to maintain.
 *
 * `schema/validate.ts` is reachable from server code and from `pages/crud.ts`, and
 * `render/SectionRenderer.tsx` reads `minHeight`/`chrome` off registry entries in the RSC layer.
 * If a `'use client'` module ever creeps back into these import closures, those property reads
 * break at request time - a failure neither `next build` (the route is dynamic) nor a jsdom test
 * (no RSC layer) can see. So assert it statically instead.
 */

const here = dirname(fileURLToPath(import.meta.url));

function resolveRelativeImport(fromFile: string, specifier: string): string | undefined {
  const base = resolve(dirname(fromFile), specifier);
  return [base, `${base}.ts`, `${base}.tsx`, resolve(base, 'index.ts')].find(
    (candidate) => existsSync(candidate) && candidate.match(/\.tsx?$/)
  );
}

/** Every local module reachable from `entry` through RUNTIME (non-type-only) imports. */
function runtimeImportClosure(entry: string): string[] {
  const seen = new Set<string>();
  const stack = [entry];

  while (stack.length > 0) {
    const file = stack.pop();
    if (!file || seen.has(file)) {
      continue;
    }
    seen.add(file);

    const source = readFileSync(file, 'utf8');
    // `import ... from './x'` and `export ... from './x'`, but NOT `import type`/`export type`,
    // which are erased at compile time and so cannot pull a client module into the bundle.
    const pattern = /^\s*(?:import|export)\s+(?!type\s)[^;]*?from\s+['"](\.[^'"]+)['"]/gm;
    for (const match of source.matchAll(pattern)) {
      const resolved = resolveRelativeImport(file, match[1]);
      if (resolved) {
        stack.push(resolved);
      }
    }
  }

  return [...seen];
}

function clientModulesIn(entry: string): string[] {
  return runtimeImportClosure(entry)
    .filter((file) => /^\s*(['"])use client\1/m.test(readFileSync(file, 'utf8')))
    .map((file) => relative(here, file));
}

describe('server/client module boundary', () => {
  it('keeps validate.ts free of any transitive "use client" module', () => {
    expect(clientModulesIn(resolve(here, 'validate.ts'))).toEqual([]);
  });

  it('keeps the section metadata registry free of any transitive "use client" module', () => {
    expect(clientModulesIn(resolve(here, '../sections/meta.ts'))).toEqual([]);
  });

  it('detects a client module when one really is reachable (guard sanity check)', () => {
    // sections/registry.ts legitimately imports the client components, so the detector must
    // find it there - otherwise the two assertions above would pass vacuously.
    expect(clientModulesIn(resolve(here, '../sections/registry.ts'))).toContain(
      relative(here, resolve(here, '../sections/navbar/NavbarSection.tsx'))
    );
  });
});
