import { UserRole, ROLE_HIERARCHY } from '@true-tech-team/hotmess-types';
import { Permission } from './types';

/**
 * Permissions granted to each role.
 * Higher roles inherit permissions from lower roles.
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.Player]: [
    Permission.ViewOrganization,
    Permission.ViewCities,
    Permission.ViewSports,
    Permission.ViewLeagues,
    Permission.ViewSeasons,
    Permission.ViewDivisions,
    Permission.ViewTeams,
    Permission.ViewPlayers,
    Permission.ViewGames,
    Permission.ViewSchedules,
    Permission.ViewBrackets,
    Permission.ViewMessages,
    Permission.MessageOwnTeam,
    Permission.ViewPhotos,
    Permission.UploadPhotos,
    Permission.VoteSuperlatives,
  ],

  [UserRole.TeamCaptain]: [
    Permission.ManageOwnTeam,
    Permission.InviteToTeam,
    Permission.NominateSuperlatives,
  ],

  [UserRole.Referee]: [Permission.UpdateAssignedGameScore],

  [UserRole.Manager]: [
    Permission.ManageSeasons,
    Permission.ManageDivisions,
    Permission.ManageAllTeams,
    Permission.ManageAllPlayers,
    Permission.ManageAllGames,
    Permission.ManageSchedules,
    Permission.ManageBrackets,
    Permission.ManageSuperlatives,
    Permission.MessageAllTeams,
    Permission.SendAnnouncements,
    Permission.ManageAllPhotos,
    Permission.ViewReports,
  ],

  [UserRole.Admin]: [
    Permission.ManageOrganization,
    Permission.ManageCities,
    Permission.ManageSports,
    Permission.ManageLeagues,
    Permission.SendNotifications,
    Permission.ExportData,
  ],
};

/**
 * Get all permissions for a role, including inherited permissions.
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  const roleIndex = ROLE_HIERARCHY.indexOf(role);
  const permissions = new Set<Permission>();

  // Add permissions from this role and all lower roles
  for (let i = 0; i <= roleIndex; i++) {
    const currentRole = ROLE_HIERARCHY[i];
    const rolePerms = ROLE_PERMISSIONS[currentRole];
    rolePerms.forEach((p) => permissions.add(p));
  }

  return Array.from(permissions);
}

/**
 * Check if a role has a higher or equal rank than another role.
 */
export function isRoleAtLeast(role: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY.indexOf(role) >= ROLE_HIERARCHY.indexOf(minimumRole);
}
