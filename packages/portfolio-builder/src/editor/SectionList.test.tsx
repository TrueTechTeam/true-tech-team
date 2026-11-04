import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SectionList } from './SectionList';
import type { PageSection } from '../schema/types';

function makeSection(overrides: Partial<PageSection> = {}): PageSection {
  return { id: 'sec-1', type: 'header', name: 'Intro', showInNav: true, props: {}, ...overrides };
}

function renderList(sections: PageSection[], selectedId: string | null = null) {
  const onSelect = vi.fn();
  const onMove = vi.fn();
  const onRemove = vi.fn();
  const onAddClick = vi.fn();
  render(
    <SectionList
      sections={sections}
      selectedId={selectedId}
      onSelect={onSelect}
      onMove={onMove}
      onRemove={onRemove}
      onAddClick={onAddClick}
    />
  );
  return { onSelect, onMove, onRemove, onAddClick };
}

describe('SectionList', () => {
  it('gives the Add Section button a plus icon', () => {
    renderList([]);
    const button = screen.getByRole('button', { name: 'Add Section' });
    expect(button.querySelector('[data-testid="icon-plus"]')).not.toBeNull();
  });

  it('marks every chevron with the local class that neutralises the library disabled fill', () => {
    renderList([makeSection({ id: 'a', name: 'Home' }), makeSection({ id: 'b', name: 'Intro' })]);
    const up = screen.getByRole('button', { name: 'Move Home up (section 1)' });
    const down = screen.getByRole('button', { name: 'Move Intro down (section 2)' });
    expect(up).toBeDisabled();
    expect(up.className).toMatch(/chevron/);
    expect(down).toBeDisabled();
    expect(down.className).toMatch(/chevron/);
    expect(screen.getByRole('button', { name: 'Move Home down (section 1)' }).className).toMatch(
      /chevron/
    );
  });

  it('renders a row per section showing its name and type label', () => {
    renderList([
      makeSection({ id: 'a', type: 'navbar', name: 'Home' }),
      makeSection({ id: 'b', type: 'header', name: 'Intro' }),
    ]);
    expect(screen.getByRole('button', { name: '1. Home' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2. Intro' })).toBeInTheDocument();
    expect(screen.getByText('Navigation Bar')).toBeInTheDocument();
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('reports the selected id when a row is clicked', () => {
    const { onSelect } = renderList([makeSection({ id: 'a', name: 'Intro' })]);
    fireEvent.click(screen.getByRole('button', { name: '1. Intro' }));
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('marks the selected row with aria-current', () => {
    renderList(
      [makeSection({ id: 'a', name: 'Intro' }), makeSection({ id: 'b', name: 'Work' })],
      'b'
    );
    expect(screen.getByRole('button', { name: '1. Intro' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('button', { name: '2. Work' })).toHaveAttribute('aria-current', 'true');
  });

  it('moves a section up and down', () => {
    const { onMove } = renderList([
      makeSection({ id: 'a', name: 'Home' }),
      makeSection({ id: 'b', name: 'Intro' }),
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Move Intro up (section 2)' }));
    expect(onMove).toHaveBeenCalledWith('b', -1);
    fireEvent.click(screen.getByRole('button', { name: 'Move Home down (section 1)' }));
    expect(onMove).toHaveBeenCalledWith('a', 1);
  });

  it('disables move-up on the first row and move-down on the last', () => {
    renderList([makeSection({ id: 'a', name: 'Home' }), makeSection({ id: 'b', name: 'Intro' })]);
    expect(screen.getByRole('button', { name: 'Move Home up (section 1)' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move Intro down (section 2)' })).toBeDisabled();
  });

  it('confirms before removing, and only then reports the removal', () => {
    const { onRemove } = renderList([makeSection({ id: 'a', name: 'Intro' })]);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Intro (section 1)' }));
    expect(onRemove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledWith('a');
  });

  it('does not remove when the confirmation is cancelled', () => {
    const { onRemove } = renderList([makeSection({ id: 'a', name: 'Intro' })]);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Intro (section 1)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('opens the catalog from the add button', () => {
    const { onAddClick } = renderList([]);
    fireEvent.click(screen.getByRole('button', { name: 'Add Section' }));
    expect(onAddClick).toHaveBeenCalled();
  });

  // Review Focus 2
  it('shows an empty state and still offers Add Section when there are no sections', () => {
    renderList([]);
    expect(screen.getByText(/no sections yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Section' })).toBeInTheDocument();
  });

  // Review Focus 5
  it('keeps every control unambiguous when two sections share a name', () => {
    const { onMove } = renderList([
      makeSection({ id: 'a', name: 'Gallery' }),
      makeSection({ id: 'b', name: 'Gallery' }),
    ]);
    expect(screen.getByRole('button', { name: '1. Gallery' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2. Gallery' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Move Gallery up (section 2)' }));
    expect(onMove).toHaveBeenCalledWith('b', -1);
  });

  it('renders a section whose type is unknown without crashing', () => {
    renderList([makeSection({ id: 'a', name: 'Mystery', type: 'nope' as PageSection['type'] })]);
    expect(screen.getByRole('button', { name: '1. Mystery' })).toBeInTheDocument();
    expect(screen.getByText(/unknown section type/i)).toBeInTheDocument();
  });
});
