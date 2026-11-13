import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SECTION_TYPES } from './types';

/**
 * Guards the server/client boundary that the section-type split exists to maintain.
 *
 * `schema/validate.ts` is reachable from server code and from `pages/crud.ts`, and
 * `render/SectionRenderer.tsx` reads `minHeight`/`chrome` off registry entries in the RSC layer.
 * If a `'use client'` module ever creeps back into these import closures, those property reads
 * break at request time - a failure neither `next build` (the route is dynamic) nor a jsdom test
 * (no RSC layer) can see. So assert it statically instead.
 *
 * Shape and limits of the guard. It has two halves.
 *
 *  1. Relative closure walk. It walks the RUNTIME import closure of three entry points
 *     (`schema/validate.ts`, `sections/meta.ts`, `pages/crud.ts`) following only RELATIVE
 *     `import ... from` / `export ... from` specifiers, skipping `import type`/`export type`, and
 *     fails if any module in a closure starts with a `'use client'` directive.
 *  2. Package value imports in metadata files. The walk cannot see package specifiers, so
 *     `packageValueImportsIn` (below) separately scans `sections/meta.ts` and every
 *     `sections/<type>/meta.ts` (discovered by reading the directory) and fails on any value
 *     import from a package - e.g. `@true-tech-team/react-components`, whose modules are
 *     `'use client'`. Type-only package imports are allowed. This enforces the rule on
 *     `SectionTypeMeta` that metadata must not import from the component library.
 *
 * What it still does NOT cover: dynamic `import()`, `require()`, side-effect-only RELATIVE imports
 * (`import './x'`, which the walk skips), and package value imports in any file that is not a
 * section metadata file - so a relative helper reachable from a meta file that itself imports a
 * client component from a package slips through both halves.
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
      // An unresolvable relative specifier is dropped silently rather than failing. That is a
      // residual hole of the same class this file guards against: if resolution of a real module
      // regressed, its subtree would vanish from the closure instead of erroring. The
      // containment assertions in the tests below are what make that regression visible - they
      // name specific modules that MUST appear, so a collapsed closure fails loudly.
    }
  }

  return [...seen];
}

function clientModulesIn(entry: string): string[] {
  return runtimeImportClosure(entry)
    .filter((file) => /^\s*(['"])use client\1/m.test(readFileSync(file, 'utf8')))
    .map((file) => relative(here, file));
}

/**
 * Non-relative (package) specifiers that `source` imports or re-exports at RUNTIME. Pure: takes file
 * content, returns offending specifiers, so it can be unit-tested against fixtures.
 *
 * Rules:
 *  - relative specifiers (`.`-prefixed) are skipped - the closure walk above already covers them;
 *  - `import type ...` / `export type ...` are skipped - erased at compile time;
 *  - `import { type A, type B } from 'pkg'` (EVERY specifier `type`-prefixed) is ALLOWED. DECISION:
 *    without `verbatimModuleSyntax` (not set in this repo's tsconfig) TypeScript and SWC elide the
 *    whole statement, so nothing reaches the bundle. If that flag is ever enabled such a statement
 *    emits a bare `import 'pkg'`, and this allowance must be revisited. A mixed `{ type A, b }`,
 *    an empty `{}`, a default import, `* as ns` and `export * from` are all treated as value imports;
 *  - side-effect imports (`import 'pkg'`) are flagged.
 * Dynamic `import()` is not inspected.
 */
export function packageValueImportsIn(source: string): string[] {
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const offending: string[] = [];

  const fromPattern =
    /^\s*(?:import|export)\s+(?!type[\s{*])([^;'"]*?)\s*from\s*['"]([^'"]+)['"]/gm;
  for (const [, clause, specifier] of code.matchAll(fromPattern)) {
    if (specifier.startsWith('.')) {
      continue;
    }
    const named = /^\{([^}]*)\}$/.exec(clause.trim());
    const entries = named
      ? named[1]
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean)
      : [];
    const allTypeOnly = entries.length > 0 && entries.every((e) => /^type\s/.test(e));
    if (!allTypeOnly) {
      offending.push(specifier);
    }
  }

  for (const [, specifier] of code.matchAll(/^\s*import\s+['"]([^'"]+)['"]/gm)) {
    if (!specifier.startsWith('.')) {
      offending.push(specifier);
    }
  }

  return offending;
}

