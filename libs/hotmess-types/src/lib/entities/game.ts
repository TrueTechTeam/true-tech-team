import type { BaseEntity } from './base';
import type { GameStatus } from '../enums';
import type { Division } from './division';
import type { Team } from './team';
import type { User } from './user';

/**
 * A play location (field, court, lane, etc.).
 */
export interface Venue extends BaseEntity {
  cityId: string;
  name: string;
  address?: string;
  /** Name of individual play areas within the venue */
  playAreas: string[];
  mapUrl?: string;
}

/**
 * A scheduled game between two teams.
 */
export interface Game extends BaseEntity {
  divisionId: string;
  homeTeamId: string;
  awayTeamId: string;
  refereeId?: string;
  venueId: string;
  playArea: string;

  scheduledAt: Date;
  status: GameStatus;

  // Scores (null until game is completed)
  homeScore?: number;
  awayScore?: number;

  // Relations
  division?: Division;
  homeTeam?: Team;
  awayTeam?: Team;
  referee?: User;
  venue?: Venue;
}

/**
 * Input for updating game score.
 */
export interface UpdateGameScoreInput {
  gameId: string;
  homeScore: number;
  awayScore: number;
}
