import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeDropdown } from './ThemeDropdown';
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

async function openMenu() {
  await userEvent.click(screen.getByRole('button'));
}

describe('ThemeDropdown', () => {
  it("shows the selected preset's name and swatches on the closed trigger", () => {
    render(<ThemeDropdown presets={makePresets()} selectedId="b" onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: /preset b/i })).toBeInTheDocument();
  });

  it('lists every preset by name once opened', async () => {
    render(<ThemeDropdown presets={makePresets()} onSelect={() => {}} />);
    await openMenu();
    expect(screen.getByText('Preset A')).toBeInTheDocument();
    expect(screen.getByText('Preset B')).toBeInTheDocument();
  });

  it('calls onSelect with the clicked preset id', async () => {
    const onSelect = vi.fn();
    render(<ThemeDropdown presets={makePresets()} onSelect={onSelect} />);
    await openMenu();
    await userEvent.click(screen.getByText('Preset A'));
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('shows a check mark only next to the currently selected preset', async () => {
    render(<ThemeDropdown presets={makePresets()} selectedId="b" onSelect={() => {}} />);
    await openMenu();
    expect(screen.getByTestId('icon-check')).toBeInTheDocument();
  });

  it("renders each swatch from that preset's own override colors, not an ambient theme", async () => {
    const presets = makePresets();
    render(<ThemeDropdown presets={presets} onSelect={() => {}} />);
    await openMenu();

    const swatches = screen.getAllByTestId('theme-swatch');
    // 3 swatch dots (primary, secondary, backgroundPrimary) per preset, in preset order.
    expect(swatches).toHaveLength(presets.length * 3);

    const [presetAPrimary, presetASecondary, presetABackground] = swatches;

    expect(presetAPrimary).toHaveStyle({ background: presets[0].overrides.colors?.primary });
    expect(presetASecondary).toHaveStyle({ background: presets[0].overrides.colors?.secondary });
    expect(presetABackground).toHaveStyle({
      background: presets[0].overrides.colors?.backgroundPrimary,
    });
  });
});
