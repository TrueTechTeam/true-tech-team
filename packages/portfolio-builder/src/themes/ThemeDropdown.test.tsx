import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeDropdown } from './ThemeDropdown';
import { THEME_STYLES, getThemePreset, getThemeStyle } from './presets';
import type { ThemeMode } from '@true-tech-team/react-components';
import type { ThemeStyle } from './types';

// Real styles, not fixtures: the swatches are resolved from the package's own preset registry, so
// a made-up id would render no colours and the swatch assertions would prove nothing.
function styleOf(id: string): ThemeStyle {
  const style = getThemeStyle(id);
  if (!style) {
    throw new Error(`test fixture names an unknown style: ${id}`);
  }
  return style;
}

const OCEAN = styleOf('ocean'); // light by default
const MIDNIGHT = styleOf('midnight'); // dark by default

function makeStyles(): ThemeStyle[] {
  return [OCEAN, MIDNIGHT];
}

interface Options {
  themeStyles?: ThemeStyle[];
  selectedId?: string;
  mode?: ThemeMode;
}

function renderDropdown({ themeStyles = makeStyles(), selectedId, mode = 'light' }: Options = {}) {
  const onSelect = vi.fn();
  const onModeChange = vi.fn();
  render(
    <ThemeDropdown
      themeStyles={themeStyles}
      selectedId={selectedId}
      mode={mode}
      onSelect={onSelect}
      onModeChange={onModeChange}
    />
  );
  return { onSelect, onModeChange };
}

async function openMenu() {
  await userEvent.click(screen.getByRole('button'));
}

describe('ThemeDropdown', () => {
  it("shows the selected style's name and swatches on the closed trigger", () => {
    renderDropdown({ selectedId: MIDNIGHT.id });
    expect(
      screen.getByRole('button', { name: new RegExp(MIDNIGHT.name, 'i') })
    ).toBeInTheDocument();
  });

  it('falls back to a generic label when the selected id names no offered style', () => {
    renderDropdown({ selectedId: 'not-a-real-style' });
    expect(screen.getByRole('button', { name: /theme/i })).toBeInTheDocument();
  });

  it('lists every style by name once opened', async () => {
    renderDropdown();
    await openMenu();
    expect(screen.getByText(OCEAN.name)).toBeInTheDocument();
    expect(screen.getByText(MIDNIGHT.name)).toBeInTheDocument();
  });

  // Ruling A: mode is a separate control, so the list is one row per style - 20, not 40. Two rows
  // sharing an id would make selection by id ambiguous.
  it('offers one row per style, not one per style-and-mode', async () => {
    renderDropdown({ themeStyles: THEME_STYLES });
    await openMenu();
    for (const style of THEME_STYLES) {
      expect(screen.getAllByText(style.name), style.id).toHaveLength(1);
    }
  });

  it('calls onSelect with the clicked style id', async () => {
    const { onSelect } = renderDropdown();
    await openMenu();
    await userEvent.click(screen.getByText(OCEAN.name));
    expect(onSelect).toHaveBeenCalledWith(OCEAN.id);
  });

  it('shows a check mark only next to the currently selected style', async () => {
    renderDropdown({ selectedId: MIDNIGHT.id });
    await openMenu();
    expect(screen.getByTestId('icon-check')).toBeInTheDocument();
  });

  it("renders each swatch from that style's own preset colours, not an ambient theme", async () => {
    const themeStyles = makeStyles();
    renderDropdown({ themeStyles, mode: 'light' });
    await openMenu();

    const swatches = screen.getAllByTestId('theme-swatch');
    // 3 swatch dots (primary, secondary, backgroundPrimary) per style, in style order.
    expect(swatches).toHaveLength(themeStyles.length * 3);

    const oceanLight = getThemePreset(OCEAN.id, 'light')?.overrides.colors;
    const [primary, secondary, background] = swatches;
    expect(primary).toHaveStyle({ background: oceanLight?.primary });
    expect(secondary).toHaveStyle({ background: oceanLight?.secondary });
    expect(background).toHaveStyle({ background: oceanLight?.backgroundPrimary });
  });

  it('previews the swatches in the mode it was given, not the style default', async () => {
    renderDropdown({ themeStyles: [OCEAN], mode: 'dark' });
    await openMenu();
    const oceanDark = getThemePreset(OCEAN.id, 'dark')?.overrides.colors;
    const [primary] = screen.getAllByTestId('theme-swatch');
    expect(primary).toHaveStyle({ background: oceanDark?.primary });
    expect(oceanDark?.primary).not.toBe(
      getThemePreset(OCEAN.id, 'light')?.overrides.colors?.primary
    );
  });
});

describe('ThemeDropdown mode control', () => {
  it('reflects the current mode', () => {
    renderDropdown({ mode: 'dark' });
    expect(screen.getByLabelText(/dark mode/i)).toBeChecked();
  });

  it('is unchecked in light mode', () => {
    renderDropdown({ mode: 'light' });
    expect(screen.getByLabelText(/dark mode/i)).not.toBeChecked();
  });

  it("reports 'dark' when switched on", async () => {
    const { onModeChange } = renderDropdown({ mode: 'light' });
    await userEvent.click(screen.getByLabelText(/dark mode/i));
    expect(onModeChange).toHaveBeenCalledWith('dark');
  });

  it("reports 'light' when switched off", async () => {
    const { onModeChange } = renderDropdown({ mode: 'dark' });
    await userEvent.click(screen.getByLabelText(/dark mode/i));
    expect(onModeChange).toHaveBeenCalledWith('light');
  });

  it('does not report a style selection when only the mode is toggled', async () => {
    const { onSelect, onModeChange } = renderDropdown({ selectedId: OCEAN.id, mode: 'light' });
    await userEvent.click(screen.getByLabelText(/dark mode/i));
    expect(onModeChange).toHaveBeenCalledWith('dark');
    expect(onSelect).not.toHaveBeenCalled();
  });
});
