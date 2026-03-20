import type { BracketMatch } from '../../../../hooks/useBracketMatches';

export interface ScheduleConstraints {
  minTimeBetweenGames: number; // hours
  maxGamesPerDay: number;
}

export interface ScheduleConflict {
  type: 'team_overlap' | 'venue_overlap' | 'too_many_games';
  matchId: string;
  conflictingMatchId?: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Default constraints for scheduling
 */
export const DEFAULT_CONSTRAINTS: ScheduleConstraints = {
  minTimeBetweenGames: 1.5, // 1.5 hours between games for same team
  maxGamesPerDay: 3,
};

/**
 * Detect scheduling conflicts for a specific match
 */
export function detectConflicts(
  match: BracketMatch,
  allMatches: BracketMatch[],
  constraints: ScheduleConstraints = DEFAULT_CONSTRAINTS
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  if (!match.scheduled_at) {
    return conflicts; // No schedule to conflict with
  }

  const matchTime = new Date(match.scheduled_at).getTime();

  // Check team availability (minimum rest between games)
  const teamIds = [match.team1_id, match.team2_id].filter(Boolean);
  for (const teamId of teamIds) {
    const teamMatches = allMatches.filter(
      (m) => m.id !== match.id && m.scheduled_at && (m.team1_id === teamId || m.team2_id === teamId)
    );

    for (const other of teamMatches) {
      const otherTime = new Date(other.scheduled_at as string).getTime();
      const timeDiffHours = Math.abs(matchTime - otherTime) / (1000 * 60 * 60);

      if (timeDiffHours < constraints.minTimeBetweenGames) {
        conflicts.push({
          type: 'team_overlap',
          matchId: match.id,
          conflictingMatchId: other.id,
          message: `Team plays again ${timeDiffHours.toFixed(1)} hours ${
            otherTime < matchTime ? 'before' : 'after'
          }. Minimum ${constraints.minTimeBetweenGames}h rest recommended.`,
          severity: timeDiffHours < 1 ? 'error' : 'warning',
        });
      }
    }

    // Check max games per day
    const sameDay = allMatches.filter((m) => {
      if (!m.scheduled_at || m.id === match.id) {
        return false;
      }
      if (m.team1_id !== teamId && m.team2_id !== teamId) {
        return false;
      }

      const matchDate = new Date(match.scheduled_at as string).toDateString();
      const otherDate = new Date(m.scheduled_at).toDateString();
      return matchDate === otherDate;
    });

    if (sameDay.length >= constraints.maxGamesPerDay) {
      conflicts.push({
        type: 'too_many_games',
        matchId: match.id,
        message: `Team has ${sameDay.length} games on this day. Maximum ${constraints.maxGamesPerDay} recommended.`,
        severity: 'warning',
      });
    }
  }

  // Check venue/play area availability (also check play_area without venue for field-only scheduling)
  if (match.play_area) {
    const sameSlot = allMatches.find((m) => {
      if (m.id === match.id || !m.scheduled_at) {
        return false;
      }
      if (m.play_area !== match.play_area) {
        return false;
      }
      // If both have venues, also check venue match
      if (match.venue_id && m.venue_id && m.venue_id !== match.venue_id) {
        return false;
      }

      // Check if times overlap (within 2 hours for a typical game)
      const otherTime = new Date(m.scheduled_at).getTime();
      const timeDiffHours = Math.abs(matchTime - otherTime) / (1000 * 60 * 60);
      return timeDiffHours < 2; // Assume games last ~2 hours
    });

    if (sameSlot) {
      const otherTeams = [sameSlot.team1?.name, sameSlot.team2?.name].filter(Boolean).join(' vs ');
      const otherTimeStr = sameSlot.scheduled_at
        ? new Date(sameSlot.scheduled_at).toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
          })
        : '';
      conflicts.push({
        type: 'venue_overlap',
        matchId: match.id,
        conflictingMatchId: sameSlot.id,
        message: `${match.play_area} at ${otherTimeStr} is already used by ${otherTeams || 'another match'}`,
        severity: 'error',
      });
    }
  }

  return conflicts;
}

