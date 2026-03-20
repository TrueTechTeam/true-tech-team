import type { BracketMatch } from '../../../../hooks/useBracketMatches';

export interface MatchPosition {
  x: number;
  y: number;
  match: BracketMatch;
}

export interface RoundColumn {
  round: number;
  x: number;
  matches: MatchPosition[];
}

export interface BracketLayout {
  rounds: RoundColumn[];
  width: number;
  height: number;
}

// Layout constants
export const MATCH_CARD_WIDTH = 240;
export const ROUND_WIDTH = 300;
export const MATCH_HEIGHT = 100;
export const VERTICAL_SPACING = 24;
export const HORIZONTAL_PADDING = 50;
export const VERTICAL_PADDING = 50;

// Y center of the team rows area (excludes the matchInfo bar at bottom).
// Two team rows (~34px each) + divider (1px) ≈ 69px. Center ≈ 35px from top.
export const TEAM_AREA_CENTER_Y = 35;

/**
 * Group matches by round number
 */
export function groupByRound(matches: BracketMatch[]): Map<number, BracketMatch[]> {
  const grouped = new Map<number, BracketMatch[]>();

  for (const match of matches) {
    if (!grouped.has(match.round)) {
      grouped.set(match.round, []);
    }
    const roundArr = grouped.get(match.round);
    if (roundArr) {
      roundArr.push(match);
    }
  }

  // Sort matches within each round by position
  for (const [, roundMatches] of grouped) {
    roundMatches.sort((a, b) => a.position - b.position);
  }

  return grouped;
}

/**
 * Build reverse lookup: for each match, find its "parent" feeder matches
 * (matches whose winner_next_match_id points to this match).
 */
function buildParentMap(matches: BracketMatch[]): Map<string, BracketMatch[]> {
  const parentMap = new Map<string, BracketMatch[]>();

  for (const match of matches) {
    if (match.winner_next_match_id) {
      if (!parentMap.has(match.winner_next_match_id)) {
        parentMap.set(match.winner_next_match_id, []);
      }
      const parents = parentMap.get(match.winner_next_match_id);
      if (parents) {
        parents.push(match);
      }
    }
  }

  return parentMap;
}

/**
 * Detect if the bracket has a losers bracket (double elimination).
 * Losers bracket matches have round numbers higher than the winners bracket.
 */
function separateBrackets(matches: BracketMatch[]): {
  winnersMatches: BracketMatch[];
  losersMatches: BracketMatch[];
  grandFinal: BracketMatch | null;
} {
  const hasLoserLinks = matches.some((m) => m.loser_next_match_id);

  if (!hasLoserLinks) {
    return { winnersMatches: matches, losersMatches: [], grandFinal: null };
  }

  // For double elimination, determine the winners bracket round count
  // Winners bracket rounds are the ones where matches have loser_next_match_id
  const matchesWithLoserLinks = matches.filter((m) => m.loser_next_match_id);
  const maxWinnersRound = Math.max(...matchesWithLoserLinks.map((m) => m.round));
  // The winners bracket final is one round above the highest round with loser links
  const winnersRounds = maxWinnersRound + 1;

  const winnersMatches = matches.filter((m) => m.round <= winnersRounds);
  const remainingMatches = matches.filter((m) => m.round > winnersRounds);

  // Grand final is the last round
  const maxRound = Math.max(...matches.map((m) => m.round));
  const grandFinalMatches = remainingMatches.filter((m) => m.round === maxRound);
  const losersMatches = remainingMatches.filter((m) => m.round < maxRound);

  return {
    winnersMatches,
    losersMatches,
    grandFinal: grandFinalMatches[0] || null,
  };
}

/**
 * Calculate positions for a set of matches using parent-centered layout.
 * First round matches are evenly spaced; each later round match is centered
 * between its two feeder matches.
 */
