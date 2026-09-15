'use client';

import { Dropdown } from '@true-tech-team/react-components';
import type { ThemePreset } from './types';
import styles from './ThemeDropdown.module.scss';

export interface ThemeDropdownProps {
  presets: ThemePreset[];
  selectedId?: string;
  onSelect: (id: string) => void;
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

export function ThemeDropdown({ presets, selectedId, onSelect }: ThemeDropdownProps) {
  const selectedPreset = presets.find((preset) => preset.id === selectedId);

  const items = presets.map((preset) => ({
    itemKey: preset.id,
    label: (
      <span className={styles.triggerLabel}>
        <Swatches preset={preset} />
        <span>{preset.name}</span>
      </span>
    ),
    onClick: () => onSelect(preset.id),
  }));

  return (
    <Dropdown
      label={
        <span className={styles.triggerLabel}>
          {selectedPreset && <Swatches preset={selectedPreset} />}
          <span>{selectedPreset?.name ?? 'Theme'}</span>
        </span>
      }
      items={items}
      selectionMode="single"
      selectedKeys={selectedId ? [selectedId] : []}
      variant="outline"
      width="max-content"
    />
  );
}
