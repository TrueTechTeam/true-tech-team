import { resolve } from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { HeaderSection } from './HeaderSection';
import { headerSectionMeta } from './meta';
import { HEADER_VARIANTS } from './variants';
import { declarations, readScss } from '../../testSupport/scss';
import type { PageSection, PortfolioPage } from '../../schema/types';

// jsdom has no layout engine and does not load SCSS modules, so a test cannot observe what a
// declaration does. Where the real assertion is a CSS declaration, these tests read the
// .module.scss source and assert the declaration itself, using the exact-selector, line-anchored
// helper in testSupport/scss.ts.
const scss = readScss(resolve(__dirname, './HeaderSection.module.scss'));

function makeHeader(props: Record<string, unknown>): PageSection {
  return { id: 'hdr', type: 'header', name: 'Intro', showInNav: true, props };
}

function renderHeader(section: PageSection) {
  const page: PortfolioPage = {
    schemaVersion: 2,
    slug: 's',
    title: 'Justin True',
    templateId: 'default',
    sections: [section],
  };
  return render(<HeaderSection section={section} page={page} anchors={new Map()} />);
}

describe('HeaderSection', () => {
  it('renders the heading and subheading', () => {
    renderHeader(makeHeader({ heading: 'Hello there', subheading: 'I build things' }));
    expect(screen.getByRole('heading', { name: 'Hello there' })).toBeInTheDocument();
    expect(screen.getByText('I build things')).toBeInTheDocument();
  });

  it('renders one button per ctas entry', () => {
    renderHeader(
      makeHeader({
        heading: 'Hi',
        ctas: [
          { label: 'Email me', href: 'mailto:a@b.c', variant: 'primary' },
          { label: 'My work', href: '#work', variant: 'secondary' },
        ],
      })
    );
    expect(screen.getByRole('link', { name: 'Email me' })).toHaveAttribute('href', 'mailto:a@b.c');
    expect(screen.getByRole('link', { name: 'My work' })).toHaveAttribute('href', '#work');
  });

  // Review Focus 1
  it('falls back to the page title when heading is missing', () => {
    renderHeader(makeHeader({}));
    expect(screen.getByRole('heading', { name: 'Justin True' })).toBeInTheDocument();
  });

  // Review Focus 4
  it('skips malformed ctas entries and still renders the valid ones', () => {
    renderHeader(
      makeHeader({
        heading: 'Hi',
        ctas: ['not-an-object', { href: '#no-label' }, { label: 'Good', href: '#good' }],
      })
    );
    expect(screen.getByRole('link', { name: 'Good' })).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('renders no buttons when ctas is absent or not an array', () => {
    renderHeader(makeHeader({ heading: 'Hi', ctas: 'nope' }));
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    '  javascript:alert(1)',
    '\njavascript:alert(1)',
    'java\tscript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    '//evil.example',
    'relative/path',
  ])('drops an unsafe href (%j) but still renders a valid sibling', (href) => {
    renderHeader(
      makeHeader({
        heading: 'Hi',
        ctas: [
          { label: 'Bad', href },
          { label: 'Good', href: '#good' },
        ],
      })
    );
    expect(screen.queryByRole('link', { name: 'Bad' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Good' })).toHaveAttribute('href', '#good');
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it.each([
    'https://a.example/x',
    'http://a.example',
    'mailto:a@b.c',
    'tel:+15551234',
    '#work',
    '/about',
  ])('keeps an allowed href (%s)', (href) => {
    renderHeader(makeHeader({ heading: 'Hi', ctas: [{ label: 'Ok', href }] }));
    expect(screen.getByRole('link', { name: 'Ok' })).toHaveAttribute('href', href);
  });

  it('renders an allowed href with surrounding whitespace trimmed', () => {
    renderHeader(
      makeHeader({ heading: 'Hi', ctas: [{ label: 'Ok', href: '  https://a.example/x \t' }] })
    );
    expect(screen.getByRole('link', { name: 'Ok' })).toHaveAttribute('href', 'https://a.example/x');
  });

  it('renders two identical ctas without key collisions', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderHeader(
      makeHeader({
        heading: 'Hi',
        ctas: [
          { label: 'Same', href: '#a' },
          { label: 'Same', href: '#a' },
        ],
      })
    );
    expect(screen.getAllByRole('link', { name: 'Same' })).toHaveLength(2);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  // This asserts only that the backgroundImage prop reaches the style - NOT that it is quoted.
  // jsdom normalises an unquoted url(...) to the quoted form on read-back, so no rendered-style
  // assertion here can tell the two code paths apart. The quoting is pinned by pure string
  // assertions in ../cssUrl.test.ts, which is where backgroundImageValue lives.
  it('wires the backgroundImage prop into the element style', () => {
    const { container } = renderHeader(
      makeHeader({ heading: 'Hi', backgroundImage: 'https://x.example/a.png' })
    );
    const node = container.firstElementChild as HTMLElement;
    expect(node.style.backgroundImage).toBe('url("https://x.example/a.png")');
  });

  it('declares a text colour on the heading rather than inheriting one', () => {
    expect(declarations(scss.rule('.heading')).color).toBe('var(--theme-text-primary)');
  });

  // The band is full width and carries the image; the content inside it is what gets capped and
  // centred.
  it('constrains the hero content, not the background band', () => {
    const content = declarations(scss.rule('.content'));
    const band = declarations(scss.rule('.band'));
    expect(content['max-width']).toBe('var(--content-width-page)');
    expect(content['margin-inline']).toBe('auto');
    expect(band['background-size']).toBe('cover');
    expect(band['max-width']).toBeUndefined();
  });

  it('keeps the background on the outer band with the content nested inside it', () => {
    const { container } = renderHeader(
      makeHeader({ heading: 'Hi', backgroundImage: 'https://x.example/a.png' })
    );
    const band = container.firstElementChild as HTMLElement;
    const heading = screen.getByRole('heading', { name: 'Hi' });
    expect(band.style.backgroundImage).toContain('a.png');
    expect(band.firstElementChild).toContainElement(heading);
    expect(band.firstElementChild).not.toBe(heading);
    // The nested wrapper must be the one the stylesheet constrains.
    expect(band.firstElementChild?.className).toMatch(/content/);
  });
});

const CTAS = [
  { label: 'First ask', href: '#one', variant: 'primary' },
  { label: 'Second ask', href: '#two', variant: 'secondary' },
];
const STATS = [
  { value: '40%', label: 'Faster delivery' },
  { value: '12', label: 'Teams shipped' },
  { value: '3x', label: 'Throughput' },
];
const BASE = { heading: 'Hero', subheading: 'Supporting line', eyebrow: 'Denver, CO' };

function bandOf(container: HTMLElement) {
  return container.firstElementChild as HTMLElement;
}

function statList(container: HTMLElement) {
  return container.querySelector('dl') as HTMLElement;
}

describe('HeaderSection variants', () => {
  it('offers exactly the six variants in the editor schema, defaulting to plain', () => {
    const field = headerSectionMeta.propertySchema.find((f) => f.key === 'variant');
    expect(field?.type).toBe('select');
    expect(field?.options?.map((o) => o.value)).toEqual([...HEADER_VARIANTS]);
    expect(HEADER_VARIANTS).toEqual(['split', 'imageBleed', 'outcome', 'place', 'proof', 'plain']);
    expect(headerSectionMeta.defaultProps.variant).toBe('plain');
  });

  describe('fallback to plain', () => {
    it.each([undefined, '', 'nonsense', 'SPLIT', 42, null, {}, 'constructor', '__proto__'])(
      'renders plain for variant = %j and does not blank the page',
      (variant) => {
        const { container } = renderHeader(
          makeHeader({ ...BASE, variant, stats: STATS, ctas: CTAS })
        );
        expect(bandOf(container).dataset.variant).toBe('plain');
        expect(screen.getByRole('heading', { name: 'Hero' })).toBeInTheDocument();
        expect(screen.getByText('Supporting line')).toBeInTheDocument();
        expect(screen.getAllByRole('link')).toHaveLength(2);
        // plain uses neither eyebrow nor stats.
        expect(screen.queryByText('Denver, CO')).not.toBeInTheDocument();
        expect(screen.queryByText('Faster delivery')).not.toBeInTheDocument();
      }
    );

    it('honours the alignment option for plain only', () => {
      const plain = renderHeader(makeHeader({ heading: 'H', variant: 'plain', align: 'center' }));
      expect(bandOf(plain.container).className).toMatch(/centered/);
      plain.unmount();
      const split = renderHeader(makeHeader({ heading: 'H', variant: 'split', align: 'center' }));
      expect(bandOf(split.container).className).not.toMatch(/centered/);
    });
  });

  describe('split', () => {
    it('shows eyebrow, heading, subheading and all buttons, with stats in a second column', () => {
      const { container } = renderHeader(
        makeHeader({ ...BASE, variant: 'split', stats: STATS, ctas: CTAS })
      );
      expect(bandOf(container).dataset.variant).toBe('split');
      expect(screen.getByText('Denver, CO')).toBeInTheDocument();
      expect(screen.getAllByRole('link')).toHaveLength(2);
      const facts = statList(container);
      expect(within(facts).getAllByRole('term')).toHaveLength(3);
      // The stats sit beside the text, not inside the column that holds the heading.
      const heading = screen.getByRole('heading', { name: 'Hero' });
      expect(facts.contains(heading)).toBe(false);
      expect(heading.parentElement?.contains(facts)).toBe(false);
    });

    it('renders without a second column when there are no stats', () => {
      const { container } = renderHeader(makeHeader({ ...BASE, variant: 'split' }));
      expect(statList(container)).toBeNull();
    });
  });

  describe('imageBleed', () => {
    it('renders the heading, subheading and only the first button; no eyebrow or stats', () => {
      const { container } = renderHeader(
        makeHeader({ ...BASE, variant: 'imageBleed', stats: STATS, ctas: CTAS })
      );
      expect(bandOf(container).dataset.variant).toBe('imageBleed');
      expect(screen.getAllByRole('link')).toHaveLength(1);
      expect(screen.getByRole('link', { name: 'First ask' })).toBeInTheDocument();
      expect(screen.queryByText('Denver, CO')).not.toBeInTheDocument();
      expect(statList(container)).toBeNull();
    });

    it('with no backgroundImage keeps real text and applies neither image nor scrim', () => {
      const { container } = renderHeader(
        makeHeader({ heading: 'Big idea', variant: 'imageBleed', ctas: CTAS })
      );
      const band = bandOf(container);
      expect(screen.getByRole('heading', { name: 'Big idea' })).toBeVisible();
      expect(band.style.backgroundImage).toBe('');
      expect(band.className).not.toMatch(/hasImage/);
    });

    it('lays the scrim over an image', () => {
      const { container } = renderHeader(
        makeHeader({
          heading: 'Big',
          variant: 'imageBleed',
          backgroundImage: 'https://x.example/a.png',
        })
      );
      const band = bandOf(container);
      expect(band.className).toMatch(/hasImage/);
      expect(band.style.backgroundImage).toContain('a.png');
    });
  });

  describe('outcome', () => {
    it('renders the heading over a row of stats and uses the eyebrow', () => {
      const { container } = renderHeader(
        makeHeader({ ...BASE, variant: 'outcome', stats: STATS, ctas: CTAS })
      );
      expect(bandOf(container).dataset.variant).toBe('outcome');
      expect(screen.getByText('Denver, CO')).toBeInTheDocument();
      const row = statList(container);
      expect(
        within(row)
          .getAllByRole('definition')
          .map((d) => d.textContent)
      ).toEqual(['40%', '12', '3x']);
      const heading = screen.getByRole('heading', { name: 'Hero' });
      expect(heading.compareDocumentPosition(row) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('skips malformed stats and keeps the valid ones', () => {
      const { container } = renderHeader(
        makeHeader({
          heading: 'H',
          variant: 'outcome',
          stats: [
            'x',
            { value: '', label: 'No value' },
            { value: 9, label: 'Numeric' },
            { value: '1' },
          ],
        })
      );
      expect(within(statList(container)).getAllByRole('term')).toHaveLength(1);
      expect(screen.getByText('Numeric')).toBeInTheDocument();
    });

    it('renders two identical stats without key collisions', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      renderHeader(
        makeHeader({
          heading: 'H',
          variant: 'outcome',
          stats: [
            { value: '1', label: 'Same' },
            { value: '1', label: 'Same' },
          ],
        })
      );
      expect(screen.getAllByText('Same')).toHaveLength(2);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('place', () => {
    it('shows the location eyebrow and lists every named piece of work as a link', () => {
      const { container } = renderHeader(
        makeHeader({ ...BASE, variant: 'place', stats: STATS, ctas: CTAS })
      );
      expect(bandOf(container).dataset.variant).toBe('place');
      expect(screen.getByText('Denver, CO')).toBeInTheDocument();
      const list = screen.getByRole('list');
      expect(
        within(list)
          .getAllByRole('link')
          .map((a) => a.textContent)
      ).toEqual(['First ask', 'Second ask']);
      expect(statList(container)).toBeNull();
    });

    it('renders no list when there is no work to name', () => {
      renderHeader(makeHeader({ ...BASE, variant: 'place' }));
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('does not turn the work links into buttons', () => {
      renderHeader(makeHeader({ ...BASE, variant: 'place', ctas: CTAS }));
      for (const link of screen.getAllByRole('link')) {
        expect(link.className).not.toMatch(/cta/);
      }
    });
  });

  describe('proof', () => {
    it('highlights exactly one stat and makes a single ask; no eyebrow', () => {
      const { container } = renderHeader(
        makeHeader({ ...BASE, variant: 'proof', stats: STATS, ctas: CTAS })
      );
      expect(bandOf(container).dataset.variant).toBe('proof');
      expect(within(statList(container)).getAllByRole('term')).toHaveLength(1);
      expect(screen.getByText('40%')).toBeInTheDocument();
      expect(screen.queryByText('12')).not.toBeInTheDocument();
      expect(screen.queryByText('Denver, CO')).not.toBeInTheDocument();
      expect(screen.getAllByRole('link')).toHaveLength(1);
    });

    it('renders the one ask as the filled button even when it was seeded as secondary', () => {
      renderHeader(
        makeHeader({
          heading: 'H',
          variant: 'proof',
          ctas: [{ label: 'Go', href: '#g', variant: 'secondary' }],
        })
      );
      expect(screen.getByRole('link', { name: 'Go' }).className).not.toMatch(/ctaSecondary/);
    });
  });

  describe('plain', () => {
    it('is the simple hero: heading, subheading and every button', () => {
      const { container } = renderHeader(
        makeHeader({ ...BASE, variant: 'plain', stats: STATS, ctas: CTAS })
      );
      expect(bandOf(container).dataset.variant).toBe('plain');
      expect(screen.getAllByRole('link')).toHaveLength(2);
    });
  });
});

describe('HeaderSection styling (asserted on the SCSS source)', () => {
  it('takes every colour from theme custom properties', () => {
    expect(scss.source).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(scss.source).not.toMatch(/\b(?:rgba?|hsla?)\(/i);
  });

  it('lays a theme-background scrim over any band that has a background image', () => {
    const scrim = declarations(scss.rule('.hasImage::before'));
    expect(scrim.background).toContain('var(--theme-background-primary)');
    expect(scrim.background).toContain('color-mix(');
    expect(scrim.position).toBe('absolute');
    expect(scrim.inset).toBe('0');
    expect(scrim['z-index']).toBe('-1');
  });

  it('gives an outline button a primary border but a text-primary label (spec 4.6a)', () => {
    // A shared `.cta, .ctaSecondary` rule; the helper matches single selectors, so match it directly.
    const shared = /(?:^|\n)\.cta,\s*\.ctaSecondary\s*\{([^}]*)\}/.exec(scss.source)?.[1] ?? '';
    const base = declarations(shared);
    const outline = declarations(scss.rule('.ctaSecondary'));
    expect(base.border).toBe('1px solid var(--theme-primary)');
    expect(outline.color).toBe('var(--theme-text-primary)');
    expect(outline.background).toBe('transparent');
  });

  it('keeps the filled button on-primary text', () => {
    expect(declarations(scss.rule('.cta')).color).toBe('var(--theme-text-on-primary)');
  });

  it('gives imageBleed a brand rule and a display-size heading so it works without an image', () => {
    expect(declarations(scss.rule('.imageBleed'))['border-block-end']).toContain(
      'var(--theme-primary)'
    );
    expect(declarations(scss.rule('.imageBleed .heading'))['font-size']).toContain(
      '--font-size-4xl'
    );
  });
});
