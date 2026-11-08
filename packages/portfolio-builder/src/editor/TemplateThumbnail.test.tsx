import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TemplateThumbnail } from './TemplateThumbnail';
import { TEMPLATES } from '../templates/registry';
import { getThemePreset, getThemeStyle } from '../themes/presets';

const software = TEMPLATES['software']!;
const graphic = TEMPLATES['graphic-design']!;

function themeVar(id: string, name: string) {
  return screen
    .getByTestId(`template-thumbnail-${id}`)
    .querySelector<HTMLElement>('[data-testid="template-thumbnail-page"]')!
    .style.getPropertyValue(name);
}

function themePrimary(id: string) {
  return themeVar(id, '--theme-primary');
}

/** The background the style's own preset for that mode declares - the expectation, not a guess. */
function presetBackground(themeId: string, mode: 'light' | 'dark') {
  return getThemePreset(themeId, mode)!.overrides.colors!.backgroundPrimary!;
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

// The mode must reach the render through the page's own `themeMode`, i.e. the same
// resolveEffectiveTheme -> themeStyleVars path EditorCanvas uses. Asserted on the resolved tokens
// rather than on anything the thumbnail draws, so the header variants coming in later tasks cannot
// break these.
describe('TemplateThumbnail mode', () => {
  it('renders the dark preset tokens when asked for dark', () => {
    render(<TemplateThumbnail template={software} mode="dark" />);
    expect(themeVar(software.id, '--theme-background-primary')).toBe(
      presetBackground(software.themeId, 'dark')
    );
  });

  it('renders the light preset tokens when asked for light', () => {
    render(<TemplateThumbnail template={software} mode="light" />);
    expect(themeVar(software.id, '--theme-background-primary')).toBe(
      presetBackground(software.themeId, 'light')
    );
  });

  it('resolves two different backgrounds for the two modes of one template', () => {
    const { unmount } = render(<TemplateThumbnail template={graphic} mode="light" />);
    const light = themeVar(graphic.id, '--theme-background-primary');
    unmount();
    render(<TemplateThumbnail template={graphic} mode="dark" />);
    const dark = themeVar(graphic.id, '--theme-background-primary');
    expect(light).not.toBe('');
    expect(dark).not.toBe('');
    expect(light).not.toBe(dark);
  });

  it("falls back to the template style's default mode when no mode is given", () => {
    const defaultMode = getThemeStyle(software.themeId)!.defaultMode;
    render(<TemplateThumbnail template={software} />);
    expect(themeVar(software.id, '--theme-background-primary')).toBe(
      presetBackground(software.themeId, defaultMode)
    );
  });
});
