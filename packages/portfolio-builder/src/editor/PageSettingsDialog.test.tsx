import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PageSettingsDialog } from './PageSettingsDialog';
import { CURRENT_SCHEMA_VERSION, type PortfolioPage } from '../schema/types';
import { THEME_STYLES } from '../themes/presets';

function makePage(overrides: Partial<PortfolioPage> = {}): PortfolioPage {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'default',
    themeId: THEME_STYLES[0]?.id,
    sections: [],
    ...overrides,
  };
}

interface RenderOptions {
  page?: PortfolioPage;
  published?: boolean;
  isDirty?: boolean;
  publishError?: string | null;
}

function renderDialog({
  page = makePage(),
  published = false,
  isDirty = false,
  publishError = null,
}: RenderOptions = {}) {
  const onTitleChange = vi.fn();
  const onThemeSelect = vi.fn();
  const onThemeModeSelect = vi.fn();
  const onPublishedChange = vi.fn();
  const onClose = vi.fn();
  render(
    <PageSettingsDialog
      page={page}
      published={published}
      isDirty={isDirty}
      publishError={publishError}
      onTitleChange={onTitleChange}
      onThemeSelect={onThemeSelect}
      onThemeModeSelect={onThemeModeSelect}
      onPublishedChange={onPublishedChange}
      onClose={onClose}
    />
  );
  return { onTitleChange, onThemeSelect, onThemeModeSelect, onPublishedChange, onClose };
}

describe('PageSettingsDialog', () => {
  it('shows the page title and reports edits', () => {
    const { onTitleChange } = renderDialog();
    expect(screen.getByLabelText(/page title/i)).toHaveValue('Justin True');
    fireEvent.change(screen.getByLabelText(/page title/i), { target: { value: 'New Title' } });
    expect(onTitleChange).toHaveBeenCalledWith('New Title');
  });

  it('shows the slug as read-only', () => {
    renderDialog();
    const slug = screen.getByLabelText(/page url|slug/i);
    expect(slug).toHaveValue('jtrue');
    expect(slug).toHaveAttribute('readonly');
  });

  it('offers the theme styles', () => {
    renderDialog();
    expect(
      screen.getByRole('button', { name: new RegExp(THEME_STYLES[0]!.name, 'i') })
    ).toBeInTheDocument();
  });

  it('shows the mode toggle off for a page on a light-default style with no stored mode', () => {
    renderDialog({ page: makePage({ themeId: 'ocean', themeMode: undefined }) });
    expect(screen.getByLabelText(/dark mode/i)).not.toBeChecked();
  });

  it('shows the mode toggle on for a page on a dark-default style with no stored mode', () => {
    renderDialog({ page: makePage({ themeId: 'midnight', themeMode: undefined }) });
    expect(screen.getByLabelText(/dark mode/i)).toBeChecked();
  });

  it("prefers the page's stored mode over the style default", () => {
    renderDialog({ page: makePage({ themeId: 'midnight', themeMode: 'light' }) });
    expect(screen.getByLabelText(/dark mode/i)).not.toBeChecked();
  });

  it('reports a mode change as an explicit light/dark literal', () => {
    const { onThemeModeSelect } = renderDialog({
      page: makePage({ themeId: 'ocean', themeMode: 'light' }),
    });
    fireEvent.click(screen.getByLabelText(/dark mode/i));
    expect(onThemeModeSelect).toHaveBeenCalledWith('dark');
  });

  it('reports a publish request', () => {
    const { onPublishedChange } = renderDialog({ published: false, isDirty: false });
    fireEvent.click(screen.getByLabelText(/publish/i));
    expect(onPublishedChange).toHaveBeenCalledWith(true);
  });

  it('reports an unpublish request', () => {
    const { onPublishedChange } = renderDialog({ published: true, isDirty: false });
    fireEvent.click(screen.getByLabelText(/publish/i));
    expect(onPublishedChange).toHaveBeenCalledWith(false);
  });

  it('disables publishing while there are unsaved changes, and says why', () => {
    const { onPublishedChange } = renderDialog({ isDirty: true });
    const toggle = screen.getByLabelText(/publish/i);
    expect(toggle).toBeDisabled();
    expect(screen.getByText(/save your changes before publishing/i)).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(onPublishedChange).not.toHaveBeenCalled();
  });

  it('enables publishing once there are no unsaved changes', () => {
    renderDialog({ isDirty: false });
    expect(screen.getByLabelText(/publish/i)).not.toBeDisabled();
  });

  it('shows the public URL only while the page is published', () => {
    renderDialog({ published: true });
    const link = screen.getByRole('link', { name: /\/p\/jtrue/ });
    expect(link).toHaveAttribute('href', '/p/jtrue');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('hides the public URL while the page is a draft', () => {
    renderDialog({ published: false });
    expect(screen.queryByRole('link', { name: /\/p\/jtrue/ })).not.toBeInTheDocument();
  });

  it('shows a publish error when one is passed in', () => {
    renderDialog({ publishError: 'Could not publish' });
    expect(screen.getByText('Could not publish')).toBeInTheDocument();
  });

  it('closes via the done action', () => {
    const { onClose } = renderDialog();
    fireEvent.click(screen.getByRole('button', { name: /^done$/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
