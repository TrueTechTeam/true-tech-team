import type { BaseEntity } from './base';
import type { SeasonStatus } from '../enums';
import type { League } from './league';
import type { Division } from './division';
import type { User } from './user';

/**
 * Configuration for schedule generation.
 */
export interface ScheduleConfig {
  /** Day(s) of week games are played (0=Sunday, 6=Saturday) */
  gameDays: number[];
  /** Available time slots */
  timeSlots: string[];
  /** Number of weeks in regular season */
  totalWeeks: number;
  /** Dates with no games (holidays, etc.) */
  blackoutDates: Date[];
  /** Tournament date */
  tournamentDate: Date;
  /** Makeup dates for weather cancellations */
  makeupDates: Date[];
  /** Minimum time between games for same team (in hours) */
  minTimeBetweenGames: number;
  /** Maximum games per team per day */
  maxGamesPerDay: number;
}

/**
 * A season of play within a league.
 * Example: Fall 2024 Miami Kickball
 */
export interface Season extends BaseEntity {
  leagueId: string;
  managerId?: string;
  name: string;
  status: SeasonStatus;
  registrationStartDate: Date;
  registrationEndDate: Date;
  seasonStartDate: Date;
  seasonEndDate: Date;
  scheduleConfig: ScheduleConfig;

  // Relations
  league?: League;
  manager?: User;
  divisions?: Division[];
}
