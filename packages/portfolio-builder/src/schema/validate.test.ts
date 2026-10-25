import { describe, it, expect } from 'vitest';
import { validatePortfolioPage } from './validate';

function makeNavbarSection(overrides: Record<string, unknown> = {}) {
  return {
    id: 'sec-nav',
    type: 'navbar',
    name: 'Home',
    showInNav: false,
    props: { brand: 'Justin', sticky: true },
    ...overrides,
  };
}

function makePage(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 2,
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'default',
    sections: [makeNavbarSection()],
    ...overrides,
  };
}

describe('validatePortfolioPage', () => {
  it('accepts a valid page', () => {
    expect(validatePortfolioPage(makePage())).toEqual({ valid: true, errors: [] });
  });

  it('rejects a schemaVersion that is not 2', () => {
    const result = validatePortfolioPage(makePage({ schemaVersion: 1 }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('schemaVersion must be 2');
  });

  it('rejects an unknown section type', () => {
    const result = validatePortfolioPage(
      makePage({ sections: [makeNavbarSection({ type: 'photoGallery' })] })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/unknown section type: photoGallery/);
  });

  it('rejects a non-object props bag', () => {
    const result = validatePortfolioPage(
      makePage({ sections: [makeNavbarSection({ props: 'nope' })] })
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('sections[0].props must be an object');
  });

  it('rejects a prop of the wrong primitive type', () => {
    const result = validatePortfolioPage(
      makePage({ sections: [makeNavbarSection({ props: { brand: 'x', sticky: 'yes' } })] })
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('sections[0].props.sticky must be a boolean');
  });

  it('rejects more than one singleton section', () => {
    const result = validatePortfolioPage(
      makePage({
        sections: [makeNavbarSection(), makeNavbarSection({ id: 'sec-nav-2' })],
      })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/only one navbar section is allowed, found 2/);
  });

  it('accepts a page with no sections', () => {
    expect(validatePortfolioPage(makePage({ sections: [] })).valid).toBe(true);
  });

  it('rejects a missing section name', () => {
    const result = validatePortfolioPage(makePage({ sections: [makeNavbarSection({ name: '' })] }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('sections[0].name is required and must be a non-empty string');
  });
});
