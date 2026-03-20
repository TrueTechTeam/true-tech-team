/**
 * Theme constants for bracket PDF generation.
 * Light theme for print readability.
 */

export const PDF_COLORS = {
  background: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#555555',
  textMuted: '#888888',
  line: '#333333',
  lineLight: '#999999',
  border: '#d4d4d4',
  primary: '#0ea5e9',
  success: '#22c55e',
  warning: '#f59e0b',
};

/** Rainbow time-slot colors (matches rainbowColors.ts) */
export const RAINBOW_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#a855f7', // purple
];

export const RAINBOW_BG_COLORS = [
  'rgba(239, 68, 68, 0.15)',
  'rgba(249, 115, 22, 0.15)',
  'rgba(234, 179, 8, 0.15)',
  'rgba(34, 197, 94, 0.15)',
  'rgba(59, 130, 246, 0.15)',
  'rgba(168, 85, 247, 0.15)',
];

export function getSlotColor(index: number): string {
  return RAINBOW_COLORS[index % RAINBOW_COLORS.length];
}

export function getSlotBgColor(index: number): string {
  return RAINBOW_BG_COLORS[index % RAINBOW_BG_COLORS.length];
}

/** PDF page dimensions in points (1pt = 1/72 inch) */
export const PAGE = {
  /** Letter portrait */
  width: 612,
  height: 792,
  margin: 36,
};

export const USABLE = {
  width: PAGE.width - PAGE.margin * 2, // 540
  height: PAGE.height - PAGE.margin * 2, // 720
};
