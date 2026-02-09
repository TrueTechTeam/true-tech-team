import type { BaseEntity } from './base';
import type { UserRole } from '../enums';
import type { User } from './user';
import type { Team } from './team';

/**
 * Membership status for a player on a team.
 */
export enum MembershipStatus {
  /** Invitation sent, awaiting response */
  Invited = 'invited',
  /** Player requested to join, awaiting captain approval */
  Requested = 'requested',
  /** Active member of the team */
  Active = 'active',
  /** Left or removed from the team */
  Inactive = 'inactive',
}

/**
 * Represents a user's membership on a team.
 * Users can be on multiple teams across different seasons.
 */
export interface TeamMember extends BaseEntity {
  teamId: string;
  userId: string;
  role: UserRole;
  status: MembershipStatus;
  /** Whether this is the user's first season (for rookie superlatives) */
  isRookie: boolean;
  joinedAt: Date;

  // Relations
  team?: Team;
  user?: User;
}
