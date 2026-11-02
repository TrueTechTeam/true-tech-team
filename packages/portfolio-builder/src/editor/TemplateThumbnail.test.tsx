import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TemplateThumbnail } from './TemplateThumbnail';
import { TEMPLATES } from '../templates/registry';

const software = TEMPLATES['software']!;
const graphic = TEMPLATES['graphic-design']!;

function themePrimary(id: string) {
  return screen
    .getByTestId(`template-thumbnail-${id}`)
    .querySelector<HTMLElement>('[data-testid="template-thumbnail-page"]')!
    .style.getPropertyValue('--theme-primary');
}

describe('TemplateThumbnail', () => {
  it('renders content from its own template', () => {
    render(<TemplateThumbnail template={software} />);
    expect(screen.getByTestId(`template-thumbnail-${software.id}`)).toHaveTextContent(
      'Your name here'
    );
  });

  it('is hidden from assistive tech', () => {
    render(<TemplateThumbnail template={software} />);
    expect(screen.getByTestId(`template-thumbnail-${software.id}`)).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('carries its template theme as a scoped --theme-primary that differs between themes', () => {
    expect(software.themeId).not.toBe(graphic.themeId);
    const { unmount } = render(<TemplateThumbnail template={software} />);
    const a = themePrimary(software.id);
    unmount();
    render(<TemplateThumbnail template={graphic} />);
    const b = themePrimary(graphic.id);
    expect(a).not.toBe('');
    expect(b).not.toBe('');
    expect(a).not.toBe(b);
  });
});
