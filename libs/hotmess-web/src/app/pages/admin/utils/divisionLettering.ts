import type { BracketMatch } from '../../../../hooks/useBracketMatches';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Assign sequential letters (A, B, C...) to divisions based on display order.
 * Returns a map from division/bracket ID to letter.
 */
export function assignDivisionLetters(orderedIds: string[]): Map<string, string> {
  const map = new Map<string, string>();
  orderedIds.forEach((id, idx) => {
    map.set(id, LETTERS[idx] || `D${idx + 1}`);
  });
  return map;
}

/**
 * Get the division letter for a bracket ID.
 */
export function getDivisionLetter(bracketId: string, letterMap: Map<string, string>): string {
  return letterMap.get(bracketId) || '?';
}

export interface MatchWithGameId extends BracketMatch {
  gameId: string;
  divisionLetter: string;
  divisionName: string;
  gameIndex: number;
}

/**
 * Assign game IDs to all matches across all divisions.
 * Games within each division are numbered sequentially by round then position.
 * e.g., A1, A2, A3 for division A; B1, B2 for division B.
 */
export function assignGameIds(
  matchesByBracket: Map<string, BracketMatch[]>,
  bracketIdToDivisionName: Map<string, string>,
  letterMap: Map<string, string>
): MatchWithGameId[] {
  const result: MatchWithGameId[] = [];

  for (const [bracketId, matches] of matchesByBracket) {
    const letter = letterMap.get(bracketId) || '?';
    const divisionName = bracketIdToDivisionName.get(bracketId) || 'Division';

    // Sort matches by round then position for sequential numbering
    const sorted = [...matches].sort((a, b) =>
      a.round !== b.round ? a.round - b.round : a.position - b.position
    );

    sorted.forEach((match, idx) => {
      result.push({
        ...match,
        gameId: `${letter}${idx + 1}`,
        divisionLetter: letter,
        divisionName,
        gameIndex: idx + 1,
      });
    });
  }

  return result;
}

/**
 * Build a lookup from match ID to game ID.
 */
export function buildGameIdLookup(matchesWithIds: MatchWithGameId[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of matchesWithIds) {
    map.set(m.id, m.gameId);
  }
  return map;
}

/**
 * Get the "winner goes to" game ID for a match.
 */
export function getWinnerGoesToGameId(
  match: BracketMatch,
  gameIdLookup: Map<string, string>
): string | null {
  if (!match.winner_next_match_id) {
    return null;
  }
  return gameIdLookup.get(match.winner_next_match_id) || null;
}

/**
 * Build a reverse lookup: for each match ID, which game IDs feed into its
 * team1 (home) and team2 (away) slots.
 *
 * Convention: even-position feeders fill team1 (home), odd-position fill team2 (away).
 */
export function buildFeederLookup(
  matches: MatchWithGameId[]
): Map<string, { homeFeeder?: string; awayFeeder?: string }> {
  const lookup = new Map<string, { homeFeeder?: string; awayFeeder?: string }>();

  for (const match of matches) {
    if (!match.winner_next_match_id) {
      continue;
    }

    const existing = lookup.get(match.winner_next_match_id) || {};
    if (match.position % 2 === 0) {
      existing.homeFeeder = match.gameId;
    } else {
      existing.awayFeeder = match.gameId;
    }
    lookup.set(match.winner_next_match_id, existing);
  }

  return lookup;
}
