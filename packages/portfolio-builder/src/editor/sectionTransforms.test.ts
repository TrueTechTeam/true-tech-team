import { describe, it, expect } from 'vitest';
import {
  addSection,
  removeSection,
  moveSection,
  updateSectionProps,
  updateSectionMeta,
  canAddSectionType,
} from './sectionTransforms';
import {
  CURRENT_SCHEMA_VERSION,
  type PortfolioPage,
  type PageSection,
  type SectionType,
} from '../schema/types';

function makeSection(overrides: Partial<PageSection> = {}): PageSection {
  return {
    id: 'sec-1',
    type: 'header',
    name: 'Intro',
    showInNav: true,
    props: { heading: 'Hi' },
    ...overrides,
  };
}

function makePage(sections: PageSection[] = []): PortfolioPage {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'default',
    sections,
  };
}

/** Deep snapshot used to prove a transform did not mutate its input. */
function snapshot(page: PortfolioPage): string {
  return JSON.stringify(page);
}

describe('canAddSectionType', () => {
  it('allows a non-singleton type', () => {
    expect(canAddSectionType(makePage(), 'header')).toBe(true);
  });

  it('allows a singleton type when the page has none', () => {
    expect(canAddSectionType(makePage(), 'navbar')).toBe(true);
  });

  it('refuses a singleton type the page already has', () => {
    const page = makePage([makeSection({ id: 'n', type: 'navbar', name: 'Home' })]);
    expect(canAddSectionType(page, 'navbar')).toBe(false);
  });

  it('allows a second non-singleton section of the same type', () => {
    const page = makePage([makeSection()]);
    expect(canAddSectionType(page, 'header')).toBe(true);
  });

  it('refuses an unknown type', () => {
    expect(canAddSectionType(makePage(), 'nope' as SectionType)).toBe(false);
  });
});

describe('addSection', () => {
  it('appends a section seeded from the type defaults', () => {
    const next = addSection(makePage(), 'header');
    expect(next.sections).toHaveLength(1);
    const added = next.sections[0];
    expect(added?.type).toBe('header');
    expect(added?.name).toBe('Header');
    expect(added?.props).toEqual({
      heading: 'Your name here',
      subheading: '',
      backgroundImage: '',
      align: 'left',
      ctas: [],
    });
    expect(added?.id).toMatch(/[0-9a-f-]{36}/);
  });

  it('appends to the end, after existing sections', () => {
    const next = addSection(makePage([makeSection({ id: 'first' })]), 'header');
    expect(next.sections.map((section) => section.id)[0]).toBe('first');
    expect(next.sections).toHaveLength(2);
  });

  it('shows content sections in the nav and chrome sections not', () => {
    expect(addSection(makePage(), 'header').sections[0]?.showInNav).toBe(true);
    expect(addSection(makePage(), 'navbar').sections[0]?.showInNav).toBe(false);
  });

  it('copies defaultProps rather than sharing the object', () => {
    const next = addSection(makePage(), 'header');
    const added = next.sections[0];
    expect(added?.props).not.toBe(
      // the metadata's own object must not be handed out
      addSection(makePage(), 'header').sections[0]?.props
    );
  });

  it('refuses to add a second singleton section', () => {
    const page = makePage([makeSection({ id: 'n', type: 'navbar' })]);
    expect(addSection(page, 'navbar')).toBe(page);
  });

  it('refuses an unknown type', () => {
    const page = makePage();
    expect(addSection(page, 'nope' as SectionType)).toBe(page);
  });

  it('does not mutate the input page', () => {
    const page = makePage([makeSection()]);
    const before = snapshot(page);
    addSection(page, 'header');
    expect(snapshot(page)).toBe(before);
  });
});

describe('removeSection', () => {
  it('removes the addressed section', () => {
    const page = makePage([makeSection({ id: 'a' }), makeSection({ id: 'b' })]);
    expect(removeSection(page, 'a').sections.map((s) => s.id)).toEqual(['b']);
  });

  it('returns the page unchanged for an absent id', () => {
    const page = makePage([makeSection({ id: 'a' })]);
    expect(removeSection(page, 'missing')).toBe(page);
  });

  it('can empty the page', () => {
    const page = makePage([makeSection({ id: 'a' })]);
    expect(removeSection(page, 'a').sections).toEqual([]);
  });

  it('does not mutate the input page', () => {
    const page = makePage([makeSection({ id: 'a' }), makeSection({ id: 'b' })]);
    const before = snapshot(page);
    removeSection(page, 'a');
    expect(snapshot(page)).toBe(before);
  });
});

