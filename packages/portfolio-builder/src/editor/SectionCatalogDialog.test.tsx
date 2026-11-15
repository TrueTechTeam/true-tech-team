import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SectionCatalogDialog } from './SectionCatalogDialog';
import { CURRENT_SCHEMA_VERSION, type PageSection, type PortfolioPage } from '../schema/types';

function makePage(sections: PageSection[] = []): PortfolioPage {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'default',
    sections,
  };
}

function renderDialog(page: PortfolioPage) {
  const onAdd = vi.fn();
  const onClose = vi.fn();
  render(<SectionCatalogDialog page={page} onAdd={onAdd} onClose={onClose} />);
  return { onAdd, onClose };
}

describe('SectionCatalogDialog', () => {
  it('offers an entry for every section type', () => {
    renderDialog(makePage());
    expect(screen.getByRole('button', { name: /navigation bar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^header$/i })).toBeInTheDocument();
  });

  it('adds the chosen type', () => {
    const { onAdd } = renderDialog(makePage());
    fireEvent.click(screen.getByRole('button', { name: /^header$/i }));
    expect(onAdd).toHaveBeenCalledWith('header');
  });

  it('disables a singleton type the page already has, and says why', () => {
    const page = makePage([{ id: 'n', type: 'navbar', name: 'Home', showInNav: false, props: {} }]);
    renderDialog(page);
    expect(screen.getByRole('button', { name: /navigation bar/i })).toBeDisabled();
    expect(screen.getByText(/already has a navigation bar/i)).toBeInTheDocument();
  });

  it('leaves a non-singleton type enabled even when the page already has one', () => {
    const page = makePage([{ id: 'h', type: 'header', name: 'Intro', showInNav: true, props: {} }]);
    renderDialog(page);
    expect(screen.getByRole('button', { name: /^header$/i })).not.toBeDisabled();
  });

  it('does not add a disabled type when clicked', () => {
    const page = makePage([{ id: 'n', type: 'navbar', name: 'Home', showInNav: false, props: {} }]);
    const { onAdd } = renderDialog(page);
    fireEvent.click(screen.getByRole('button', { name: /navigation bar/i }));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('closes via the cancel action', () => {
    const { onClose } = renderDialog(makePage());
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
