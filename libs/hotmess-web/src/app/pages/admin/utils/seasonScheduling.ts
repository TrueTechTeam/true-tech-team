import type { SchedulingRule } from '@true-tech-team/hotmess-types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TeamStanding {
  id: string;
  name: string;
  wins: number;
  losses: number;
  ties: number;
  gamesPlayed: number;
}

export interface GeneratedGame {
  id: string;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  timeSlot: string;
  playArea: string;
  dayIndex: number; // index into gameDays array
}

export interface ScheduleConstraints {
  preventRepeatMatchups: boolean;
  rotatePlayAreas: boolean;
  rotateTimeSlots: boolean;
}

export interface SeasonScheduleConfig {
  teams: TeamStanding[];
  playAreas: string[];
  timeSlots: string[];
  totalWeeks: number;
  gameDays: number[];
  schedulingRule: SchedulingRule;
  maxGamesPerDay: number;
  constraints: ScheduleConstraints;
}

export type WeeklyMatchupMode = 'standings' | 'swiss';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeMatchupKey(a: string, b: string): string {
  return [a, b].sort().join(':');
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Build all unique matchup pairs from a list of team IDs.
 */
function buildAllMatchups(teamIds: string[]): Array<[string, string]> {
  const pairs: Array<[string, string]> = [];
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      pairs.push([teamIds[i], teamIds[j]]);
    }
  }
  return pairs;
}

/**
 * Check if assigning a game at slotIndex for a team violates the scheduling rule.
 * Returns true if the assignment is INVALID.
 */
function violatesSchedulingRule(
  teamId: string,
  slotIndex: number,
  teamSlotAssignments: Map<string, number[]>,
  rule: SchedulingRule
): boolean {
  const assigned = teamSlotAssignments.get(teamId);
  if (!assigned || assigned.length === 0) {
    return false;
  }

  switch (rule) {
    case 'no_rules':
      return false;
    case 'not_back_to_back':
      // At least 1 slot gap
      return assigned.some((s) => Math.abs(s - slotIndex) < 2);
    case 'one_game_break':
      // Exactly 1 slot gap — cannot be adjacent (gap < 2) and ideally gap === 2
      // Enforce: no adjacent slots
      return assigned.some((s) => Math.abs(s - slotIndex) < 2);
    case 'any_schedule':
      // Best-effort: prefer non-adjacent but allow if needed (handled by scoring)
      return false;
    default:
      return false;
  }
}

/**
 * Compute a rotation cost for assigning a team to a slot/area.
 * Lower cost = better assignment (more variety).
 */
function rotationCost(
  teamId: string,
  slotIndex: number,
  areaIndex: number,
  teamHistory: Map<string, Array<{ slot: number; area: number; week: number }>>,
  constraints: ScheduleConstraints,
  currentWeek: number
): number {
  const history = teamHistory.get(teamId);
  if (!history || history.length === 0) {
    return 0;
  }

  let cost = 0;
  for (const prev of history) {
    const weekDistance = currentWeek - prev.week;
    const recencyWeight = 1 / Math.max(weekDistance, 1);

    if (constraints.rotateTimeSlots && prev.slot === slotIndex) {
      cost += 10 * recencyWeight;
    }
    if (constraints.rotatePlayAreas && prev.area === areaIndex) {
      cost += 10 * recencyWeight;
    }
  }
  return cost;
}

// ─── Full Season Generation (Random) ─────────────────────────────────────────

/**
 * Generate a full season schedule with random matchups.
 * Distributes games across weeks, rotating time slots and play areas.
 */
export function generateFullSeasonSchedule(config: SeasonScheduleConfig): GeneratedGame[] {
  const { teams, playAreas, timeSlots, totalWeeks, schedulingRule, maxGamesPerDay, constraints } =
    config;

  if (teams.length < 2 || playAreas.length === 0 || timeSlots.length === 0) {
    return [];
  }

  const teamIds = teams.map((t) => t.id);
  const allMatchups = buildAllMatchups(teamIds);
  const matchupFrequency = new Map<string, number>();
  allMatchups.forEach((m) => matchupFrequency.set(makeMatchupKey(m[0], m[1]), 0));

  const gamesPerTimeSlot = playAreas.length; // one game per play area per time slot
  const gamesPerDay = Math.min(
    timeSlots.length * gamesPerTimeSlot,
    Math.floor(teams.length / 2) * maxGamesPerDay
  );
  const matchupsPerWeek = Math.min(
    Math.floor(gamesPerDay),
    Math.floor((teams.length * maxGamesPerDay) / 2)
  );

  const allGames: GeneratedGame[] = [];
  const teamHistory = new Map<string, Array<{ slot: number; area: number; week: number }>>();
  let gameIdCounter = 0;

  for (let week = 1; week <= totalWeeks; week++) {
    const weekGames = generateWeekMatchups(
      teamIds,
      allMatchups,
      matchupFrequency,
      matchupsPerWeek,
      constraints
    );

    const assigned = assignSlotsAndAreas(
      weekGames,
      timeSlots,
      playAreas,
      schedulingRule,
      teamHistory,
      constraints,
      week,
      maxGamesPerDay
    );

    for (const game of assigned) {
      gameIdCounter++;
      allGames.push({
        id: `gen-game-${String(gameIdCounter).padStart(4, '0')}`,
        week,
        homeTeamId: game.home,
        awayTeamId: game.away,
        timeSlot: game.timeSlot,
        playArea: game.playArea,
        dayIndex: 0,
      });

      // Update matchup frequency
      const key = makeMatchupKey(game.home, game.away);
      matchupFrequency.set(key, (matchupFrequency.get(key) || 0) + 1);
    }
  }

  return allGames;
}

