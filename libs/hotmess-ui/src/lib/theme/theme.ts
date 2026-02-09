import { colors, sportColors } from './colors';

/**
 * Theme configuration for Hotmess Sports.
 */
export interface Theme {
  colors: typeof colors;
  sportColors: typeof sportColors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  typography: typeof typography;
}

/**
 * Spacing scale (in pixels).
 */
export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

/**
 * Border radius values.
 */
export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

/**
 * Shadow definitions for dark theme.
 */
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)',
} as const;

/**
 * Typography settings.
 */
export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, Menlo, monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

/**
 * Dark theme (default).
 */
export const darkTheme: Theme = {
  colors,
  sportColors,
  spacing,
  borderRadius,
  shadows,
  typography,
};

/**
 * CSS custom properties for the theme.
 * Use these in SCSS/CSS files.
 */
export const cssVariables = {
  // Background colors
  '--bg-primary': colors.neutral[950],
  '--bg-secondary': colors.neutral[900],
  '--bg-tertiary': colors.neutral[800],
  '--bg-elevated': colors.neutral[800],

  // Text colors
  '--text-primary': colors.neutral[50],
  '--text-secondary': colors.neutral[300],
  '--text-muted': colors.neutral[500],

  // Border colors
  '--border-default': colors.neutral[700],
  '--border-subtle': colors.neutral[800],

  // Brand colors
  '--color-primary': colors.primary[500],
  '--color-primary-hover': colors.primary[400],
  '--color-secondary': colors.secondary[500],
  '--color-secondary-hover': colors.secondary[400],
  '--color-accent': colors.accent[500],

  // Status colors
  '--color-success': colors.success[500],
  '--color-warning': colors.warning[500],
  '--color-error': colors.error[500],
} as const;
