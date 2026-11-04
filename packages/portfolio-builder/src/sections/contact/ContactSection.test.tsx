import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactSection } from './ContactSection';
import type { PageSection, PortfolioPage } from '../../schema/types';

function renderContact(props: Record<string, unknown>) {
  const section: PageSection = {
    id: 'con',
    type: 'contact',
    name: 'Contact',
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
  return render(<ContactSection section={section} page={page} anchors={new Map()} />);
}

const hrefs = () => screen.queryAllByRole('link').map((a) => a.getAttribute('href'));

describe('ContactSection', () => {
  it('renders the heading and intro', () => {
    renderContact({ heading: 'Get in touch', intro: 'Say hi.' });
    expect(screen.getByRole('heading', { level: 2, name: 'Get in touch' })).toBeInTheDocument();
    expect(screen.getByText('Say hi.')).toBeInTheDocument();
  });

  it('omits an empty heading and intro', () => {
    renderContact({ heading: '', intro: '', links: [{ label: 'A', href: 'https://a.test' }] });
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(document.querySelectorAll('p')).toHaveLength(0);
  });

  it('renders email as mailto: and phone as tel:', () => {
    renderContact({ email: 'me@x.test', phone: '+1 555 0100' });
    expect(screen.getByRole('link', { name: 'me@x.test' })).toHaveAttribute(
      'href',
      'mailto:me@x.test'
    );
    expect(screen.getByRole('link', { name: '+1 555 0100' })).toHaveAttribute(
      'href',
      'tel:+1 555 0100'
    );
  });

  it('renders no link for an empty or non-string email and phone', () => {
    renderContact({ email: '  ', phone: 7 });
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('never lets a javascript: value stored in email or phone become a live href', () => {
    renderContact({ email: 'javascript:alert(1)', phone: 'javascript:alert(2)' });
    const all = hrefs();
    expect(all).toEqual(['mailto:javascript:alert(1)', 'tel:javascript:alert(2)']);
    all.forEach((href) => expect(href).toMatch(/^(mailto|tel):/));
  });

  it('builds the email href from the typed value, not by passing it through', () => {
    renderContact({ email: 'data:text/html,x' });
    expect(screen.getByRole('link')).toHaveAttribute('href', 'mailto:data:text/html,x');
  });

  it('renders a safe link entry', () => {
    renderContact({ links: [{ label: 'GitHub', href: 'https://github.com/x' }] });
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/x'
    );
  });

  it.each([
    'javascript:alert(1)',
    ' javascript:alert(1)',
    'java\tscript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'data:text/html,x',
    'vbscript:x',
    '//evil.test',
    'plain',
  ])('drops a link whose href is unsafe: %j', (href) => {
    renderContact({
      links: [
        { label: 'Bad', href },
        { label: 'Good', href: 'https://ok.test' },
      ],
    });
    expect(screen.queryByRole('link', { name: 'Bad' })).not.toBeInTheDocument();
    expect(hrefs()).toEqual(['https://ok.test']);
  });

  it.each([null, 'x', {}, 7, undefined])('renders no links for links = %j', (links) => {
    expect(() => renderContact({ heading: 'H', links })).not.toThrow();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('skips malformed link entries', () => {
    renderContact({
      links: [
        null,
        'x',
        7,
        [1],
        { label: '', href: 'https://a.test' },
        { href: 'https://b.test' },
        { label: 'No href' },
        { label: 5, href: 'https://c.test' },
        { label: 'Fine', href: 'https://d.test' },
      ],
    });
    expect(hrefs()).toEqual(['https://d.test']);
  });
});