/**
 * Select matchups for a single week, prioritizing least-played matchups.
 */
function generateWeekMatchups(
  teamIds: string[],
  allMatchups: Array<[string, string]>,
  matchupFrequency: Map<string, number>,
  targetCount: number,
  constraints: ScheduleConstraints
): Array<[string, string]> {
  // Sort by frequency (ascending) to prioritize least-played
  const sorted = [...allMatchups].sort((a, b) => {
    const freqA = matchupFrequency.get(makeMatchupKey(a[0], a[1])) || 0;
    const freqB = matchupFrequency.get(makeMatchupKey(b[0], b[1])) || 0;
    return freqA - freqB;
  });

  // If not constraining repeats, shuffle the equally-frequent ones for randomness
  if (!constraints.preventRepeatMatchups) {
    return shuffle(sorted).slice(0, targetCount);
  }

  // Greedily pick matchups ensuring each team doesn't appear too many times
  const teamGameCount = new Map<string, number>();
  teamIds.forEach((id) => teamGameCount.set(id, 0));

  const selected: Array<[string, string]> = [];
  const maxGamesPerTeam = Math.ceil((targetCount * 2) / teamIds.length);

  for (const matchup of sorted) {
    if (selected.length >= targetCount) {
      break;
    }

    const [a, b] = matchup;
    const countA = teamGameCount.get(a) || 0;
    const countB = teamGameCount.get(b) || 0;

    if (countA < maxGamesPerTeam && countB < maxGamesPerTeam) {
      selected.push(matchup);
      teamGameCount.set(a, countA + 1);
      teamGameCount.set(b, countB + 1);
    }
  }

  // Randomize home/away
  return selected.map((m) => (Math.random() > 0.5 ? m : ([m[1], m[0]] as [string, string])));
}

interface AssignedGame {
  home: string;
  away: string;
  timeSlot: string;
  playArea: string;
  slotIndex: number;
  areaIndex: number;
}

/**
 * Assign time slots and play areas to matchups, respecting scheduling rules and rotation.
 */
function assignSlotsAndAreas(
  matchups: Array<[string, string]>,
  timeSlots: string[],
  playAreas: string[],
  schedulingRule: SchedulingRule,
  teamHistory: Map<string, Array<{ slot: number; area: number; week: number }>>,
  constraints: ScheduleConstraints,
  week: number,
  maxGamesPerDay: number
): AssignedGame[] {
  const assigned: AssignedGame[] = [];
  const teamSlotAssignments = new Map<string, number[]>();
  const slotAreaOccupied = new Set<string>(); // "slotIndex:areaIndex"
  const teamDayGameCount = new Map<string, number>();

  for (const [home, away] of matchups) {
    // Check team daily game limits
    const homeCount = teamDayGameCount.get(home) || 0;
    const awayCount = teamDayGameCount.get(away) || 0;
    if (homeCount >= maxGamesPerDay || awayCount >= maxGamesPerDay) {
      continue;
    }

    // Find best slot+area combo
    let bestSlot = -1;
    let bestArea = -1;
    let bestCost = Infinity;

    for (let si = 0; si < timeSlots.length; si++) {
      // Check scheduling rule violations
      if (violatesSchedulingRule(home, si, teamSlotAssignments, schedulingRule)) {
        continue;
      }
      if (violatesSchedulingRule(away, si, teamSlotAssignments, schedulingRule)) {
        continue;
      }

      // Check that neither team is already playing in this time slot
      const homeSlots = teamSlotAssignments.get(home) || [];
      const awaySlots = teamSlotAssignments.get(away) || [];
      if (homeSlots.includes(si) || awaySlots.includes(si)) {
        continue;
      }

      for (let ai = 0; ai < playAreas.length; ai++) {
        const occupiedKey = `${si}:${ai}`;
        if (slotAreaOccupied.has(occupiedKey)) {
          continue;
        }

        const cost =
          rotationCost(home, si, ai, teamHistory, constraints, week) +
          rotationCost(away, si, ai, teamHistory, constraints, week);

        if (cost < bestCost) {
          bestCost = cost;
          bestSlot = si;
          bestArea = ai;
        }
      }
    }

    if (bestSlot === -1 || bestArea === -1) {
      continue;
    } // No valid slot found

    assigned.push({
      home,
      away,
      timeSlot: timeSlots[bestSlot],
      playArea: playAreas[bestArea],
      slotIndex: bestSlot,
      areaIndex: bestArea,
    });

    // Track assignments
    slotAreaOccupied.add(`${bestSlot}:${bestArea}`);

    if (!teamSlotAssignments.has(home)) {
      teamSlotAssignments.set(home, []);
    }
    if (!teamSlotAssignments.has(away)) {
      teamSlotAssignments.set(away, []);
    }
    teamSlotAssignments.get(home)!.push(bestSlot);
    teamSlotAssignments.get(away)!.push(bestSlot);

    teamDayGameCount.set(home, homeCount + 1);
    teamDayGameCount.set(away, awayCount + 1);

    // Update team history for rotation tracking
    const historyEntry = { slot: bestSlot, area: bestArea, week };
    if (!teamHistory.has(home)) {
      teamHistory.set(home, []);
    }
    if (!teamHistory.has(away)) {
      teamHistory.set(away, []);
    }
    teamHistory.get(home)!.push(historyEntry);
    teamHistory.get(away)!.push(historyEntry);
  }

  return assigned;
}

