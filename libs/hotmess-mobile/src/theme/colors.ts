/**
 * Hotmess Sports dark theme colors for React Native.
 * Aligned with web app theme (libs/hotmess-web/src/styles/_variables.scss).
 */
export const colors = {
  // Background colors (purple-black to match web)
  bgPrimary: '#0d0a14',
  bgSecondary: '#16121f',
  bgTertiary: '#221d2d',
  bgElevated: '#221d2d',

  // Text colors
  textPrimary: '#fafafa',
  textSecondary: '#d4d4d4',
  textMuted: '#737373',

  // Border colors (purple-tinted to match web)
  borderDefault: '#362f46',
  borderSubtle: '#221d2d',

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

  // Logo colors
  logoRed: '#ef4444',
  logoYellow: '#eab308',
  logoGreen: '#22c55e',
  logoBlue: '#3b82f6',
  logoPurple: '#a855f7',

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
 * Per-tab rainbow colors for the bottom navigation.
 * Each tab gets a unique color following ROYGBV order left-to-right.
 */
export const tabColors: Record<string, string> = {
  Home: colors.logoRed,
  Schedule: '#f97316', // orange
  Messages: colors.logoYellow,
  Photos: colors.logoGreen,
  Admin: colors.logoBlue,
  Profile: colors.logoPurple,
} as const;

/**
 * Sport-specific colors (matching all 13 web sports).
 */
export const sportColors = {
  kickball: '#ef4444',
  dodgeball: '#f43f5e',
  bowling: '#06b6d4',
  indoorVolleyball: '#f97316',
  sandVolleyball: '#eab308',
  grassVolleyball: '#84cc16',
  cornhole: '#8b5cf6',
  pickleball: '#22c55e',
  basketball: '#f59e0b',
  flagFootball: '#3b82f6',
  tennis: '#14b8a6',
  softball: '#ec4899',
  soccer: '#10b981',
} as const;
