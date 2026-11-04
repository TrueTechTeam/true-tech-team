import { describe, it, expect } from 'vitest';
import { TEMPLATES, TEMPLATE_IDS, getTemplate } from './registry';
import { SECTION_TYPES } from '../schema/types';
import { SECTION_META } from '../sections/meta';
import { getThemePreset } from '../themes/presets';
import { isSafeHref } from '../sections/safeHref';

const entries = Object.entries(TEMPLATES);

describe('template registry', () => {
  it('has at least the six shipped templates', () => {
    expect(TEMPLATE_IDS.length).toBeGreaterThanOrEqual(6);
  });

  it('TEMPLATE_IDS and TEMPLATES have identical key sets', () => {
    expect([...TEMPLATE_IDS].sort()).toEqual(Object.keys(TEMPLATES).sort());
  });

  it('every template id matches its registry key', () => {
    for (const [key, template] of entries) {
      expect(template.id).toBe(key);
    }
  });

  it('getTemplate resolves every id and rejects an unknown one', () => {
    for (const id of TEMPLATE_IDS) {
      expect(getTemplate(id)?.id).toBe(id);
    }
    expect(getTemplate('nope')).toBeUndefined();
  });

  it('every template has a non-empty label and description', () => {
    for (const [key, template] of entries) {
      expect(template.label.trim(), `${key} label`).not.toBe('');
      expect(template.description.trim(), `${key} description`).not.toBe('');
    }
  });

  it('every template theme resolves to a real preset', () => {
    for (const [key, template] of entries) {
      expect(getThemePreset(template.themeId), `${key} themeId ${template.themeId}`).toBeDefined();
    }
  });

  it('every template section uses a known section type', () => {
    for (const [key, template] of entries) {
      for (const section of template.sections) {
        expect(SECTION_TYPES, `${key} section ${section.name}`).toContain(section.type);
      }
    }
  });

  it('no template violates a singleton section type', () => {
    for (const [key, template] of entries) {
      const counts = new Map<string, number>();
      for (const section of template.sections) {
        counts.set(section.type, (counts.get(section.type) ?? 0) + 1);
      }
      for (const [type, count] of counts) {
        if (SECTION_META[type as keyof typeof SECTION_META]?.singleton) {
          expect(count, `${key} has ${count} ${type} sections`).toBe(1);
        }
      }
    }
  });

  it('every template has a non-empty section list and a unique set of section names', () => {
    for (const [key, template] of entries) {
      expect(template.sections.length, `${key} sections`).toBeGreaterThan(0);
      const names = template.sections.map((section) => section.name);
      expect(new Set(names).size, `${key} duplicate section names`).toBe(names.length);
    }
  });

  // Review Focus 4: a typo'd props key would otherwise ship as dead data that never renders.
  it("every props key a template sets exists in that section type's property schema", () => {
    for (const [key, template] of entries) {
      for (const section of template.sections) {
        const schema = SECTION_META[section.type].propertySchema;
        const allowed = new Set(schema.map((field) => field.key));
        for (const [propKey, value] of Object.entries(section.props ?? {})) {
          expect(allowed, `${key} / ${section.name} / ${propKey}`).toContain(propKey);
          // validateSectionProps iterates the schema, not the props bag, so an invented key inside
          // a list item is ignored by validation AND rendering. Guard it here.
          const field = schema.find((candidate) => candidate.key === propKey);
          if (Array.isArray(value) && field?.type === 'list' && field.itemSchema) {
            const itemKeys = new Set(field.itemSchema.map((itemField) => itemField.key));
            value.forEach((item, index) => {
              for (const itemKey of Object.keys((item ?? {}) as Record<string, unknown>)) {
                expect(
                  itemKeys,
                  `${key} / ${section.name} / ${propKey}[${index}] / ${itemKey}`
                ).toContain(itemKey);
              }
            });
          }
        }
      }
    }
  });

  it('every href in every list field of every template is a safe href', () => {
    // Walks ALL list props rather than naming `ctas`, so a type added later (contact `links`,
    // logoStrip entries, ...) is covered without touching this test.
    let checked = 0;
    for (const [key, template] of entries) {
      for (const section of template.sections) {
        for (const [propKey, value] of Object.entries(section.props ?? {})) {
          if (!Array.isArray(value)) {
            continue;
          }
          value.forEach((item, index) => {
            if (typeof item !== 'object' || item === null) {
              return;
            }
            for (const [itemKey, href] of Object.entries(item)) {
              if (!/href$/i.test(itemKey)) {
                continue;
              }
              const where = `${key} / ${section.name} / ${propKey}[${index}].${itemKey}`;
              expect(typeof href, `${where} type`).toBe('string');
              expect(isSafeHref(href as string), `${where} = ${String(href)}`).toBe(true);
              checked += 1;
            }
          });
        }
      }
    }
    // Anti-vacuity: the templates seed CTAs and contact links, so a walk that finds none is broken.
    expect(checked).toBeGreaterThan(0);
  });

  it('every CTA href pointing at an anchor targets a section that exists in the same template', () => {
    // A dead in-page link in a freshly created page is a bad first impression, and it is entirely
    // preventable at build time.
    const slugify = (value: string) =>
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    for (const [key, template] of entries) {
      const anchors = new Set(template.sections.map((section) => slugify(section.name)));
      for (const section of template.sections) {
        const ctas = section.props?.['ctas'];
        if (!Array.isArray(ctas)) {
          continue;
        }
        for (const cta of ctas) {
          const href = String((cta as { href?: unknown }).href ?? '');
          if (href.startsWith('#')) {
            expect(anchors, `${key} / ${section.name} -> ${href}`).toContain(href.slice(1));
          }
        }
      }
    }
  });

  it('the blank template reproduces the previous hardcoded seed shape', () => {
    const blank = getTemplate('blank');
    expect(blank?.sections.map((section) => section.type)).toEqual(['navbar', 'header']);
    expect(blank?.sections[1]?.props).toBeUndefined();
  });
});
