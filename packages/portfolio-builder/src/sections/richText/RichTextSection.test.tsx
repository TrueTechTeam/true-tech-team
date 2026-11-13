import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RichTextSection } from './RichTextSection';
import type { PageSection, PortfolioPage } from '../../schema/types';

function renderRichText(props: Record<string, unknown>) {
  const section: PageSection = {
    id: 'rt',
    type: 'richText',
    name: 'Rich Text',
    showInNav: true,
    props,
  };
  const page: PortfolioPage = {
    schemaVersion: 2,
    slug: 's',
    title: 'Justin True',
    templateId: 'default',
    sections: [section],
  };
  return render(<RichTextSection section={section} page={page} anchors={new Map()} />);
}

const paragraphs = () => Array.from(document.querySelectorAll('p'));

describe('RichTextSection', () => {
  it('renders the heading', () => {
    renderRichText({ heading: 'About', body: 'Hello.' });
    expect(screen.getByRole('heading', { level: 2, name: 'About' })).toBeInTheDocument();
  });

  it('omits an empty heading', () => {
    renderRichText({ heading: '', body: 'Hello.' });
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders two blank-line-separated paragraphs as two <p> elements', () => {
    renderRichText({ body: 'First paragraph.\n\nSecond paragraph.' });
    expect(paragraphs().map((p) => p.textContent)).toEqual([
      'First paragraph.',
      'Second paragraph.',
    ]);
  });

  it('treats CRLF and whitespace-only lines as blank lines', () => {
    renderRichText({ body: 'One.\r\n\r\nTwo.\n   \nThree.' });
    expect(paragraphs().map((p) => p.textContent)).toEqual(['One.', 'Two.', 'Three.']);
  });

  it('keeps a single newline inside one paragraph', () => {
    renderRichText({ body: 'Line one\nLine two' });
    expect(paragraphs()).toHaveLength(1);
    expect(paragraphs()[0]?.textContent).toBe('Line one\nLine two');
  });

  it('ignores extra blank lines and surrounding whitespace', () => {
    renderRichText({ body: '\n\n  A  \n\n\n\n  B  \n\n' });
    expect(paragraphs().map((p) => p.textContent)).toEqual(['A', 'B']);
  });

  it.each([null, undefined, 7, {}, [], ''])('renders no paragraphs for body = %j', (body) => {
    expect(() => renderRichText({ heading: 'X', body })).not.toThrow();
    expect(paragraphs()).toHaveLength(0);
  });

  it('centres only when align is center', () => {
    const { container, unmount } = renderRichText({ body: 'x', align: 'center' });
    expect((container.firstChild as HTMLElement).className).toMatch(/richTextCenter/);
    unmount();
    const left = renderRichText({ body: 'x', align: 'sideways' });
    expect((left.container.firstChild as HTMLElement).className).not.toMatch(/richTextCenter/);
  });
});
