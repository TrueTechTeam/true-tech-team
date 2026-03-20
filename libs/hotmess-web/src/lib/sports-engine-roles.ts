// Sports Engine Role Sync
// Fetches user's team staff permissions from the SE GraphQL API
// and maps them to our application's UserRole enum.
//
// SE Team Staff Permission Levels:
//   Full Access        → admin
//   Team Settings      → manager
//   Scheduling Events  → manager
//   Scheduling Games   → manager
//   Rostering          → manager
//   Score Games        → referee
//   View Only          → player
//
// TODO: Validate the exact GraphQL query against the SE schema explorer
// at https://dev.sportsengine.com/explorer with real credentials.
// The query below is a best-guess based on available documentation.

import { UserRole } from '@true-tech-team/hotmess-types';

const SE_GRAPHQL_URL = 'https://api.sportsengine.com/graphql';

/** Raw staff role returned from the SE GraphQL API */
export interface SEStaffRole {
  permissionLevel: string;
  organization?: { id: string; name: string };
  team?: { id: string; name: string };
}

/** Mapped role result */
export interface SERoleResult {
  role: UserRole;
  sePermissionLevel: string;
  organizationId?: string;
  organizationName?: string;
}

/**
 * Maps a Sports Engine permission level string to our UserRole.
 */
export function mapSEPermissionToRole(permissionLevel: string): UserRole {
  const normalized = permissionLevel.toLowerCase().trim();

  if (normalized === 'full access' || normalized === 'full_access') {
    return UserRole.Admin;
  }

  if (
    normalized === 'team settings' ||
    normalized === 'team_settings' ||
    normalized === 'scheduling events' ||
    normalized === 'scheduling_events' ||
    normalized === 'scheduling games' ||
    normalized === 'scheduling_games' ||
    normalized === 'rostering'
  ) {
    return UserRole.Manager;
  }

  if (normalized === 'score games' || normalized === 'score_games') {
    return UserRole.Referee;
  }

  // Default: view only or unrecognized → player
  return UserRole.Player;
}

/**
 * Fetches the current user's staff roles from the SE GraphQL API.
 * Returns mapped roles or an empty array if the API is unavailable.
 */
export async function fetchSERoles(accessToken: string): Promise<SERoleResult[]> {
  // TODO: Refine this query against the actual SE GraphQL schema.
  // The field/type names below are best-guess based on SE documentation.
  const query = `
    query CurrentUserStaffRoles {
      currentUser {
        staffAssignments {
          permissionLevel
          organization {
            id
            name
          }
          team {
            id
            name
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(SE_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.warn('[SE Roles] GraphQL request failed, falling back to DB-only roles');
      return [];
    }

    const json = await response.json();

    if (json.errors) {
      console.warn('[SE Roles] GraphQL errors:', json.errors);
      return [];
    }

    const assignments: SEStaffRole[] =
      json.data?.currentUser?.staffAssignments ?? [];

    return assignments.map((assignment) => ({
      role: mapSEPermissionToRole(assignment.permissionLevel),
      sePermissionLevel: assignment.permissionLevel,
      organizationId: assignment.organization?.id,
      organizationName: assignment.organization?.name,
    }));
  } catch (error) {
    console.warn('[SE Roles] Failed to fetch SE roles, falling back to DB-only:', error);
    return [];
  }
}

/**
 * Returns the highest role from a list of SE role results.
 */
export function getHighestSERole(roles: SERoleResult[]): UserRole | null {
  if (roles.length === 0) return null;

  const hierarchy = [
    UserRole.Player,
    UserRole.TeamCaptain,
    UserRole.Referee,
    UserRole.Manager,
    UserRole.Commissioner,
    UserRole.Admin,
  ];

  let highest = -1;
  for (const r of roles) {
    const idx = hierarchy.indexOf(r.role);
    if (idx > highest) highest = idx;
  }

  return highest >= 0 ? hierarchy[highest] : null;
}
