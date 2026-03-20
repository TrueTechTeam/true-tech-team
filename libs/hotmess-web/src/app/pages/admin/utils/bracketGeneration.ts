import type { Team } from '@true-tech-team/hotmess-types';

export interface SeededTeam extends Team {
  seed: number;
}

export interface BracketMatchInput {
  round: number;
  position: number;
  team1Id?: string;
  team2Id?: string;
  winnerNextMatchId?: string;
  loserNextMatchId?: string;
}

/**
 * Calculate team seeding based on regular season performance.
 * Teams are ranked by:
 * 1. Most wins
 * 2. Best win percentage
 * 3. Best point differential
 */
export function calculateSeeding(teams: Team[]): SeededTeam[] {
  const sorted = [...teams].sort((a, b) => {
    // 1. Most wins
    if (b.wins !== a.wins) {return b.wins - a.wins;}

    // 2. Best win percentage
    const aTotalGames = a.wins + a.losses + a.ties;
    const bTotalGames = b.wins + b.losses + b.ties;
    const aWinPct = aTotalGames > 0 ? a.wins / aTotalGames : 0;
    const bWinPct = bTotalGames > 0 ? b.wins / bTotalGames : 0;
    if (bWinPct !== aWinPct) {return bWinPct - aWinPct;}

    // 3. Best point differential
    const aPointDiff = a.pointsFor - a.pointsAgainst;
    const bPointDiff = b.pointsFor - b.pointsAgainst;
    return bPointDiff - aPointDiff;
  });

  return sorted.map((team, index) => ({
    ...team,
    seed: index + 1,
  }));
}

/**
 * Generate a single elimination bracket.
 * Higher seeds play lower seeds in first round (1 vs 8, 2 vs 7, etc.)
 * Handles byes for non-power-of-2 team counts by advancing bye teams to round 2.
 */
export function generateSingleElimination(teams: SeededTeam[]): BracketMatchInput[] {
  console.warn('[bracketGeneration] generateSingleElimination called with', teams.length, 'teams:', teams.map((t) => ({ id: t.id, name: t.name, seed: t.seed })));

  if (teams.length <= 1) {
    console.warn('[bracketGeneration] <= 1 team, returning empty');
    return [];
  }

  const matches: BracketMatchInput[] = [];
  const totalRounds = Math.ceil(Math.log2(teams.length));
  const bracketSize = Math.pow(2, totalRounds);

  console.warn('[bracketGeneration] totalRounds:', totalRounds, 'bracketSize:', bracketSize, 'byes:', bracketSize - teams.length);

  // Create first round matchups with bracket seeding
  const firstRoundTeams = [...teams];
  // Add byes if needed to fill bracket to a power of 2
  while (firstRoundTeams.length < bracketSize) {
    firstRoundTeams.push(null as unknown as SeededTeam);
  }

  // Standard bracket seeding: 1v8, 4v5, 2v7, 3v6 (for 8-team bracket)
  const seedPairs = createSeedPairs(bracketSize);
  console.warn('[bracketGeneration] seedPairs:', seedPairs);

  for (let i = 0; i < seedPairs.length; i++) {
    const [seed1, seed2] = seedPairs[i];
    const team1 = firstRoundTeams[seed1 - 1];
    const team2 = firstRoundTeams[seed2 - 1];

    matches.push({
      round: 1,
      position: i,
      team1Id: team1?.id,
      team2Id: team2?.id,
    });
  }

  console.warn('[bracketGeneration] first round matches:', matches.map((m) => ({
    pos: m.position,
    team1: m.team1Id ?? 'BYE',
    team2: m.team2Id ?? 'BYE',
  })));

  // Create subsequent rounds with TBD teams
  for (let round = 2; round <= totalRounds; round++) {
    const roundMatches = Math.pow(2, totalRounds - round);

    for (let pos = 0; pos < roundMatches; pos++) {
      matches.push({
        round,
        position: pos,
        team1Id: undefined,
        team2Id: undefined,
      });
    }
  }

  // Link matches: set winnerNextMatchId for each match
  for (const match of matches) {
    if (match.round < totalRounds) {
      const nextRoundPosition = Math.floor(match.position / 2);
      const nextMatch = matches.find(
        (m) => m.round === match.round + 1 && m.position === nextRoundPosition
      );
      if (nextMatch) {
        match.winnerNextMatchId = `temp-${nextMatch.round}-${nextMatch.position}`;
      }
    }
  }

  // Process byes: advance teams with first-round byes directly to round 2
  const byeMatches = matches.filter(
    (m) => m.round === 1 && m.team1Id && !m.team2Id
  );
  console.warn('[bracketGeneration] byeMatches:', byeMatches.length, byeMatches.map((m) => ({ pos: m.position, team: m.team1Id })));

  for (const byeMatch of byeMatches) {
    const nextRoundPos = Math.floor(byeMatch.position / 2);
    const nextMatch = matches.find(
      (m) => m.round === 2 && m.position === nextRoundPos
    );
    if (nextMatch) {
      // Even positions feed into team1 slot, odd positions feed into team2 slot
      if (byeMatch.position % 2 === 0) {
        nextMatch.team1Id = byeMatch.team1Id;
        console.warn('[bracketGeneration] bye: advanced', byeMatch.team1Id, '→ R2P' + nextRoundPos + ' team1');
      } else {
        nextMatch.team2Id = byeMatch.team1Id;
        console.warn('[bracketGeneration] bye: advanced', byeMatch.team1Id, '→ R2P' + nextRoundPos + ' team2');
      }
    }
  }

  // Remove bye matches from the bracket (they don't need to be played)
  const result = matches.filter(
    (m) => !(m.round === 1 && m.team1Id && !m.team2Id)
  );

  console.warn('[bracketGeneration] final matches:', result.length, result.map((m) => ({
    round: m.round,
    pos: m.position,
    team1: m.team1Id ?? 'TBD',
    team2: m.team2Id ?? 'TBD',
    winnerNext: m.winnerNextMatchId,
  })));

  return result;
}

