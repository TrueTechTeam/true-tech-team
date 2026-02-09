/**
 * User roles within the Hotmess Sports system.
 * A user can have multiple roles across different sports/seasons.
 */
export enum UserRole {
  /** System administrator with full access */
  Admin = 'admin',
  /** City/league manager with broad permissions */
  Manager = 'manager',
  /** Game referee who can update scores */
  Referee = 'referee',
  /** Team captain who manages their team */
  TeamCaptain = 'team_captain',
  /** Regular player */
  Player = 'player',
}

/**
 * Role hierarchy for permission checking.
 * Higher index = more permissions.
 */
export const ROLE_HIERARCHY: UserRole[] = [
  UserRole.Player,
  UserRole.TeamCaptain,
  UserRole.Referee,
  UserRole.Manager,
  UserRole.Admin,
];
