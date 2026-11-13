import { describe, it, expect } from 'vitest';
import { buildPageFromTemplate } from './buildPageFromTemplate';
import { getTemplate, TEMPLATE_IDS } from './registry';
import { SECTION_META } from '../sections/meta';
import { CURRENT_SCHEMA_VERSION } from '../schema/types';
import { validatePortfolioPage } from '../schema/validate';
import type { TemplateDefinition } from './types';

const software = getTemplate('software')!;

describe('buildPageFromTemplate', () => {
  it('sets the page metadata from the template and the arguments', () => {
    const page = buildPageFromTemplate(software, 'My Site', 'my-site');
    expect(page.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(page.title).toBe('My Site');
    expect(page.slug).toBe('my-site');
    expect(page.templateId).toBe('software');
    expect(page.themeId).toBe(software.themeId);
  });

  it('creates one section per template section, in order, with names preserved', () => {
    const page = buildPageFromTemplate(software, 'My Site', 'my-site');
    expect(page.sections.map((section) => section.name)).toEqual(
      software.sections.map((section) => section.name)
    );
    expect(page.sections.map((section) => section.type)).toEqual(
      software.sections.map((section) => section.type)
    );
  });

  it('carries showInNav and background through', () => {
    const page = buildPageFromTemplate(software, 'My Site', 'my-site');
    software.sections.forEach((templateSection, index) => {
      expect(page.sections[index]?.showInNav).toBe(templateSection.showInNav);
      expect(page.sections[index]?.background).toBe(templateSection.background);
    });
  });

  // Review Focus 1 — the most important test in this file.
  it('merges template props OVER the section type defaults rather than replacing them', () => {
    const template: TemplateDefinition = {
      id: 'test',
      label: 'Test',
      description: 'Test',
      themeId: 'slate',
      sections: [
        { type: 'header', name: 'Intro', showInNav: true, props: { heading: 'Only this' } },
      ],
    };
    const page = buildPageFromTemplate(template, 'T', 't');
    const props = page.sections[0]?.props as Record<string, unknown>;
    expect(props['heading']).toBe('Only this');
    // Everything the template did not state must come from the type's defaults.
    expect(props['align']).toBe(SECTION_META.header.defaultProps['align']);
    expect(props['subheading']).toBe(SECTION_META.header.defaultProps['subheading']);
    expect(props['backgroundImage']).toBe(SECTION_META.header.defaultProps['backgroundImage']);
    expect(props['ctas']).toEqual(SECTION_META.header.defaultProps['ctas']);
  });

  it('uses the type defaults wholesale when a template section omits props', () => {
    const blank = getTemplate('blank')!;
    const bare = {
      ...blank,
      sections: blank.sections.map(({ props: _props, ...rest }) => rest),
    };
    const page = buildPageFromTemplate(bare, 'T', 't');
    expect(page.sections[1]?.props).toEqual(SECTION_META.header.defaultProps);
  });

  it('does not share a props object with the section metadata', () => {
    const page = buildPageFromTemplate(getTemplate('blank')!, 'T', 't');
    expect(page.sections[1]?.props).not.toBe(SECTION_META.header.defaultProps);
  });

  it('deep-copies nested props so pages built from one template share no array instances', () => {
    const pageA = buildPageFromTemplate(software, 'A', 'a');
    const pageB = buildPageFromTemplate(software, 'B', 'b');
    const ctasA = (pageA.sections[1]?.props as Record<string, unknown>)['ctas'];
    const ctasB = (pageB.sections[1]?.props as Record<string, unknown>)['ctas'];
    const templateCtas = software.sections[1]?.props?.['ctas'];
    expect(Array.isArray(ctasA)).toBe(true);
    expect(ctasA).toEqual(ctasB);
    expect(ctasA).not.toBe(ctasB);
    // And not the template's own array either.
    expect(ctasA).toEqual(templateCtas);
    expect(ctasA).not.toBe(templateCtas);
  });

  // Review Focus 2
  it('gives every section a unique id, and two builds share no ids', () => {
    const first = buildPageFromTemplate(software, 'A', 'a');
    const second = buildPageFromTemplate(software, 'B', 'b');
    const firstIds = first.sections.map((section) => section.id);
    expect(new Set(firstIds).size).toBe(firstIds.length);
    const secondIds = new Set(second.sections.map((section) => section.id));
    for (const id of firstIds) {
      expect(secondIds.has(id)).toBe(false);
    }
  });

  it('does not mutate the template', () => {
    const before = JSON.stringify(software);
    buildPageFromTemplate(software, 'My Site', 'my-site');
    expect(JSON.stringify(software)).toBe(before);
  });

  // The guard that makes the whole registry trustworthy.
  it.each([...TEMPLATE_IDS])('every template builds a page that passes validation: %s', (id) => {
    const page = buildPageFromTemplate(getTemplate(id)!, 'Example Page', 'example-page');
    const result = validatePortfolioPage(page);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });
});
