import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemePicker } from './ThemePicker';
import type { ThemePreset } from './types';

function makePresets(): ThemePreset[] {
  return [
    {
      id: 'a',
      name: 'Preset A',
      mode: 'light',
      overrides: { colors: { primary: 'var(--color-blue-500)' } },
    },
    {
      id: 'b',
      name: 'Preset B',
      mode: 'dark',
      overrides: { colors: { primary: 'var(--color-violet-400)' } },
    },
  ];
}

describe('ThemePicker', () => {
  it('renders one tile per preset, named for that preset', () => {
    render(<ThemePicker presets={makePresets()} onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: 'Preset A' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Preset B' })).toBeInTheDocument();
  });

  it('calls onSelect with the clicked preset id', async () => {
    const onSelect = vi.fn();
    render(<ThemePicker presets={makePresets()} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Preset A' }));
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('marks only the currently selected preset with aria-pressed', () => {
    render(<ThemePicker presets={makePresets()} selectedId="b" onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: 'Preset A' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(screen.getByRole('button', { name: 'Preset B' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});