// ─── Weekly Generation (Standings / Swiss) ───────────────────────────────────

/**
 * Generate a single week's schedule based on current standings.
 */
export function generateWeeklySchedule(
  config: SeasonScheduleConfig,
  week: number,
  mode: WeeklyMatchupMode,
  previousGames: GeneratedGame[]
): GeneratedGame[] {
  const { teams, playAreas, timeSlots, schedulingRule, maxGamesPerDay, constraints } = config;

  if (teams.length < 2 || playAreas.length === 0 || timeSlots.length === 0) {
    return [];
  }

  // Build matchup frequency from previous games
  const matchupFrequency = new Map<string, number>();
  for (const game of previousGames) {
    const key = makeMatchupKey(game.homeTeamId, game.awayTeamId);
    matchupFrequency.set(key, (matchupFrequency.get(key) || 0) + 1);
  }

  // Build team history from previous games
  const teamHistory = new Map<string, Array<{ slot: number; area: number; week: number }>>();
  for (const game of previousGames) {
    const slotIndex = timeSlots.indexOf(game.timeSlot);
    const areaIndex = playAreas.indexOf(game.playArea);
    if (slotIndex === -1 || areaIndex === -1) {
      continue;
    }

    const entry = { slot: slotIndex, area: areaIndex, week: game.week };
    if (!teamHistory.has(game.homeTeamId)) {
      teamHistory.set(game.homeTeamId, []);
    }
    if (!teamHistory.has(game.awayTeamId)) {
      teamHistory.set(game.awayTeamId, []);
    }
    teamHistory.get(game.homeTeamId)!.push(entry);
    teamHistory.get(game.awayTeamId)!.push(entry);
  }

  // Generate matchups based on mode
  const matchups =
    mode === 'standings'
      ? generateStandingsMatchups(teams, matchupFrequency, constraints)
      : generateSwissMatchups(teams, matchupFrequency, constraints);

  // Assign slots and areas
  const assigned = assignSlotsAndAreas(
    matchups,
    timeSlots,
    playAreas,
    schedulingRule,
    teamHistory,
    constraints,
    week,
    maxGamesPerDay
  );

  let gameIdCounter = previousGames.length;
  return assigned.map((game) => {
    gameIdCounter++;
    return {
      id: `gen-game-${String(gameIdCounter).padStart(4, '0')}`,
      week,
      homeTeamId: game.home,
      awayTeamId: game.away,
      timeSlot: game.timeSlot,
      playArea: game.playArea,
      dayIndex: 0,
    };
  });
}

/**
 * Standings-based matchups: #1 vs #2, #3 vs #4, etc.
 */
