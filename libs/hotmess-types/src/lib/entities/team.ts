import type { BaseEntity } from './base';
import type { TeamRegistrationStatus } from '../enums';
import type { Division } from './division';
import type { TeamMember } from './team-member';

/**
 * A team participating in a division.
 */
export interface Team extends BaseEntity {
  divisionId: string;
  name: string;
  shirtColor?: string;
  logoUrl?: string;
  status: TeamRegistrationStatus;
  /** Number of free agents requested by captain */
  freeAgentsRequested: number;

  // Stats (updated after each game)
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;

  // Relations
  division?: Division;
  members?: TeamMember[];
}

/**
 * Input for creating a new team.
 */
export interface CreateTeamInput {
  divisionId: string;
  name: string;
  shirtColor?: string;
  captainUserId: string;
}
