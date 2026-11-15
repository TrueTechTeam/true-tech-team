import { describe, it, expect } from 'vitest';
import { validatePortfolioPage, validateSectionProps } from './validate';
import type { PropertySchema } from '../properties/types';

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

function makeHeaderSection(props: Record<string, unknown>) {
  return { id: 'hdr', type: 'header', name: 'Intro', showInNav: true, props };
}

describe('list property validation', () => {
  it('rejects a list prop that is not an array', () => {
    const result = validatePortfolioPage(
      makePage({ sections: [makeHeaderSection({ heading: 'Hi', ctas: 'nope' })] })
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('sections[0].props.ctas must be an array');
  });

  it('rejects a list entry that is not an object, naming its index', () => {
    const result = validatePortfolioPage(
      makePage({ sections: [makeHeaderSection({ heading: 'Hi', ctas: ['nope'] })] })
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('sections[0].props.ctas[0] must be an object');
  });

  it('rejects a list entry missing a required sub-field, naming its index', () => {
    const result = validatePortfolioPage(
      makePage({ sections: [makeHeaderSection({ heading: 'Hi', ctas: [{ href: '#a' }] })] })
    );
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/sections\[0\]\.props\.ctas\[0\]\.label is required/);
  });

  it('rejects a list longer than maxItems', () => {
    const entry = { label: 'a', href: '#a', variant: 'primary' };
    const result = validatePortfolioPage(
      makePage({ sections: [makeHeaderSection({ heading: 'Hi', ctas: [entry, entry, entry] })] })
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('sections[0].props.ctas must have at most 2 entries');
  });

  it('rejects a header missing its required heading', () => {
    const result = validatePortfolioPage(makePage({ sections: [makeHeaderSection({ ctas: [] })] }));
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/sections\[0\]\.props\.heading is required/);
  });
});

describe('page-level validation', () => {
  it.each([null, undefined, 'page', 42, [], ['x']])('rejects a non-object page (%j)', (value) => {
    expect(validatePortfolioPage(value)).toEqual({
      valid: false,
      errors: ['page must be an object'],
    });
  });

  it.each(['slug', 'title', 'templateId'])('rejects a missing or empty %s', (field) => {
    const expected = `${field} is required and must be a non-empty string`;
    expect(validatePortfolioPage(makePage({ [field]: '' })).errors).toContain(expected);
    expect(validatePortfolioPage(makePage({ [field]: undefined })).errors).toContain(expected);
    expect(validatePortfolioPage(makePage({ [field]: 7 })).errors).toContain(expected);
  });

  it('returns early when sections is not an array', () => {
    const result = validatePortfolioPage(makePage({ sections: 'nope' }));
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(['sections must be an array']);
  });

  it('rejects a section background outside the enum', () => {
    const result = validatePortfolioPage(
      makePage({ sections: [makeNavbarSection({ background: 'neon' })] })
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'sections[0].background must be one of primary, secondary, tertiary, transparent'
    );
  });

  it('accepts a section background inside the enum', () => {
    expect(
      validatePortfolioPage(makePage({ sections: [makeNavbarSection({ background: 'tertiary' })] }))
        .valid
    ).toBe(true);
  });

  it('rejects a non-boolean showInNav', () => {
    const result = validatePortfolioPage(
      makePage({ sections: [makeNavbarSection({ showInNav: 'yes' })] })
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('sections[0].showInNav must be a boolean');
  });
});

describe('select property validation', () => {
  it('rejects a select value outside options', () => {
    const result = validatePortfolioPage(
      makePage({ sections: [makeHeaderSection({ heading: 'Hi', align: 'diagonal' })] })
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('sections[0].props.align must be one of left, center');
  });

  it('accepts a select value inside options', () => {
    expect(
      validatePortfolioPage(
        makePage({ sections: [makeHeaderSection({ heading: 'Hi', align: 'center' })] })
      ).valid
    ).toBe(true);
  });

  const numericSelect: PropertySchema = [
    {
      key: 'columns',
      label: 'Columns',
      type: 'select',
      optionValueType: 'number',
      options: [
        { value: '2', label: 'Two' },
        { value: '3', label: 'Three' },
      ],
    },
  ];

  it('respects optionValueType: a number-typed select rejects the string "3"', () => {
    expect(validateSectionProps({ columns: '3' }, numericSelect, 'p')).toEqual([
      'p.columns must be one of 2, 3',
    ]);
  });

  it('respects optionValueType: a number-typed select accepts the number 3', () => {
    expect(validateSectionProps({ columns: 3 }, numericSelect, 'p')).toEqual([]);
  });

  it('rejects a number outside the number-typed options', () => {
    expect(validateSectionProps({ columns: 4 }, numericSelect, 'p')).toHaveLength(1);
  });

  it('rejects a number for a string-typed select', () => {
    const stringSelect: PropertySchema = [
      { key: 'size', label: 'Size', type: 'select', options: [{ value: '3', label: 'Three' }] },
    ];
    expect(validateSectionProps({ size: 3 }, stringSelect, 'p')).toHaveLength(1);
    expect(validateSectionProps({ size: '3' }, stringSelect, 'p')).toEqual([]);
  });
});

describe('number property validation', () => {
  const ranged: PropertySchema = [{ key: 'gap', label: 'Gap', type: 'number', min: 1, max: 10 }];

  it('rejects a number below min', () => {
    expect(validateSectionProps({ gap: 0 }, ranged, 'p')).toEqual(['p.gap must be at least 1']);
  });

  it('rejects a number above max', () => {
    expect(validateSectionProps({ gap: 11 }, ranged, 'p')).toEqual(['p.gap must be at most 10']);
  });

  it('accepts numbers on the min and max bounds', () => {
    expect(validateSectionProps({ gap: 1 }, ranged, 'p')).toEqual([]);
    expect(validateSectionProps({ gap: 10 }, ranged, 'p')).toEqual([]);
  });

  it('rejects a non-number and NaN', () => {
    expect(validateSectionProps({ gap: '5' }, ranged, 'p')).toEqual(['p.gap must be a number']);
    expect(validateSectionProps({ gap: Number.NaN }, ranged, 'p')).toEqual([
      'p.gap must be a number',
    ]);
  });
});

describe('required list validation', () => {
  const requiredList: PropertySchema = [
    {
      key: 'items',
      label: 'Items',
      type: 'list',
      required: true,
      itemSchema: [{ key: 'name', label: 'Name', type: 'text' }],
    },
  ];

  it('rejects an empty array for a required list', () => {
    expect(validateSectionProps({ items: [] }, requiredList, 'p')).toEqual([
      'p.items is required and must be a non-empty list',
    ]);
  });

  it('accepts a non-empty array for a required list', () => {
    expect(validateSectionProps({ items: [{ name: 'a' }] }, requiredList, 'p')).toEqual([]);
  });

  it('still accepts an empty array for an optional list', () => {
    const optional: PropertySchema = [{ ...requiredList[0], required: false }];
    expect(validateSectionProps({ items: [] }, optional, 'p')).toEqual([]);
  });
});
