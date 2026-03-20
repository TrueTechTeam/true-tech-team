/**
 * Rainbow color palette for time slot color-coding.
 * Uses the logo colors from _variables.scss.
 */
export const RAINBOW_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#a855f7', // purple
];

export const RAINBOW_COLORS_LIGHT = [
  'rgba(239, 68, 68, 0.15)',
  'rgba(249, 115, 22, 0.15)',
  'rgba(234, 179, 8, 0.15)',
  'rgba(34, 197, 94, 0.15)',
  'rgba(59, 130, 246, 0.15)',
  'rgba(168, 85, 247, 0.15)',
];

/**
 * Get the rainbow color for a time slot index.
 */
export function getTimeSlotColor(slotIndex: number): string {
  return RAINBOW_COLORS[slotIndex % RAINBOW_COLORS.length];
}

/**
 * Get the light background rainbow color for a time slot index.
 */
export function getTimeSlotBgColor(slotIndex: number): string {
  return RAINBOW_COLORS_LIGHT[slotIndex % RAINBOW_COLORS_LIGHT.length];
}

/**
 * Find the time slot index for a scheduled time by matching against configured slots.
 */
export function findTimeSlotIndex(scheduledAt: string | undefined, timeSlots: string[]): number {
  if (!scheduledAt || timeSlots.length === 0) {
    return 0;
  }

  const date = new Date(scheduledAt);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  const idx = timeSlots.indexOf(timeStr);
  return idx >= 0 ? idx : 0;
}
