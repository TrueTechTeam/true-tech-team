import type { ColorFamily, ColorShade } from '@true-tech-team/react-components';
import type { ThemePreset } from './types';

function colorVar(family: ColorFamily, shade: ColorShade): string {
  return `var(--color-${family}-${shade})`;
}

const ON_LIGHT = '#ffffff';
const ON_DARK = '#111111';

// Which on-colour reads best is a property of the family AND the shade (the light builder uses
// 500, the dark builder 400), so it is decided per shade from measured WCAG contrast against
// ON_LIGHT / ON_DARK - never assumed. These are the families where white wins; every other
// family gets dark text. contrast.test.ts re-measures every preset, so a wrong entry fails there.
const WHITE_TEXT_ON_500: ReadonlySet<ColorFamily> = new Set<ColorFamily>([
  'blue', // 4.83 white vs 3.91 dark
  'brown', // 5.73 vs 3.29
  'navy', // 16.56 vs 1.14
  'violet', // 5.96 vs 3.17
  'purple', // 9.42 vs 2.00
  'indigo', // 12.95 vs 1.46
]);
const WHITE_TEXT_ON_400: ReadonlySet<ColorFamily> = new Set<ColorFamily>([
  'slate', // 5.01 white vs 3.77 dark
  'indigo', // 5.35 vs 3.53
]);

function textOn(family: ColorFamily, shade: 400 | 500): string {
  const whiteSet = shade === 500 ? WHITE_TEXT_ON_500 : WHITE_TEXT_ON_400;
  return whiteSet.has(family) ? ON_LIGHT : ON_DARK;
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
        textOnPrimary: textOn(primaryFamily, 500),
        primaryHover: colorVar(primaryFamily, 600),
        primaryActive: colorVar(primaryFamily, 700),
        secondary: colorVar(secondaryFamily, 500),
        secondaryHover: colorVar(secondaryFamily, 600),
        secondaryActive: colorVar(secondaryFamily, 700),
        // Canvas layers are a faint tint of the PRIMARY family (COLOR-3: tints, not a wash).
        // Neutral families 50 are all ~#fafafa, so deriving these from neutral made every light
        // preset look white. Tertiary stays neutral: primary-200 is a saturated wash on some
        // families (orange-200 is #ffcc80).
        backgroundPrimary: colorVar(primaryFamily, 50),
        backgroundSecondary: colorVar(primaryFamily, 100),
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
        textOnPrimary: textOn(primaryFamily, 400),
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