/**
 * Validate entire bracket schedule
 */
export function validateSchedule(
  matches: BracketMatch[],
  constraints: ScheduleConstraints = DEFAULT_CONSTRAINTS
): ScheduleConflict[] {
  const allConflicts: ScheduleConflict[] = [];

  for (const match of matches) {
    const conflicts = detectConflicts(match, matches, constraints);
    allConflicts.push(...conflicts);
  }

  // Deduplicate conflicts (same conflict reported from both sides)
  const seen = new Set<string>();
  return allConflicts.filter((conflict) => {
    const key = [conflict.matchId, conflict.conflictingMatchId].sort().join('-');
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Auto-schedule all matches in a bracket (basic implementation)
 * This is a simplified version - Phase 7 would enhance this with better algorithms
 */
export function autoScheduleBracket(
  matches: BracketMatch[],
  startDate: Date,
  timeSlots: string[], // e.g., ['09:00', '11:00', '13:00', '15:00']
  playAreas: string[],
  constraints: ScheduleConstraints = DEFAULT_CONSTRAINTS
): Array<Partial<BracketMatch>> {
  console.warn('[bracketScheduling] autoScheduleBracket called:', {
    matchCount: matches.length,
    startDate: startDate.toISOString(),
    timeSlots,
    playAreas,
    constraints,
  });

  if (timeSlots.length === 0 || playAreas.length === 0) {
    console.warn('[bracketScheduling] no time slots or play areas, returning empty');
    return [];
  }

  const scheduled: Array<Partial<BracketMatch>> = [];
  const teamLastGame: Record<string, number> = {};

  // Sort matches by round (schedule earlier rounds first)
  const sortedMatches = [...matches].sort((a, b) => a.round - b.round);

  const currentDate = new Date(startDate);
  let slotIndex = 0;
  let areaIndex = 0;

  for (const match of sortedMatches) {
    // Find next available slot that doesn't conflict
    let foundSlot = false;
    let attempts = 0;
    const maxAttempts = timeSlots.length * playAreas.length * 30; // 30 days worth

    while (!foundSlot && attempts < maxAttempts) {
      const [hours, minutes] = timeSlots[slotIndex].split(':');
      const scheduledAt = new Date(currentDate);
      scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Check team availability
      const teamIds = [match.team1_id, match.team2_id].filter(Boolean);
      const hasConflict = teamIds.some((teamId) => {
        if (!teamId) {
          return false;
        }
        const lastGame = teamLastGame[teamId];
        if (!lastGame) {
          return false;
        }

        const timeDiff = (scheduledAt.getTime() - lastGame) / (1000 * 60 * 60);
        return timeDiff < constraints.minTimeBetweenGames;
      });

      if (!hasConflict) {
        scheduled.push({
          id: match.id,
          scheduled_at: scheduledAt.toISOString(),
          play_area: playAreas[areaIndex],
        });

        // Update team last game times
        teamIds.forEach((teamId) => {
          if (teamId) {
            teamLastGame[teamId] = scheduledAt.getTime();
          }
        });

        foundSlot = true;
      }

      // Move to next slot
      areaIndex++;
      if (areaIndex >= playAreas.length) {
        areaIndex = 0;
        slotIndex++;
      }
      if (slotIndex >= timeSlots.length) {
        slotIndex = 0;
        currentDate.setDate(currentDate.getDate() + 1);
      }

      attempts++;
    }
  }

  console.warn(
    '[bracketScheduling] scheduled',
    scheduled.length,
    '/',
    matches.length,
    'matches:',
    scheduled.map((s) => ({
      id: s.id,
      scheduled_at: s.scheduled_at,
      play_area: s.play_area,
    }))
  );

  return scheduled;
}
