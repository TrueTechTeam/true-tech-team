import type { BaseEntity } from './base';
import type { Division } from './division';
import type { Team } from './team';
import type { Venue } from './game';

/**
 * Type of tournament bracket.
 */
export enum BracketType {
  SingleElimination = 'single_elimination',
  DoubleElimination = 'double_elimination',
  RoundRobin = 'round_robin',
}

/**
 * A tournament bracket for end-of-season playoffs.
 */
export interface Bracket extends BaseEntity {
  divisionId: string;
  type: BracketType;
  name: string;
  /** Number of teams in the bracket */
  teamCount: number;

  // Relations
  division?: Division;
  matches?: BracketMatch[];
}

/**
 * A single match within a bracket.
 */
export interface BracketMatch extends BaseEntity {
  bracketId: string;
  round: number;
  position: number;

  // Teams (null if TBD based on previous matches)
  team1Id?: string;
  team2Id?: string;

  // Where winner/loser advances to
  winnerNextMatchId?: string;
  loserNextMatchId?: string; // For double elimination

  // Scheduling
  venueId?: string;
  playArea?: string;
  scheduledAt?: Date;

  // Results
  team1Score?: number;
  team2Score?: number;
  winnerId?: string;

  // Relations
  bracket?: Bracket;
  team1?: Team;
  team2?: Team;
  venue?: Venue;
}