const toPosix = (path: string): string => path.split(sep).join('/');

/** `sections/meta.ts` plus every `sections/<type>/meta.ts`, discovered from the directory. */
function sectionMetaFiles(): string[] {
  const sectionsDir = resolve(here, '../sections');
  const perType = readdirSync(sectionsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(sectionsDir, entry.name, 'meta.ts'))
    .filter((file) => existsSync(file));
  return [join(sectionsDir, 'meta.ts'), ...perType];
}

describe('packageValueImportsIn (checker fixtures)', () => {
  it('allows type-only and relative imports', () => {
    expect(packageValueImportsIn(`import type { A } from 'pkg';`)).toEqual([]);
    expect(packageValueImportsIn(`export type { A } from 'pkg';`)).toEqual([]);
    expect(
      packageValueImportsIn(`import { x } from './x';
export { y } from '../y';`)
    ).toEqual([]);
    expect(packageValueImportsIn(`import { a, type B } from '../schema/types';`)).toEqual([]);
  });

  it('allows an import whose every specifier is type-prefixed (elided), per the documented decision', () => {
    expect(packageValueImportsIn(`import { type A, type B } from 'pkg';`)).toEqual([]);
  });

  it('flags value imports from packages', () => {
    expect(packageValueImportsIn(`import { Button } from '@scope/pkg';`)).toEqual(['@scope/pkg']);
    expect(packageValueImportsIn(`import Def from 'pkg';`)).toEqual(['pkg']);
    expect(packageValueImportsIn(`import * as ns from "pkg";`)).toEqual(['pkg']);
    expect(packageValueImportsIn(`export { Z } from 'pkg';`)).toEqual(['pkg']);
    expect(packageValueImportsIn(`export * from 'pkg';`)).toEqual(['pkg']);
    expect(packageValueImportsIn(`import 'pkg/side-effect';`)).toEqual(['pkg/side-effect']);
    expect(packageValueImportsIn(`import { type A, b } from 'pkg';`)).toEqual(['pkg']);
    expect(packageValueImportsIn(`import {} from 'pkg';`)).toEqual(['pkg']);
  });

  it('handles multi-line statements', () => {
    expect(
      packageValueImportsIn(`import {
  type A,
  Button,
} from 'pkg';`)
    ).toEqual(['pkg']);
    expect(
      packageValueImportsIn(`import {
  type A,
  type B,
} from 'pkg';`)
    ).toEqual([]);
    expect(
      packageValueImportsIn(`import type {
  A,
  B,
} from 'pkg';`)
    ).toEqual([]);
  });

  it('ignores import-looking text inside comments', () => {
    expect(
      packageValueImportsIn(`/*
import { Button } from 'pkg';
*/
// import { B } from 'pkg';`)
    ).toEqual([]);
  });
});

describe('section metadata imports (package specifier guard)', () => {
  it('scans a meta.ts for every section type, so the scan is not vacuous', () => {
    const found = sectionMetaFiles().map((f) => toPosix(relative(resolve(here, '../sections'), f)));
    expect(found).toContain('meta.ts');
    // Derived from SECTION_TYPES so it maintains itself as types are added.
    expect(found).toEqual(expect.arrayContaining(SECTION_TYPES.map((type) => `${type}/meta.ts`)));
  });

  it('imports only relative specifiers or type-only packages in every section meta file', () => {
    const violations = sectionMetaFiles().flatMap((file) =>
      packageValueImportsIn(readFileSync(file, 'utf8')).map(
        (specifier) =>
          `${toPosix(relative(resolve(here, '..'), file))} imports a value from package '${specifier}' - section metadata must stay React-free; use a relative import or 'import type'`
      )
    );
    expect(violations).toEqual([]);
  });
});

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