function layoutBracketSection(
  matches: BracketMatch[],
  xOffset: number,
  yOffset: number
): { positions: Map<string, MatchPosition>; rounds: RoundColumn[]; height: number } {
  if (matches.length === 0) {
    return { positions: new Map(), rounds: [], height: 0 };
  }

  const grouped = groupByRound(matches);
  const roundNumbers = Array.from(grouped.keys()).sort((a, b) => a - b);
  const parentMap = buildParentMap(matches);
  const positions = new Map<string, MatchPosition>();

  // Position first round: evenly spaced vertically
  const firstRoundMatches = grouped.get(roundNumbers[0]) || [];
  const firstRoundStep = MATCH_HEIGHT + VERTICAL_SPACING;

  for (let i = 0; i < firstRoundMatches.length; i++) {
    const match = firstRoundMatches[i];
    positions.set(match.id, {
      x: xOffset + HORIZONTAL_PADDING,
      y: yOffset + VERTICAL_PADDING + i * firstRoundStep,
      match,
    });
  }

  // Position subsequent rounds: center between parent matches
  for (let roundIdx = 1; roundIdx < roundNumbers.length; roundIdx++) {
    const roundNum = roundNumbers[roundIdx];
    const roundMatches = grouped.get(roundNum) || [];
    const x = xOffset + HORIZONTAL_PADDING + roundIdx * ROUND_WIDTH;

    for (let i = 0; i < roundMatches.length; i++) {
      const match = roundMatches[i];
      const parents = parentMap.get(match.id) || [];

      let y: number;

      if (parents.length === 2) {
        // Center between the two parent matches
        const parent1Pos = positions.get(parents[0].id);
        const parent2Pos = positions.get(parents[1].id);

        if (parent1Pos && parent2Pos) {
          const parent1Center = parent1Pos.y + TEAM_AREA_CENTER_Y;
          const parent2Center = parent2Pos.y + TEAM_AREA_CENTER_Y;
          y = (parent1Center + parent2Center) / 2 - TEAM_AREA_CENTER_Y;
        } else {
          // Fallback: use exponential spacing
          y = yOffset + VERTICAL_PADDING + i * firstRoundStep * Math.pow(2, roundIdx);
        }
      } else if (parents.length === 1) {
        // Bye case: align with the single parent for now;
        // a post-processing step below will offset the parent match.
        const parentPos = positions.get(parents[0].id);
        y = parentPos
          ? parentPos.y
          : yOffset + VERTICAL_PADDING + i * firstRoundStep * Math.pow(2, roundIdx);
      } else {
        // No parents found — use spacing based on position in round
        y = yOffset + VERTICAL_PADDING + i * firstRoundStep * Math.pow(2, roundIdx);
      }

      positions.set(match.id, { x, y, match });
    }
  }

  // Post-process: offset feeder matches in bye scenarios.
  // When a later-round match has exactly 1 parent (bye case), the feeder match
  // should be visually offset so it doesn't sit at the same Y as the child.
  for (let roundIdx = 1; roundIdx < roundNumbers.length; roundIdx++) {
    const roundNum = roundNumbers[roundIdx];
    const roundMatches = grouped.get(roundNum) || [];

    for (const match of roundMatches) {
      const parents = parentMap.get(match.id) || [];
      if (parents.length !== 1) {
        continue;
      }

      const parent = parents[0];
      const parentPos = positions.get(parent.id);
      if (!parentPos) {
        continue;
      }

      // Offset the parent (feeder) match away from the child.
      // Lower feeder (odd position) → move down; upper feeder (even) → move up.
      const offset = firstRoundStep / 2;
      if (parent.position % 2 === 1) {
        parentPos.y += offset;
      } else {
        parentPos.y = Math.max(yOffset, parentPos.y - offset);
      }
    }
  }

  // Build round columns
  const rounds: RoundColumn[] = roundNumbers.map((roundNum, roundIdx) => {
    const roundMatchList = grouped.get(roundNum) || [];
    return {
      round: roundNum,
      x: xOffset + HORIZONTAL_PADDING + roundIdx * ROUND_WIDTH,
      matches: roundMatchList
        .map((m) => positions.get(m.id))
        .filter((pos): pos is MatchPosition => !!pos),
    };
  });

  // Calculate height
  let maxY = 0;
  for (const pos of positions.values()) {
    const bottom = pos.y + MATCH_HEIGHT;
    if (bottom > maxY) {
      maxY = bottom;
    }
  }

  return { positions, rounds, height: maxY + VERTICAL_PADDING - yOffset };
}

/**
 * Calculate positions for all matches in a bracket.
 * Handles single elimination, double elimination, and round robin.
 */