/**
 * Generate standard bracket seeding pairs using the fold algorithm.
 * For 4 teams: [[1,4], [2,3]]
 * For 8 teams: [[1,8], [4,5], [2,7], [3,6]]
 * This ensures higher seeds are on opposite sides of the bracket so they
 * meet in later rounds (e.g., 1 and 2 seeds meet in the final, not semis).
 */
function createSeedPairs(bracketSize: number): number[][] {
  // Build seed placement using the standard "fold" algorithm:
  // Start with [1], then repeatedly expand by pairing each seed with its
  // complement (bracketSize + 1 - seed) at each doubling step.
  let seeds = [1];
  let size = 1;

  while (size < bracketSize) {
    size *= 2;
    const expanded: number[] = [];
    for (const s of seeds) {
      expanded.push(s, size + 1 - s);
    }
    seeds = expanded;
  }

  // Group adjacent seeds into match pairs
  const pairs: number[][] = [];
  for (let i = 0; i < seeds.length; i += 2) {
    pairs.push([seeds[i], seeds[i + 1]]);
  }

  return pairs;
}

/**
 * Generate a double elimination bracket.
 * Creates both winners and losers brackets.
 */
export function generateDoubleElimination(teams: SeededTeam[]): BracketMatchInput[] {
  if (teams.length === 0) {return [];}

  const matches: BracketMatchInput[] = [];

  // Generate winners bracket (same as single elimination)
  const winnersMatches = generateSingleElimination(teams);
  matches.push(...winnersMatches);

  const totalRounds = Math.ceil(Math.log2(teams.length));

  // Generate losers bracket
  // Losers bracket has 2*(rounds-1) rounds
  const loserRounds = 2 * (totalRounds - 1);

  for (let round = 1; round <= loserRounds; round++) {
    const isDropdownRound = round % 2 === 1; // Odd rounds receive losers from winners bracket
    const matchCount = isDropdownRound
      ? Math.pow(2, totalRounds - Math.ceil(round / 2) - 1)
      : Math.pow(2, totalRounds - Math.ceil(round / 2));

    for (let pos = 0; pos < matchCount; pos++) {
      matches.push({
        round: totalRounds + round, // Offset to distinguish from winners bracket
        position: pos,
        team1Id: undefined, // TBD
        team2Id: undefined, // TBD
      });
    }
  }

  // Link losers from winners bracket to losers bracket
  for (const match of winnersMatches) {
    if (match.round < totalRounds) {
      // Losers drop to losers bracket
      const loserRound = totalRounds + (match.round * 2 - 1);
      const loserMatch = matches.find(
        (m) => m.round === loserRound && m.position === Math.floor(match.position / 2)
      );
      if (loserMatch) {
        match.loserNextMatchId = `temp-${loserMatch.round}-${loserMatch.position}`;
      }
    }
  }

  // Grand finals
  matches.push({
    round: totalRounds + loserRounds + 1,
    position: 0,
    team1Id: undefined, // Winner of winners bracket
    team2Id: undefined, // Winner of losers bracket
  });

  return matches;
}

/**
 * Generate a round robin bracket.
 * Every team plays every other team once.
 */
export function generateRoundRobin(teams: SeededTeam[]): BracketMatchInput[] {
  const matches: BracketMatchInput[] = [];
  let position = 0;

  // Round robin: each team plays every other team
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const round = Math.floor(position / (teams.length / 2)) + 1;
      matches.push({
        round,
        position: position % (teams.length / 2),
        team1Id: teams[i].id,
        team2Id: teams[j].id,
      });
      position++;
    }
  }

  return matches;
}
