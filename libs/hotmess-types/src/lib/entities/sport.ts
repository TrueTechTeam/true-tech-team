import type { BaseEntity } from './base';

/**
 * Configuration for how a sport is played and scored.
 */
export interface SportConfig {
  /** Number of players per team */
  teamSize: number;
  /** Minimum players required to play */
  minPlayers: number;
  /** Duration of a game in minutes */
  gameDurationMinutes: number;
  /** Name of the play area (field, court, lane, etc.) */
  playAreaName: string;
  /** How points are tracked */
  scoringType: 'points' | 'sets' | 'frames' | 'custom';
  /** Rules for determining team rankings */
  rankingRules: RankingRule[];
}

/**
 * Rule for calculating team rankings.
 */
export interface RankingRule {
  field:
    | 'wins'
    | 'losses'
    | 'ties'
    | 'pointsFor'
    | 'pointsAgainst'
    | 'pointDifferential'
    | 'headToHead';
  order: 'asc' | 'desc';
  priority: number;
}

/**
 * A sport offered by Hotmess Sports.
 */
export interface Sport extends BaseEntity {
  name: string;
  description?: string;
  iconUrl?: string;
  rulebookUrl?: string;
  config: SportConfig;
  isActive: boolean;
}
