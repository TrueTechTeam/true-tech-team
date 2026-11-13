import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PortfolioPagesList } from './PortfolioPagesList';
import * as crud from '../pages/crud';
import * as slugModule from '../pages/slug';
import type { PortfolioPageRecord } from '../pages/types';
import { TEMPLATES, TEMPLATE_IDS } from '../templates/registry';
import { getThemeStyle } from '../themes/presets';

const fakeSupabase = {} as SupabaseClient;

function makeRecord(overrides: Partial<PortfolioPageRecord> = {}): PortfolioPageRecord {
  return {
    id: 'page-1',
    userId: 'user-1',
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'blank',
    published: false,
    sections: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('PortfolioPagesList', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders each page as a link to its editor route', () => {
    render(<PortfolioPagesList pages={[makeRecord()]} userId="user-1" supabase={fakeSupabase} />);
    const link = screen.getByRole('link', { name: /justin true/i });
    expect(link).toHaveAttribute('href', '/portfolio-builder/edit/page-1');
  });

  it('shows a draft/published badge per page', () => {
    render(
      <PortfolioPagesList
        pages={[makeRecord({ published: true })]}
        userId="user-1"
        supabase={fakeSupabase}
      />
    );
    expect(screen.getByText(/published/i)).toBeInTheDocument();
  });

  it('shows a draft badge for an unpublished page', () => {
    render(
      <PortfolioPagesList
        pages={[makeRecord({ published: false })]}
        userId="user-1"
        supabase={fakeSupabase}
      />
    );
    expect(screen.getByText(/draft/i)).toBeInTheDocument();
  });

  it('shows only the Create New Page tile in the grid when there are no pages', () => {
    render(<PortfolioPagesList pages={[]} userId="user-1" supabase={fakeSupabase} />);
    expect(screen.getByRole('button', { name: 'Create New Page' })).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders a Create New Page tile at the end of the grid that opens the dialog', () => {
    render(<PortfolioPagesList pages={[makeRecord()]} userId="user-1" supabase={fakeSupabase} />);
    fireEvent.click(screen.getByRole('button', { name: 'Create New Page' }));
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
  });

  it('opens the create dialog with only a title field when New Page is clicked', () => {
    render(<PortfolioPagesList pages={[]} userId="user-1" supabase={fakeSupabase} />);
    fireEvent.click(screen.getByRole('button', { name: 'New Page' }));
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/slug/i)).not.toBeInTheDocument();
  });

  it('disables the Create button until a title is entered', () => {
    render(<PortfolioPagesList pages={[]} userId="user-1" supabase={fakeSupabase} />);
    fireEvent.click(screen.getByRole('button', { name: 'New Page' }));
    const createButton = screen.getByRole('button', { name: 'Create' });
    expect(createButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Page' } });
    expect(createButton).not.toBeDisabled();
  });

  it('generates a slug and creates the page, then calls onCreated', async () => {
    vi.spyOn(slugModule, 'generateUniqueSlug').mockResolvedValue('new-page');
    const created = makeRecord({ id: 'page-2', slug: 'new-page', title: 'New Page' });
    vi.spyOn(crud, 'savePortfolioPage').mockResolvedValue(created);
    const onCreated = vi.fn();

    render(
      <PortfolioPagesList
        pages={[]}
        userId="user-1"
        supabase={fakeSupabase}
        onCreated={onCreated}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'New Page' }));
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Page' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(created));
    expect(slugModule.generateUniqueSlug).toHaveBeenCalledWith(fakeSupabase, 'New Page');
    // The default selection is the first template, so the payload is its outline (this used to be
    // a hard-coded navbar + header page).
    const firstTemplate = TEMPLATES[TEMPLATE_IDS[0]!]!;
    expect(crud.savePortfolioPage).toHaveBeenCalledWith(fakeSupabase, 'user-1', {
      schemaVersion: 2,
      slug: 'new-page',
      title: 'New Page',
      templateId: firstTemplate.id,
      themeId: firstTemplate.themeId,
      // Stored explicitly, even untouched: the picker showed this mode, so the page keeps it.
      themeMode: getThemeStyle(firstTemplate.themeId)!.defaultMode,
      sections: firstTemplate.sections.map((section) =>
        expect.objectContaining({
          id: expect.any(String),
          type: section.type,
          name: section.name,
          showInNav: section.showInNav,
          props: expect.any(Object),
        })
      ),
    });
  });

  it('shows an error when slug generation fails', async () => {
    vi.spyOn(slugModule, 'generateUniqueSlug').mockRejectedValue(
      new Error('Could not generate a unique page URL. Please try a different title.')
    );
    render(<PortfolioPagesList pages={[]} userId="user-1" supabase={fakeSupabase} />);

    fireEvent.click(screen.getByRole('button', { name: 'New Page' }));
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Taken' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() =>
      expect(screen.getByText(/could not generate a unique page url/i)).toBeInTheDocument()
    );
  });

  it('closes the dialog and resets the title when Cancel is clicked', async () => {
    render(<PortfolioPagesList pages={[]} userId="user-1" supabase={fakeSupabase} />);
    fireEvent.click(screen.getByRole('button', { name: 'New Page' }));
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Draft title' } });
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // The Dialog's close is animated (default animationDuration 200ms), so the content can
    // still be mounted for a moment after the triggering click. waitFor is the disappearance
    // analog of the findBy fallback used elsewhere in this file for the dialog's open animation.
    await waitFor(() => expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'New Page' }));
    expect(screen.getByLabelText(/title/i)).toHaveValue('');
  });

  it('shows the template picker in the create dialog, with the first template selected', () => {
    render(<PortfolioPagesList pages={[]} userId="user-1" supabase={fakeSupabase} />);
    fireEvent.click(screen.getByRole('button', { name: 'New Page' }));
    expect(screen.getByRole('group', { name: /template/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: TEMPLATES[TEMPLATE_IDS[0]!]!.label })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('creates the page from the selected template', async () => {
    vi.spyOn(slugModule, 'generateUniqueSlug').mockResolvedValue('new-page');
    const created = makeRecord({ id: 'page-2', slug: 'new-page', title: 'New Page' });
    const save = vi.spyOn(crud, 'savePortfolioPage').mockResolvedValue(created);

    render(<PortfolioPagesList pages={[]} userId="user-1" supabase={fakeSupabase} />);
    fireEvent.click(screen.getByRole('button', { name: 'New Page' }));
    fireEvent.click(screen.getByRole('button', { name: TEMPLATES['graphic-design']!.label }));
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Page' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(save).toHaveBeenCalled());
    const page = save.mock.calls[0]![2];
    expect(page.templateId).toBe('graphic-design');
    expect(page.themeId).toBe(TEMPLATES['graphic-design']!.themeId);
    expect(page.sections.map((section) => section.name)).toEqual(
      TEMPLATES['graphic-design']!.sections.map((section) => section.name)
    );
  });

  it('uses the first template when the picker is never touched', async () => {
    vi.spyOn(slugModule, 'generateUniqueSlug').mockResolvedValue('new-page');
    const save = vi
      .spyOn(crud, 'savePortfolioPage')
      .mockResolvedValue(makeRecord({ id: 'page-2' }));

    render(<PortfolioPagesList pages={[]} userId="user-1" supabase={fakeSupabase} />);
    fireEvent.click(screen.getByRole('button', { name: 'New Page' }));
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Page' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(save).toHaveBeenCalled());
    expect(save.mock.calls[0]![2].templateId).toBe(TEMPLATE_IDS[0]);
  });

  it('honours the last template clicked when the selection changes twice', async () => {
    vi.spyOn(slugModule, 'generateUniqueSlug').mockResolvedValue('new-page');
    const save = vi
      .spyOn(crud, 'savePortfolioPage')
      .mockResolvedValue(makeRecord({ id: 'page-2' }));

    render(<PortfolioPagesList pages={[]} userId="user-1" supabase={fakeSupabase} />);
    fireEvent.click(screen.getByRole('button', { name: 'New Page' }));
    fireEvent.click(screen.getByRole('button', { name: TEMPLATES['marketing']!.label }));
    fireEvent.click(screen.getByRole('button', { name: TEMPLATES['blank']!.label }));
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Page' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(save).toHaveBeenCalled());
    expect(save.mock.calls[0]![2].templateId).toBe('blank');
  });

  it('keeps the chosen template when the duplicate-slug retry runs', async () => {
    vi.spyOn(slugModule, 'generateUniqueSlug').mockResolvedValue('new-page');
    const save = vi
      .spyOn(crud, 'savePortfolioPage')
      .mockRejectedValueOnce(new Error('That page URL is already taken.'))
      .mockResolvedValueOnce(makeRecord({ id: 'page-2' }));

    render(<PortfolioPagesList pages={[]} userId="user-1" supabase={fakeSupabase} />);
    fireEvent.click(screen.getByRole('button', { name: 'New Page' }));
    fireEvent.click(screen.getByRole('button', { name: TEMPLATES['graphic-design']!.label }));
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Page' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
    const retried = save.mock.calls[1]![2];
    expect(retried.templateId).toBe('graphic-design');
    expect(retried.themeId).toBe(TEMPLATES['graphic-design']!.themeId);
    expect(retried.slug).not.toBe('new-page');
    expect(retried.sections.map((section) => section.name)).toEqual(
      TEMPLATES['graphic-design']!.sections.map((section) => section.name)
    );
  });

  it('resets the template selection when the dialog is cancelled and reopened', async () => {
    render(<PortfolioPagesList pages={[]} userId="user-1" supabase={fakeSupabase} />);
    fireEvent.click(screen.getByRole('button', { name: 'New Page' }));
    fireEvent.click(screen.getByRole('button', { name: TEMPLATES['marketing']!.label }));
    expect(screen.getByRole('button', { name: TEMPLATES['marketing']!.label })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'New Page' }));
    expect(
      screen.getByRole('button', { name: TEMPLATES[TEMPLATE_IDS[0]!]!.label })
    ).toHaveAttribute('aria-pressed', 'true');
  });
});