export function calculateMatchPositions(matches: BracketMatch[]): BracketLayout {
  console.warn(
    '[bracketLayout] calculateMatchPositions called with',
    matches.length,
    'matches:',
    matches.map((m) => ({
      id: m.id,
      round: m.round,
      pos: m.position,
      team1: m.team1?.name ?? m.team1_id ?? 'TBD',
      team2: m.team2?.name ?? m.team2_id ?? 'TBD',
      winner_next: m.winner_next_match_id,
      loser_next: m.loser_next_match_id,
    }))
  );

  if (matches.length === 0) {
    return { rounds: [], width: 0, height: 0 };
  }

  const { winnersMatches, losersMatches, grandFinal } = separateBrackets(matches);
  console.warn('[bracketLayout] separated brackets:', {
    winners: winnersMatches.length,
    losers: losersMatches.length,
    grandFinal: !!grandFinal,
  });

  // Layout winners bracket
  const winners = layoutBracketSection(winnersMatches, 0, 0);

  if (losersMatches.length === 0 && !grandFinal) {
    // Single elimination or round robin
    const roundCount = winners.rounds.length;
    const layout = {
      rounds: winners.rounds,
      width: HORIZONTAL_PADDING * 2 + roundCount * ROUND_WIDTH,
      height: winners.height,
    };
    console.warn('[bracketLayout] single elimination layout:', {
      roundCount,
      width: layout.width,
      height: layout.height,
      roundDetails: layout.rounds.map((r) => ({
        round: r.round,
        x: r.x,
        matchCount: r.matches.length,
        matchPositions: r.matches.map((m) => ({
          id: m.match.id,
          x: m.x,
          y: m.y,
          team1: m.match.team1?.name ?? m.match.team1_id ?? 'TBD',
          team2: m.match.team2?.name ?? m.match.team2_id ?? 'TBD',
        })),
      })),
    });
    return layout;
  }

  // Double elimination: layout losers bracket below winners
  const losersYOffset = winners.height + 40;
  const losers = layoutBracketSection(losersMatches, 0, losersYOffset);

  // Combine rounds
  const allRounds = [...winners.rounds];

  // Merge losers rounds into existing columns where possible, or add new ones
  for (const losersRound of losers.rounds) {
    allRounds.push(losersRound);
  }

  // Grand final
  if (grandFinal) {
    const lastWinnersRound = winners.rounds[winners.rounds.length - 1];
    const lastLosersRound =
      losers.rounds.length > 0 ? losers.rounds[losers.rounds.length - 1] : null;

    const gfX = Math.max(
      lastWinnersRound ? lastWinnersRound.x + ROUND_WIDTH : 0,
      lastLosersRound ? lastLosersRound.x + ROUND_WIDTH : 0
    );

    const winnersLastPos = lastWinnersRound?.matches[lastWinnersRound.matches.length - 1];
    const losersLastPos = lastLosersRound?.matches[lastLosersRound.matches.length - 1];

    let gfY: number;
    if (winnersLastPos && losersLastPos) {
      gfY = (winnersLastPos.y + losersLastPos.y + MATCH_HEIGHT) / 2 - TEAM_AREA_CENTER_Y;
    } else {
      gfY = losersYOffset / 2;
    }

    allRounds.push({
      round: grandFinal.round,
      x: gfX,
      matches: [{ x: gfX, y: gfY, match: grandFinal }],
    });
  }

  // Calculate total dimensions
  let maxX = 0;
  let maxY = 0;
  for (const round of allRounds) {
    for (const m of round.matches) {
      if (m.x + MATCH_CARD_WIDTH > maxX) {
        maxX = m.x + MATCH_CARD_WIDTH;
      }
      if (m.y + MATCH_HEIGHT > maxY) {
        maxY = m.y + MATCH_HEIGHT;
      }
    }
  }

  return {
    rounds: allRounds,
    width: maxX + HORIZONTAL_PADDING,
    height: maxY + VERTICAL_PADDING,
  };
}

/**
 * Get bracket-style connector paths between matches.
 * Uses right-angle bracket lines: horizontal out -> vertical merge -> horizontal in.
 */
export function getConnectorPaths(layout: BracketLayout): Array<{
  path: string;
  type: 'winner' | 'loser';
}> {
  const paths: Array<{ path: string; type: 'winner' | 'loser' }> = [];

  // Build a flat lookup of all match positions by match ID
  const positionMap = new Map<string, MatchPosition>();
  for (const round of layout.rounds) {
    for (const matchPos of round.matches) {
      positionMap.set(matchPos.match.id, matchPos);
    }
  }

  console.warn('[bracketLayout] getConnectorPaths: positionMap has', positionMap.size, 'entries');

  for (const round of layout.rounds) {
    for (const matchPos of round.matches) {
      const match = matchPos.match;

      if (match.winner_next_match_id) {
        const nextPos = positionMap.get(match.winner_next_match_id);
        if (nextPos) {
          paths.push({
            path: buildBracketConnector(matchPos, nextPos),
            type: 'winner',
          });
        } else {
          console.warn(
            '[bracketLayout] connector MISSING: match',
            match.id,
            'winner_next_match_id',
            match.winner_next_match_id,
            'not found in positionMap'
          );
        }
      }

      if (match.loser_next_match_id) {
        const nextPos = positionMap.get(match.loser_next_match_id);
        if (nextPos) {
          paths.push({
            path: buildBracketConnector(matchPos, nextPos),
            type: 'loser',
          });
        } else {
          console.warn(
            '[bracketLayout] connector MISSING: match',
            match.id,
            'loser_next_match_id',
            match.loser_next_match_id,
            'not found in positionMap'
          );
        }
      }
    }
  }

  console.warn('[bracketLayout] generated', paths.length, 'connector paths');

  return paths;
}

/**
 * Build a bracket-style connector path between two matches.
 * The path goes: right edge of source -> horizontal to midpoint ->
 * vertical to target center -> horizontal to left edge of target.
 */
function buildBracketConnector(from: MatchPosition, to: MatchPosition): string {
  const startX = from.x + MATCH_CARD_WIDTH;
  const startY = from.y + TEAM_AREA_CENTER_Y;
  const endX = to.x;
  const endY = to.y + TEAM_AREA_CENTER_Y;
  const midX = (startX + endX) / 2;

  return `M ${startX} ${startY} H ${midX} V ${endY} H ${endX}`;
}

// Keep legacy exports for backward compatibility
export function getConnectorPath(fromMatch: MatchPosition, toMatch: MatchPosition): string {
  return buildBracketConnector(fromMatch, toMatch);
}
