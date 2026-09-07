import type { ThemeMode, ThemeOverride } from '@true-tech-team/react-components';

export interface ThemePreset {
  id: string;
  name: string;
  mode: ThemeMode;
  overrides: ThemeOverride;
}
