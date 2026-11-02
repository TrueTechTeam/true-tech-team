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
        for (const propKey of Object.keys(section.props ?? {})) {
          expect(allowed, `${key} / ${section.name} / ${propKey}`).toContain(propKey);
        }
      }
    }
  });

  it('every CTA href in every template is a safe href', () => {
    for (const [key, template] of entries) {
      for (const section of template.sections) {
        const ctas = section.props?.['ctas'];
        if (!Array.isArray(ctas)) {
          continue;
        }
        for (const cta of ctas) {
          const href = (cta as { href?: unknown }).href;
          expect(typeof href, `${key} / ${section.name} cta href type`).toBe('string');
          expect(isSafeHref(href as string), `${key} / ${section.name} href ${String(href)}`).toBe(
            true
          );
        }
      }
    }
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
