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
      overrides: {
        colors: {
          primary: 'var(--color-blue-500)',
          secondary: 'var(--color-slate-500)',
          backgroundPrimary: 'var(--color-slate-50)',
        },
      },
    },
    {
      id: 'b',
      name: 'Preset B',
      mode: 'dark',
      overrides: {
        colors: {
          primary: 'var(--color-violet-400)',
          secondary: 'var(--color-fuchsia-400)',
          backgroundPrimary: 'var(--color-zinc-900)',
        },
      },
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

  it("renders each swatch from that preset's own override colors, not an ambient theme", () => {
    const presets = makePresets();
    render(<ThemePicker presets={presets} onSelect={() => {}} />);

    const swatches = screen.getAllByTestId('theme-swatch');
    // 3 swatch dots (primary, secondary, backgroundPrimary) per preset, in preset order.
    expect(swatches).toHaveLength(presets.length * 3);

    const [
      presetAPrimary,
      presetASecondary,
      presetABackground,
      presetBPrimary,
      presetBSecondary,
      presetBBackground,
    ] = swatches;

    expect(presetAPrimary).toHaveStyle({ background: presets[0].overrides.colors?.primary });
    expect(presetASecondary).toHaveStyle({ background: presets[0].overrides.colors?.secondary });
    expect(presetABackground).toHaveStyle({
      background: presets[0].overrides.colors?.backgroundPrimary,
    });

    expect(presetBPrimary).toHaveStyle({ background: presets[1].overrides.colors?.primary });
    expect(presetBSecondary).toHaveStyle({ background: presets[1].overrides.colors?.secondary });
    expect(presetBBackground).toHaveStyle({
      background: presets[1].overrides.colors?.backgroundPrimary,
    });

    // The two presets' swatches must actually differ from each other — proving the colors are
    // sourced per-preset rather than from a single shared/ambient value.
    expect(presetAPrimary).not.toHaveStyle({ background: presets[1].overrides.colors?.primary });
    expect(presetASecondary).not.toHaveStyle({
      background: presets[1].overrides.colors?.secondary,
    });
    expect(presetABackground).not.toHaveStyle({
      background: presets[1].overrides.colors?.backgroundPrimary,
    });
  });
});
