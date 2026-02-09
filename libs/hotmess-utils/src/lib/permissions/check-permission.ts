import { UserRole } from '@true-tech-team/hotmess-types';
import { Permission, PermissionContext } from './types';
import { getPermissionsForRole } from './role-permissions';

/**
 * Check if a user has a specific permission.
 */
export function hasPermission(context: PermissionContext, permission: Permission): boolean {
  const rolePermissions = getPermissionsForRole(context.role);

  // Check if the role has this permission
  if (!rolePermissions.includes(permission)) {
    return false;
  }

  // Additional context-based checks
  switch (permission) {
    case Permission.ManageOwnTeam:
    case Permission.MessageOwnTeam:
      // Must be a member of the team being accessed
      if (context.teamId && context.userTeamIds) {
        return context.userTeamIds.includes(context.teamId);
      }
      return false;

    case Permission.InviteToTeam:
      // Must be captain of the team
      if (context.teamId && context.userTeamIds) {
        return (
          context.role === UserRole.TeamCaptain && context.userTeamIds.includes(context.teamId)
        );
      }
      return false;

    case Permission.UpdateAssignedGameScore:
      // Must be assigned to the game
      if (context.gameId && context.assignedGameIds) {
        return context.assignedGameIds.includes(context.gameId);
      }
      return false;

    default:
      // Permission granted by role
      return true;
  }
}

/**
 * Check if a user has all of the specified permissions.
 */
export function hasAllPermissions(context: PermissionContext, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(context, p));
}

/**
 * Check if a user has any of the specified permissions.
 */
export function hasAnyPermission(context: PermissionContext, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(context, p));
}

/**
 * Get all permissions a user has in a given context.
 */
export function getUserPermissions(context: PermissionContext): Permission[] {
  const rolePermissions = getPermissionsForRole(context.role);
  return rolePermissions.filter((p) => hasPermission(context, p));
}
