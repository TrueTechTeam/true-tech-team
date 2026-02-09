import type { BaseEntity } from './base';
import type { Season } from './season';
import type { Team } from './team';

/**
 * A division within a season (A, B, C leagues by skill level).
 */
export interface Division extends BaseEntity {
  seasonId: string;
  name: string;
  description?: string;
  /** Skill level (higher = more competitive) */
  skillLevel: number;
  /** Maximum teams allowed in this division */
  maxTeams?: number;

  // Relations
  season?: Season;
  teams?: Team[];
}
