import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ThemeMode } from '@true-tech-team/react-components';
import { TemplatePicker } from './TemplatePicker';
import { TEMPLATE_IDS, TEMPLATES } from '../templates/registry';
import { getThemePreset } from '../themes/presets';

function renderPicker(selectedId = TEMPLATE_IDS[0]!, mode: ThemeMode = 'light') {
  const onSelect = vi.fn();
  const onModeChange = vi.fn();
  render(
    <TemplatePicker
      selectedId={selectedId}
      onSelect={onSelect}
      mode={mode}
      onModeChange={onModeChange}
    />
  );
  return { onSelect, onModeChange };
}

/** The `--theme-background-primary` a template's thumbnail actually resolved to. */
function thumbnailBackground(templateId: string) {
  return screen
    .getByTestId(`template-thumbnail-${templateId}`)
    .querySelector<HTMLElement>('[data-testid="template-thumbnail-page"]')!
    .style.getPropertyValue('--theme-background-primary');
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

describe('TemplatePicker thumbnails and selection', () => {
  it('renders a thumbnail inside every card', () => {
    renderPicker();
    for (const id of TEMPLATE_IDS) {
      expect(screen.getByTestId(`template-thumbnail-${id}`)).toBeInTheDocument();
    }
  });

  it('keeps the card accessible name to just the label', () => {
    renderPicker(TEMPLATE_IDS[0]!);
    for (const id of TEMPLATE_IDS) {
      const button = screen.getByRole('button', { name: TEMPLATES[id]!.label });
      expect(button).toContainElement(screen.getByTestId(`template-thumbnail-${id}`));
    }
  });

  it('shows a non-colour selected indicator on the selected card only', () => {
    const selected = TEMPLATE_IDS[1]!;
    renderPicker(selected);
    const indicators = screen.getAllByTestId('selected-indicator');
    expect(indicators).toHaveLength(1);
    expect(screen.getByRole('button', { name: TEMPLATES[selected]!.label })).toContainElement(
      indicators[0]!
    );
  });

  it('shows no selected indicator for an unknown selectedId', () => {
    renderPicker('nope');
    expect(screen.queryByTestId('selected-indicator')).not.toBeInTheDocument();
  });
});

// The mode toggle. Every assertion here is about the mode's *effect* - the toggle's own state and
// the tokens the thumbnails resolve to - never about what a thumbnail draws, because the header
// variants coming in later tasks change that.
describe('TemplatePicker mode toggle', () => {
  it('renders one toggle with a light and a dark option, outside every template card', () => {
    renderPicker();
    const toggle = screen.getByTestId('template-mode-toggle');
    expect(toggle).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Light' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeInTheDocument();
    // The cards are <button>s and their thumbnails already contain the library Navbar's own
    // button; the toggle's items are buttons too, so none of them may sit inside a card.
    for (const id of TEMPLATE_IDS) {
      expect(screen.getByRole('button', { name: TEMPLATES[id]!.label })).not.toContainElement(
        toggle
      );
    }
  });

  it('marks the option matching the given mode as checked', () => {
    renderPicker(TEMPLATE_IDS[0]!, 'dark');
    expect(screen.getByRole('radio', { name: 'Dark' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Light' })).toHaveAttribute('aria-checked', 'false');
  });

  it('reports dark when the dark option is clicked', () => {
    const { onModeChange } = renderPicker(TEMPLATE_IDS[0]!, 'light');
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(onModeChange).toHaveBeenCalledWith('dark');
  });

  it('reports light when the light option is clicked', () => {
    const { onModeChange } = renderPicker(TEMPLATE_IDS[0]!, 'dark');
    fireEvent.click(screen.getByRole('radio', { name: 'Light' }));
    expect(onModeChange).toHaveBeenCalledWith('light');
  });

  it('does not report a template selection when the toggle is clicked', () => {
    const { onSelect } = renderPicker();
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders every thumbnail in the dark mode preset of its own style', () => {
    renderPicker(TEMPLATE_IDS[0]!, 'dark');
    for (const id of TEMPLATE_IDS) {
      const expected = getThemePreset(TEMPLATES[id]!.themeId, 'dark')!.overrides.colors!
        .backgroundPrimary;
      expect(thumbnailBackground(id)).toBe(expected);
    }
  });

  it('renders every thumbnail in the light mode preset of its own style', () => {
    renderPicker(TEMPLATE_IDS[0]!, 'light');
    for (const id of TEMPLATE_IDS) {
      const expected = getThemePreset(TEMPLATES[id]!.themeId, 'light')!.overrides.colors!
        .backgroundPrimary;
      expect(thumbnailBackground(id)).toBe(expected);
    }
  });

  it('re-renders every thumbnail when the mode changes', () => {
    const { unmount } = render(
      <TemplatePicker
        selectedId={TEMPLATE_IDS[0]!}
        onSelect={vi.fn()}
        mode="light"
        onModeChange={vi.fn()}
      />
    );
    const light = TEMPLATE_IDS.map((id) => thumbnailBackground(id));
    unmount();
    render(
      <TemplatePicker
        selectedId={TEMPLATE_IDS[0]!}
        onSelect={vi.fn()}
        mode="dark"
        onModeChange={vi.fn()}
      />
    );
    const dark = TEMPLATE_IDS.map((id) => thumbnailBackground(id));
    TEMPLATE_IDS.forEach((id, index) => {
      expect(light[index]).not.toBe('');
      expect(dark[index]).not.toBe(light[index]);
    });
  });
});
