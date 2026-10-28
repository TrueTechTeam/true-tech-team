import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SectionFormPanel } from './SectionFormPanel';
import type { PageSection } from '../schema/types';

const fakeSupabase = {} as SupabaseClient;

function makeSection(overrides: Partial<PageSection> = {}): PageSection {
  return {
    id: 'sec-1',
    type: 'header',
    name: 'Intro',
    showInNav: true,
    props: { heading: 'Hi', subheading: '', backgroundImage: '', align: 'left', ctas: [] },
    ...overrides,
  };
}

function renderPanel(section: PageSection | null) {
  const onMetaChange = vi.fn();
  const onPropsChange = vi.fn();
  render(
    <SectionFormPanel
      section={section}
      onMetaChange={onMetaChange}
      onPropsChange={onPropsChange}
      supabase={fakeSupabase}
      userId="user-1"
    />
  );
  return { onMetaChange, onPropsChange };
}

describe('SectionFormPanel', () => {
  // Review Focus 2
  it('prompts to select a section when nothing is selected', () => {
    renderPanel(null);
    expect(screen.getByText(/select a section to edit/i)).toBeInTheDocument();
  });

  it('shows the section name and type label', () => {
    renderPanel(makeSection());
    expect(screen.getByLabelText('Section name')).toHaveValue('Intro');
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('reports a name change', () => {
    const { onMetaChange } = renderPanel(makeSection());
    fireEvent.change(screen.getByLabelText('Section name'), { target: { value: 'About me' } });
    expect(onMetaChange).toHaveBeenCalledWith({ name: 'About me' });
  });

  it('reports a show-in-nav change', () => {
    const { onMetaChange } = renderPanel(makeSection({ showInNav: true }));
    fireEvent.click(screen.getByLabelText(/show in navigation/i));
    expect(onMetaChange).toHaveBeenCalledWith({ showInNav: false });
  });

  it('reports a background change through the click-driven Select', async () => {
    const { onMetaChange } = renderPanel(makeSection());
    fireEvent.click(screen.getByRole('button', { name: 'Background' }));
    const menu = await screen.findByRole('menu');
    const option = within(menu)
      .getAllByRole('menuitem')
      .find((item) => item.textContent === 'Secondary');
    fireEvent.click(option!);
    expect(onMetaChange).toHaveBeenCalledWith({ background: 'secondary' });
  });

  it('shows Transparent as the background when the section has none', () => {
    renderPanel(makeSection({ background: undefined }));
    expect(screen.getByRole('button', { name: 'Background' })).toHaveTextContent('Transparent');
  });

  it("renders the type's content fields from its property schema", () => {
    renderPanel(makeSection());
    expect(screen.getByLabelText(/^Heading/)).toHaveValue('Hi');
    expect(screen.getByLabelText(/^Subheading/)).toBeInTheDocument();
    expect(screen.getByText('Buttons')).toBeInTheDocument();
  });

  it('reports a content change with the whole props bag', () => {
    const { onPropsChange } = renderPanel(makeSection());
    fireEvent.change(screen.getByLabelText(/^Heading/), { target: { value: 'Changed' } });
    expect(onPropsChange).toHaveBeenCalledWith({
      heading: 'Changed',
      subheading: '',
      backgroundImage: '',
      align: 'left',
      ctas: [],
    });
  });

  it('renders the list editor for the header CTA list', () => {
    const { onPropsChange } = renderPanel(makeSection());
    fireEvent.click(screen.getByRole('button', { name: 'Add Button' }));
    expect(onPropsChange).toHaveBeenCalledWith(expect.objectContaining({ ctas: [{}] }));
  });

  // Review Focus 3
  it('explains an unknown section type instead of crashing', () => {
    renderPanel(makeSection({ type: 'nope' as PageSection['type'] }));
    expect(screen.getByText(/isn.t recognised/i)).toBeInTheDocument();
  });

  it('still allows renaming a section whose type is unknown', () => {
    const { onMetaChange } = renderPanel(
      makeSection({ type: 'nope' as PageSection['type'], name: 'Mystery' })
    );
    fireEvent.change(screen.getByLabelText('Section name'), { target: { value: 'Renamed' } });
    expect(onMetaChange).toHaveBeenCalledWith({ name: 'Renamed' });
  });
});
