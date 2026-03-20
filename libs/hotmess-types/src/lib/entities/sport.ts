import type { BaseEntity } from './base';

/**
 * Scheduling rule for back-to-back games within a single game day.
 * - no_rules: teams can play consecutive time slots
 * - one_game_break: exactly one time slot gap between games
 * - not_back_to_back: at least one time slot gap between games
 * - any_schedule: flexible, try to space out but no hard constraint
 */
export type SchedulingRule = 'no_rules' | 'one_game_break' | 'not_back_to_back' | 'any_schedule';

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
  /** Scheduling rule for back-to-back games */
  schedulingRule?: SchedulingRule;
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