// The create dialog's light/dark toggle. What matters is the mode the created page carries, so
// these assert the saved payload's `themeMode` - never anything a thumbnail draws.
describe('PortfolioPagesList create-time theme mode', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const firstTemplate = TEMPLATES[TEMPLATE_IDS[0]!]!;

  function stubSave() {
    vi.spyOn(slugModule, 'generateUniqueSlug').mockResolvedValue('new-page');
    return vi.spyOn(crud, 'savePortfolioPage').mockResolvedValue(makeRecord({ id: 'page-2' }));
  }

  function openDialog() {
    render(<PortfolioPagesList pages={[]} userId="user-1" supabase={fakeSupabase} />);
    fireEvent.click(screen.getByRole('button', { name: 'New Page' }));
  }

  function submit() {
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Page' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
  }

  it("preselects the selected template's style default mode", () => {
    openDialog();
    const expected = getThemeStyle(firstTemplate.themeId)!.defaultMode;
    expect(
      screen.getByRole('radio', { name: expected === 'dark' ? 'Dark' : 'Light' })
    ).toHaveAttribute('aria-checked', 'true');
  });

  it('stores dark on the created page when dark is chosen', async () => {
    const save = stubSave();
    openDialog();
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    submit();

    await waitFor(() => expect(save).toHaveBeenCalled());
    expect(save.mock.calls[0]![2].themeMode).toBe('dark');
  });

  it('stores light on the created page when the toggle is switched back', async () => {
    const save = stubSave();
    openDialog();
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Light' }));
    submit();

    await waitFor(() => expect(save).toHaveBeenCalled());
    expect(save.mock.calls[0]![2].themeMode).toBe('light');
  });

  it("stores the template style's default mode when the toggle is never touched", async () => {
    const save = stubSave();
    openDialog();
    submit();

    await waitFor(() => expect(save).toHaveBeenCalled());
    expect(save.mock.calls[0]![2].themeMode).toBe(
      getThemeStyle(firstTemplate.themeId)!.defaultMode
    );
  });

  it('keeps the chosen mode through the duplicate-slug retry', async () => {
    vi.spyOn(slugModule, 'generateUniqueSlug').mockResolvedValue('new-page');
    const save = vi
      .spyOn(crud, 'savePortfolioPage')
      .mockRejectedValueOnce(new Error('That page URL is already taken.'))
      .mockResolvedValueOnce(makeRecord({ id: 'page-2' }));

    openDialog();
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    submit();

    await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
    expect(save.mock.calls[1]![2].themeMode).toBe('dark');
  });

  it('keeps an explicitly chosen mode when the template selection changes', async () => {
    const save = stubSave();
    openDialog();
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    fireEvent.click(screen.getByRole('button', { name: TEMPLATES['marketing']!.label }));
    submit();

    await waitFor(() => expect(save).toHaveBeenCalled());
    expect(save.mock.calls[0]![2].templateId).toBe('marketing');
    expect(save.mock.calls[0]![2].themeMode).toBe('dark');
  });

  it('resets the mode to the template default when the dialog is cancelled and reopened', async () => {
    openDialog();
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(screen.getByRole('radio', { name: 'Dark' })).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'New Page' }));
    const expected = getThemeStyle(firstTemplate.themeId)!.defaultMode;
    expect(
      screen.getByRole('radio', { name: expected === 'dark' ? 'Dark' : 'Light' })
    ).toHaveAttribute('aria-checked', 'true');
  });
});
