const DEFAULT_BUFFER_MINUTES = 10;

/**
 * Compute how many time slots are needed given total matches and play area count.
 * Each time slot can run one game per play area concurrently.
 */
export function computeSlotsNeeded(totalMatches: number, playAreaCount: number): number {
  if (playAreaCount <= 0 || totalMatches <= 0) {
    return 0;
  }
  return Math.ceil(totalMatches / playAreaCount);
}

/**
 * Generate time slot strings starting from firstGameTime, incrementing by
 * gameDurationMinutes + bufferMinutes.
 *
 * @param firstGameTime  Start time in "HH:mm" format (e.g. "09:00")
 * @param gameDurationMinutes  Duration of each game in minutes
 * @param slotsNeeded  Number of time slots to generate
 * @param bufferMinutes  Minutes between games for transition (default 10)
 * @returns Array of time strings in "HH:mm" format
 */
export function computeTimeSlots(
  firstGameTime: string,
  gameDurationMinutes: number,
  slotsNeeded: number,
  bufferMinutes: number = DEFAULT_BUFFER_MINUTES
): string[] {
  if (slotsNeeded <= 0 || !firstGameTime || gameDurationMinutes <= 0) {
    return [];
  }

  const [startHours, startMinutes] = firstGameTime.split(':').map(Number);
  let totalMinutes = startHours * 60 + startMinutes;
  const increment = gameDurationMinutes + bufferMinutes;
  const slots: string[] = [];

  for (let i = 0; i < slotsNeeded; i++) {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours >= 24) {
      break;
    }
    slots.push(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`);
    totalMinutes += increment;
  }

  return slots;
}

export { DEFAULT_BUFFER_MINUTES };
