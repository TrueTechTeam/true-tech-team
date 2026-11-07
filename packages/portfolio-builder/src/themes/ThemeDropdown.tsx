'use client';

import { Checkbox, Dropdown, type ThemeMode } from '@true-tech-team/react-components';
import { getThemePreset } from './presets';
import type { ThemePreset, ThemeStyle } from './types';
import styles from './ThemeDropdown.module.scss';

export interface ThemeDropdownProps {
  /**
   * The styles to offer - one row per style, never one per (style, mode). Mode is the separate
   * control below, so a 40-row list would put two same-id rows in here and break selection by id.
   */
  themeStyles: ThemeStyle[];
  selectedId?: string;
  /** The mode the swatches preview and the toggle reflects. */
  mode: ThemeMode;
  onSelect: (id: string) => void;
  onModeChange: (mode: ThemeMode) => void;
}

function Swatches({ preset }: { preset: ThemePreset }) {
  const colors = preset.overrides.colors ?? {};
  return (
    <span className={styles.swatchRow}>
      <span
        className={styles.swatch}
        data-testid="theme-swatch"
        style={{ background: colors.primary }}
      />
      <span
        className={styles.swatch}
        data-testid="theme-swatch"
        style={{ background: colors.secondary }}
      />
      <span
        className={styles.swatch}
        data-testid="theme-swatch"
        style={{ background: colors.backgroundPrimary }}
      />
    </span>
  );
}

/** The style's swatches in the mode being previewed, or none if the style no longer resolves. */
function StyleLabel({ style, mode }: { style: ThemeStyle; mode: ThemeMode }) {
  const preset = getThemePreset(style.id, mode);
  return (
    <span className={styles.triggerLabel}>
      {preset && <Swatches preset={preset} />}
      <span>{style.name}</span>
    </span>
  );
}

export function ThemeDropdown({
  themeStyles,
  selectedId,
  mode,
  onSelect,
  onModeChange,
}: ThemeDropdownProps) {
  const selectedStyle = themeStyles.find((style) => style.id === selectedId);

  const items = themeStyles.map((style) => ({
    itemKey: style.id,
    label: <StyleLabel style={style} mode={mode} />,
    onClick: () => onSelect(style.id),
  }));

  return (
    <div className={styles.themePicker}>
      <Dropdown
        label={
          selectedStyle ? (
            <StyleLabel style={selectedStyle} mode={mode} />
          ) : (
            <span className={styles.triggerLabel}>
              <span>Theme</span>
            </span>
          )
        }
        items={items}
        selectionMode="single"
        selectedKeys={selectedId ? [selectedId] : []}
        variant="outline"
        width="max-content"
      />
      {/* Mode is a boolean axis over the SAME style, so it is a toggle rather than a second
          20-row list. The value written back is still the explicit 'light' / 'dark' literal the
          page stores - never a bare boolean. */}
      <Checkbox
        id="page-theme-dark-mode"
        label="Dark mode"
        checked={mode === 'dark'}
        onChange={(checked) => onModeChange(checked ? 'dark' : 'light')}
      />
    </div>
  );
}
