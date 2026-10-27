import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Guards the server/client boundary that the section-type split exists to maintain.
 *
 * `schema/validate.ts` is reachable from server code and from `pages/crud.ts`, and
 * `render/SectionRenderer.tsx` reads `minHeight`/`chrome` off registry entries in the RSC layer.
 * If a `'use client'` module ever creeps back into these import closures, those property reads
 * break at request time - a failure neither `next build` (the route is dynamic) nor a jsdom test
 * (no RSC layer) can see. So assert it statically instead.
 *
 * Shape and limits of the guard. It walks the RUNTIME import closure of three entry points
 * (`schema/validate.ts`, `sections/meta.ts`, `pages/crud.ts`) following only RELATIVE
 * `import ... from` / `export ... from` specifiers, skipping `import type`/`export type`, and
 * fails if any module in a closure starts with a `'use client'` directive. It protects the
 * *metadata* closure. It does NOT follow non-relative specifiers (package imports), dynamic
 * `import()`, or side-effect-only imports (`import './x'`). The one real residual risk is a
 * future `meta.ts` importing a value from `@true-tech-team/react-components` whose module is
 * `'use client'`: that is a package specifier, so this test cannot see it - hence the rule on
 * `SectionTypeMeta` that metadata must not import from the component library.
 *
 * Anti-vacuity: a resolver that silently stops resolving would shrink every closure to its entry
 * and make the emptiness assertions pass for free. So the closure tests also assert which
 * modules were actually reached, covering both the `.ts` and `.tsx` resolution branches.
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
    const closure = runtimeImportClosure(resolve(here, 'validate.ts')).map((f) =>
      relative(here, f)
    );
    // Proves .ts resolution and depth-2 traversal, so an empty client list is not vacuous.
    expect(closure).toContain(join('..', 'sections', 'meta.ts'));
    expect(closure).toContain(join('..', 'sections', 'navbar', 'meta.ts'));
    expect(clientModulesIn(resolve(here, 'validate.ts'))).toEqual([]);
  });

  it('keeps the section metadata registry free of any transitive "use client" module', () => {
    const closure = runtimeImportClosure(resolve(here, '../sections/meta.ts')).map((f) =>
      relative(here, f)
    );
    expect(closure).toContain(join('..', 'sections', 'navbar', 'meta.ts'));
    expect(clientModulesIn(resolve(here, '../sections/meta.ts'))).toEqual([]);
  });

  it('keeps pages/crud.ts free of any transitive "use client" module', () => {
    const closure = runtimeImportClosure(resolve(here, '../pages/crud.ts')).map((f) =>
      relative(here, f)
    );
    // crud.ts -> mapping.ts and -> validate.ts -> sections/meta.ts: reached via .ts resolution.
    expect(closure).toContain(join('..', 'pages', 'mapping.ts'));
    expect(closure).toContain(join('validate.ts'));
    expect(clientModulesIn(resolve(here, '../pages/crud.ts'))).toEqual([]);
  });

  it('detects a client module when one really is reachable (guard sanity check)', () => {
    // sections/registry.ts legitimately imports the client components, so the detector must
    // find it there - otherwise the assertions above would pass vacuously.
    expect(clientModulesIn(resolve(here, '../sections/registry.ts'))).toContain(
      relative(here, resolve(here, '../sections/navbar/NavbarSection.tsx'))
    );
  });
});
