import type { BaseEntity } from './base';
import type { Season } from './season';
import type { User } from './user';

/**
 * Eligibility rules for a superlative category.
 */
export interface SuperlativeEligibility {
  /** Must be a rookie (first season) */
  rookiesOnly?: boolean;
  /** Minimum games played */
  minGamesPlayed?: number;
  /** Specific roles allowed */
  allowedRoles?: string[];
}

/**
 * A superlative category for end-of-season voting.
 * Example: "MVP", "Best Dressed", "Most Improved"
 */
export interface SuperlativeCategory extends BaseEntity {
  seasonId: string;
  name: string;
  description?: string;
  eligibility: SuperlativeEligibility;
  /** Order in which categories appear */
  displayOrder: number;

  // Relations
  season?: Season;
  nominations?: SuperlativeNomination[];
}

/**
 * Status of the superlative voting process.
 */
export enum SuperlativePhase {
  /** Not yet started */
  NotStarted = 'not_started',
  /** Team captains are submitting nominations */
  Nominations = 'nominations',
  /** All players are voting */
  Voting = 'voting',
  /** Voting closed, results available */
  Completed = 'completed',
}

/**
 * A nomination for a superlative category.
 */
export interface SuperlativeNomination extends BaseEntity {
  categoryId: string;
  nomineeId: string;
  nominatedById: string;
  /** Team that nominated this player */
  teamId: string;

  // Relations
  category?: SuperlativeCategory;
  nominee?: User;
  nominatedBy?: User;
}

/**
 * A vote for a superlative nomination.
 */
export interface SuperlativeVote extends BaseEntity {
  nominationId: string;
  voterId: string;

  // Relations
  nomination?: SuperlativeNomination;
  voter?: User;
}
