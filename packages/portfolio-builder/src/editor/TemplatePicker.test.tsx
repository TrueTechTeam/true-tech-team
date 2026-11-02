import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplatePicker } from './TemplatePicker';
import { TEMPLATE_IDS, TEMPLATES } from '../templates/registry';

function renderPicker(selectedId = TEMPLATE_IDS[0]!) {
  const onSelect = vi.fn();
  render(<TemplatePicker selectedId={selectedId} onSelect={onSelect} />);
  return { onSelect };
}

describe('TemplatePicker', () => {
  it('renders a card for every template, labelled by its label', () => {
    renderPicker();
    for (const id of TEMPLATE_IDS) {
      expect(screen.getByRole('button', { name: TEMPLATES[id]!.label })).toBeInTheDocument();
    }
  });

  it('marks only the selected card as pressed', () => {
    const selected = TEMPLATE_IDS[1]!;
    renderPicker(selected);
    expect(screen.getByRole('button', { name: TEMPLATES[selected]!.label })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(
      screen.getByRole('button', { name: TEMPLATES[TEMPLATE_IDS[0]!]!.label })
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows the selected template description, and only that one', () => {
    const selected = TEMPLATE_IDS[1]!;
    renderPicker(selected);
    expect(screen.getByText(TEMPLATES[selected]!.description)).toBeInTheDocument();
    expect(screen.queryByText(TEMPLATES[TEMPLATE_IDS[0]!]!.description)).not.toBeInTheDocument();
  });

  it('reports the chosen template id', () => {
    const { onSelect } = renderPicker();
    const target = TEMPLATE_IDS[2]!;
    fireEvent.click(screen.getByRole('button', { name: TEMPLATES[target]!.label }));
    expect(onSelect).toHaveBeenCalledWith(target);
  });

  it('still reports a click on the already-selected card', () => {
    const selected = TEMPLATE_IDS[0]!;
    const { onSelect } = renderPicker(selected);
    fireEvent.click(screen.getByRole('button', { name: TEMPLATES[selected]!.label }));
    expect(onSelect).toHaveBeenCalledWith(selected);
  });

  it('renders nothing selected and no description for an unknown selectedId', () => {
    renderPicker('nope');
    for (const id of TEMPLATE_IDS) {
      expect(screen.getByRole('button', { name: TEMPLATES[id]!.label })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
    }
  });

  it('gives the group an accessible name', () => {
    renderPicker();
    expect(screen.getByRole('group', { name: /template/i })).toBeInTheDocument();
  });
});
