'use client';

import { Card } from '@true-tech-team/react-components';
import type { ThemePreset } from './types';
import styles from './ThemePicker.module.scss';

export interface ThemePickerProps {
  presets: ThemePreset[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

function Swatch({ preset }: { preset: ThemePreset }) {
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

export function ThemePicker({ presets, selectedId, onSelect }: ThemePickerProps) {
  return (
    <div className={styles.grid}>
      {presets.map((preset) => {
        const isSelected = preset.id === selectedId;
        return (
          <Card
            key={preset.id}
            padding="sm"
            className={isSelected ? styles.selectedCard : undefined}
          >
            <button
              type="button"
              className={styles.tile}
              aria-pressed={isSelected}
              onClick={() => onSelect(preset.id)}
            >
              <Swatch preset={preset} />
              <span className={styles.name}>{preset.name}</span>
            </button>
          </Card>
        );
      })}
    </div>
  );
}
