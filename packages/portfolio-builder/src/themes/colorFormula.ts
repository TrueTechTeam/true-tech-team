import type { ColorFamily } from '@true-tech-team/react-components';
import type { ThemePreset } from './types';

function colorVar(family: ColorFamily, shade: number): string {
  return `var(--color-${family}-${shade})`;
}

export function buildLightPreset(
  id: string,
  name: string,
  primaryFamily: ColorFamily,
  secondaryFamily: ColorFamily,
  neutralFamily: ColorFamily
): ThemePreset {
  return {
    id,
    name,
    mode: 'light',
    overrides: {
      colors: {
        primary: colorVar(primaryFamily, 500),
        primaryHover: colorVar(primaryFamily, 600),
        primaryActive: colorVar(primaryFamily, 700),
        secondary: colorVar(secondaryFamily, 500),
        secondaryHover: colorVar(secondaryFamily, 600),
        secondaryActive: colorVar(secondaryFamily, 700),
        backgroundPrimary: colorVar(neutralFamily, 50),
        backgroundSecondary: colorVar(neutralFamily, 100),
        backgroundTertiary: colorVar(neutralFamily, 200),
        surfacePrimary: colorVar(neutralFamily, 50),
        surfaceSecondary: colorVar(neutralFamily, 100),
        surfaceElevated: colorVar(neutralFamily, 50),
        textPrimary: colorVar(neutralFamily, 900),
        textSecondary: colorVar(neutralFamily, 600),
        textTertiary: colorVar(neutralFamily, 400),
        borderPrimary: colorVar(neutralFamily, 200),
        borderSecondary: colorVar(neutralFamily, 300),
      },
    },
  };
}

export function buildDarkPreset(
  id: string,
  name: string,
  primaryFamily: ColorFamily,
  secondaryFamily: ColorFamily,
  neutralFamily: ColorFamily
): ThemePreset {
  return {
    id,
    name,
    mode: 'dark',
    overrides: {
      colors: {
        primary: colorVar(primaryFamily, 400),
        primaryHover: colorVar(primaryFamily, 300),
        primaryActive: colorVar(primaryFamily, 200),
        secondary: colorVar(secondaryFamily, 400),
        secondaryHover: colorVar(secondaryFamily, 300),
        secondaryActive: colorVar(secondaryFamily, 200),
        backgroundPrimary: colorVar(neutralFamily, 900),
        backgroundSecondary: colorVar(neutralFamily, 800),
        backgroundTertiary: colorVar(neutralFamily, 700),
        surfacePrimary: colorVar(neutralFamily, 800),
        surfaceSecondary: colorVar(neutralFamily, 700),
        surfaceElevated: colorVar(neutralFamily, 700),
        textPrimary: colorVar(neutralFamily, 50),
        textSecondary: colorVar(neutralFamily, 300),
        textTertiary: colorVar(neutralFamily, 500),
        borderPrimary: colorVar(neutralFamily, 700),
        borderSecondary: colorVar(neutralFamily, 600),
      },
    },
  };
}