describe('moveSection', () => {
  const page = makePage([
    makeSection({ id: 'a' }),
    makeSection({ id: 'b' }),
    makeSection({ id: 'c' }),
  ]);

  it('moves a section toward the start', () => {
    expect(moveSection(page, 'b', -1).sections.map((s) => s.id)).toEqual(['b', 'a', 'c']);
  });

  it('moves a section toward the end', () => {
    expect(moveSection(page, 'b', 1).sections.map((s) => s.id)).toEqual(['a', 'c', 'b']);
  });

  it('is a no-op moving the first section up', () => {
    expect(moveSection(page, 'a', -1)).toBe(page);
  });

  it('is a no-op moving the last section down', () => {
    expect(moveSection(page, 'c', 1)).toBe(page);
  });

  it('is a no-op for an absent id', () => {
    expect(moveSection(page, 'missing', 1)).toBe(page);
  });

  it('is a no-op on an empty page', () => {
    const empty = makePage();
    expect(moveSection(empty, 'anything', 1)).toBe(empty);
  });

  it('does not mutate the input page', () => {
    const before = snapshot(page);
    moveSection(page, 'b', 1);
    expect(snapshot(page)).toBe(before);
  });
});

describe('updateSectionProps', () => {
  it('replaces the props of the addressed section only', () => {
    const page = makePage([
      makeSection({ id: 'a', props: { heading: 'one' } }),
      makeSection({ id: 'b', props: { heading: 'two' } }),
    ]);
    const next = updateSectionProps(page, 'a', { heading: 'changed' });
    expect(next.sections[0]?.props).toEqual({ heading: 'changed' });
    expect(next.sections[1]?.props).toEqual({ heading: 'two' });
  });

  it('returns the page unchanged for an absent id', () => {
    const page = makePage([makeSection({ id: 'a' })]);
    expect(updateSectionProps(page, 'missing', { heading: 'x' })).toBe(page);
  });

  it('does not mutate the input page', () => {
    const page = makePage([makeSection({ id: 'a', props: { heading: 'one' } })]);
    const before = snapshot(page);
    updateSectionProps(page, 'a', { heading: 'changed' });
    expect(snapshot(page)).toBe(before);
  });
});

describe('updateSectionMeta', () => {
  it('changes only the keys present in the patch', () => {
    const page = makePage([
      makeSection({ id: 'a', name: 'Intro', showInNav: true, background: 'primary' }),
    ]);
    const next = updateSectionMeta(page, 'a', { name: 'Renamed' });
    expect(next.sections[0]?.name).toBe('Renamed');
    expect(next.sections[0]?.showInNav).toBe(true);
    expect(next.sections[0]?.background).toBe('primary');
  });

  it('can set showInNav false', () => {
    const page = makePage([makeSection({ id: 'a', showInNav: true })]);
    expect(updateSectionMeta(page, 'a', { showInNav: false }).sections[0]?.showInNav).toBe(false);
  });

  it('can change the background', () => {
    const page = makePage([makeSection({ id: 'a' })]);
    expect(updateSectionMeta(page, 'a', { background: 'secondary' }).sections[0]?.background).toBe(
      'secondary'
    );
  });

  it('leaves props untouched', () => {
    const page = makePage([makeSection({ id: 'a', props: { heading: 'keep' } })]);
    expect(updateSectionMeta(page, 'a', { name: 'x' }).sections[0]?.props).toEqual({
      heading: 'keep',
    });
  });

  it('returns the page unchanged for an absent id', () => {
    const page = makePage([makeSection({ id: 'a' })]);
    expect(updateSectionMeta(page, 'missing', { name: 'x' })).toBe(page);
  });

  it('does not mutate the input page', () => {
    const page = makePage([makeSection({ id: 'a' })]);
    const before = snapshot(page);
    updateSectionMeta(page, 'a', { name: 'Renamed' });
    expect(snapshot(page)).toBe(before);
  });
});
