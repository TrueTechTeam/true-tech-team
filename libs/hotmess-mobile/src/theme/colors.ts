/**
 * Hotmess Sports dark theme colors for React Native.
 */
export const colors = {
  // Background colors
  bgPrimary: '#0a0a0a',
  bgSecondary: '#171717',
  bgTertiary: '#262626',
  bgElevated: '#262626',

  // Text colors
  textPrimary: '#fafafa',
  textSecondary: '#d4d4d4',
  textMuted: '#737373',

  // Border colors
  borderDefault: '#404040',
  borderSubtle: '#262626',

  // Brand colors
  primary: '#0ea5e9',
  primaryHover: '#38bdf8',
  secondary: '#f97316',
  secondaryHover: '#fb923c',
  accent: '#a855f7',

  // Status colors
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',

  // Neutral scale
  neutral50: '#fafafa',
  neutral100: '#f5f5f5',
  neutral200: '#e5e5e5',
  neutral300: '#d4d4d4',
  neutral400: '#a3a3a3',
  neutral500: '#737373',
  neutral600: '#525252',
  neutral700: '#404040',
  neutral800: '#262626',
  neutral900: '#171717',
  neutral950: '#0a0a0a',
} as const;

/**
 * Sport-specific colors.
 */
export const sportColors = {
  kickball: '#ef4444',
  volleyball: '#f97316',
  pickleball: '#22c55e',
  basketball: '#f59e0b',
  cornhole: '#8b5cf6',
  bowling: '#06b6d4',
  softball: '#ec4899',
  soccer: '#10b981',
} as const;