function generateStandingsMatchups(
  teams: TeamStanding[],
  matchupFrequency: Map<string, number>,
  constraints: ScheduleConstraints
): Array<[string, string]> {
  // Sort by win percentage descending, then point differential
  const sorted = [...teams].sort((a, b) => {
    const wpA = a.gamesPlayed > 0 ? a.wins / a.gamesPlayed : 0;
    const wpB = b.gamesPlayed > 0 ? b.wins / b.gamesPlayed : 0;
    if (wpB !== wpA) {
      return wpB - wpA;
    }
    return b.wins - b.losses - (a.wins - a.losses);
  });

  const pairs: Array<[string, string]> = [];
  for (let i = 0; i < sorted.length - 1; i += 2) {
    const pair: [string, string] = [sorted[i].id, sorted[i + 1].id];

    // Check if we should swap to avoid recent repeat
    if (constraints.preventRepeatMatchups) {
      const key = makeMatchupKey(pair[0], pair[1]);
      const freq = matchupFrequency.get(key) || 0;
      // If this matchup has been played recently and we can swap with the next pair
      if (freq > 0 && i + 3 < sorted.length) {
        const altKey = makeMatchupKey(sorted[i].id, sorted[i + 2].id);
        const altFreq = matchupFrequency.get(altKey) || 0;
        if (altFreq < freq) {
          pairs.push([sorted[i].id, sorted[i + 2].id]);
          pairs.push([sorted[i + 1].id, sorted[i + 3].id]);
          i += 2; // skip next pair since we used them
          continue;
        }
      }
    }

    pairs.push(pair);
  }

  return pairs;
}

/**
 * Swiss-style matchups: teams with similar win% play each other.
 */
function generateSwissMatchups(
  teams: TeamStanding[],
  matchupFrequency: Map<string, number>,
  constraints: ScheduleConstraints
): Array<[string, string]> {
  // Group by win percentage buckets (within 0.15 of each other)
  const sorted = [...teams].sort((a, b) => {
    const wpA = a.gamesPlayed > 0 ? a.wins / a.gamesPlayed : 0;
    const wpB = b.gamesPlayed > 0 ? b.wins / b.gamesPlayed : 0;
    return wpB - wpA;
  });

  const pairs: Array<[string, string]> = [];
  const used = new Set<string>();

  for (let i = 0; i < sorted.length; i++) {
    if (used.has(sorted[i].id)) {
      continue;
    }

    const wpI = sorted[i].gamesPlayed > 0 ? sorted[i].wins / sorted[i].gamesPlayed : 0;
    let bestMatch = -1;
    let bestScore = Infinity;

    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(sorted[j].id)) {
        continue;
      }

      const wpJ = sorted[j].gamesPlayed > 0 ? sorted[j].wins / sorted[j].gamesPlayed : 0;
      const wpDiff = Math.abs(wpI - wpJ);

      let score = wpDiff * 100;

      if (constraints.preventRepeatMatchups) {
        const key = makeMatchupKey(sorted[i].id, sorted[j].id);
        score += (matchupFrequency.get(key) || 0) * 50;
      }

      if (score < bestScore) {
        bestScore = score;
        bestMatch = j;
      }
    }

    if (bestMatch !== -1) {
      pairs.push([sorted[i].id, sorted[bestMatch].id]);
      used.add(sorted[i].id);
      used.add(sorted[bestMatch].id);
    }
  }

  return pairs;
}

// ─── Calculation Helpers ─────────────────────────────────────────────────────

export interface GameCalculation {
  teamsPerDivision: number;
  playAreaCount: number;
  timeSlotsPerDay: number;
  gamesPerTimeSlot: number;
  maxGamesPerTeamPerDay: number;
  gamesPerTeamPerWeek: number;
  totalGamesPerWeek: number;
  totalSeasonGames: number;
}

/**
 * Calculate game totals based on schedule configuration.
 */
export function calculateGameTotals(
  teamCount: number,
  playAreaCount: number,
  timeSlotCount: number,
  totalWeeks: number,
  maxGamesPerDay: number
): GameCalculation {
  if (teamCount < 2 || playAreaCount === 0 || timeSlotCount === 0) {
    return {
      teamsPerDivision: teamCount,
      playAreaCount,
      timeSlotsPerDay: timeSlotCount,
      gamesPerTimeSlot: playAreaCount,
      maxGamesPerTeamPerDay: maxGamesPerDay,
      gamesPerTeamPerWeek: 0,
      totalGamesPerWeek: 0,
      totalSeasonGames: 0,
    };
  }

  const gamesPerTimeSlot = playAreaCount;
  const totalGamesPerWeek = Math.min(
    timeSlotCount * gamesPerTimeSlot,
    Math.floor(teamCount / 2) * maxGamesPerDay
  );
  const gamesPerTeamPerWeek = Math.min(
    Math.floor((totalGamesPerWeek * 2) / teamCount),
    maxGamesPerDay
  );
  const totalSeasonGames = totalGamesPerWeek * totalWeeks;

  return {
    teamsPerDivision: teamCount,
    playAreaCount,
    timeSlotsPerDay: timeSlotCount,
    gamesPerTimeSlot,
    maxGamesPerTeamPerDay: maxGamesPerDay,
    gamesPerTeamPerWeek,
    totalGamesPerWeek,
    totalSeasonGames,
  };
}
