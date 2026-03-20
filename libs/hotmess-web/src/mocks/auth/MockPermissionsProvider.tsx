import { type ReactNode, useMemo, useCallback } from 'react';
import { UserRole } from '@true-tech-team/hotmess-types';
import { useMockAuth } from './MockAuthProvider';
import {
  PermissionsContext,
  type Permissions,
  type UserRoleRow,
} from '../../contexts/PermissionsContext';

/**
 * Mock city assignments for Commissioner role.
 * Commissioner can see Nashville and St. Pete.
 */
const COMMISSIONER_CITY_IDS = ['city-nashville', 'city-st-pete'];

/**
 * Mock managed seasons for Manager role.
 * Manager manages the first 3 Nashville league seasons.
 */
const MANAGED_SEASON_IDS = ['season-001', 'season-002', 'season-003'];

/**
 * Mock referee season assignments for Referee role.
 */
const REFEREE_SEASON_IDS = ['season-001', 'season-002'];

/**
 * Mock team memberships for Captain and Player roles.
 */
const CAPTAIN_TEAM_IDS = ['team-001', 'team-002'];
const PLAYER_TEAM_IDS = ['team-001', 'team-002', 'team-003'];

// Uses the shared PermissionsContext so usePermissions() works in mock mode

export function MockPermissionsProvider({ children }: { children: ReactNode }) {
  const { role } = useMockAuth();

  const isAdmin = role === UserRole.Admin;
  const isCommissioner = role === UserRole.Commissioner;

  const commissionerCityIds = useMemo(
    () => (isCommissioner ? COMMISSIONER_CITY_IDS : []),
    [isCommissioner]
  );

  const managedSeasonIds = useMemo(
    () => (role === UserRole.Manager || isAdmin ? MANAGED_SEASON_IDS : []),
    [role, isAdmin]
  );

  const refereeSeasonIds = useMemo(
    () => (role === UserRole.Referee ? REFEREE_SEASON_IDS : []),
    [role]
  );

  const myTeamIds = useMemo(() => {
    if (isAdmin || isCommissioner) {
      return [];
    }
    if (role === UserRole.Manager) {
      return [];
    }
    if (role === UserRole.Referee) {
      return [];
    }
    if (role === UserRole.TeamCaptain) {
      return CAPTAIN_TEAM_IDS;
    }
    return PLAYER_TEAM_IDS; // Player
  }, [role, isAdmin, isCommissioner]);

  const captainTeamIds = useMemo(
    () => (role === UserRole.TeamCaptain ? CAPTAIN_TEAM_IDS : []),
    [role]
  );

  const dbRoles = useMemo<UserRoleRow[]>(() => {
    if (isAdmin) {
      return [
        {
          id: 'mock-role-1',
          user_id: 'mock-admin-001',
          role: UserRole.Admin,
          city_id: null,
          source: 'manual' as const,
          se_permission_level: null,
        },
      ];
    }
    if (isCommissioner) {
      return COMMISSIONER_CITY_IDS.map((cityId, i) => ({
        id: `mock-role-comm-${i}`,
        user_id: 'mock-commissioner-001',
        role: UserRole.Commissioner,
        city_id: cityId,
        source: 'manual' as const,
        se_permission_level: null,
      }));
    }
    return [];
  }, [isAdmin, isCommissioner]);

  const canView = useCallback(
    (resource: string, scopeId?: string): boolean => {
      if (isAdmin) {
        return true;
      }

      switch (resource) {
        case 'cities':
          return isCommissioner;
        case 'sports':
          return isAdmin || isCommissioner;
        case 'leagues':
          if (isCommissioner && scopeId) {
            return commissionerCityIds.includes(scopeId);
          }
          return isCommissioner;
        case 'seasons':
          if (isCommissioner) {
            return true;
          }
          if (scopeId) {
            return managedSeasonIds.includes(scopeId) || refereeSeasonIds.includes(scopeId);
          }
          return managedSeasonIds.length > 0 || refereeSeasonIds.length > 0 || myTeamIds.length > 0;
        case 'teams':
          if (isCommissioner) {
            return true;
          }
          if (scopeId) {
            return myTeamIds.includes(scopeId);
          }
          return myTeamIds.length > 0;
        case 'schedules':
        case 'games':
          if (isCommissioner) {
            return true;
          }
          return managedSeasonIds.length > 0 || refereeSeasonIds.length > 0 || myTeamIds.length > 0;
        case 'brackets':
          if (isCommissioner) {
            return true;
          }
          return managedSeasonIds.length > 0 || refereeSeasonIds.length > 0;
        default:
          return false;
      }
    },
    [isAdmin, isCommissioner, commissionerCityIds, managedSeasonIds, refereeSeasonIds, myTeamIds]
  );

  const canEdit = useCallback(
    (resource: string, scopeId?: string): boolean => {
      if (isAdmin) {
        return true;
      }

      switch (resource) {
        case 'cities':
        case 'sports':
          return false;
        case 'leagues':
          if (isCommissioner && scopeId) {
            return commissionerCityIds.includes(scopeId);
          }
          return false;
        case 'seasons':
          if (isCommissioner) {
            return true;
          }
          if (scopeId) {
            return managedSeasonIds.includes(scopeId);
          }
          return false;
        case 'teams':
          if (isCommissioner) {
            return true;
          }
          if (scopeId) {
            return captainTeamIds.includes(scopeId);
          }
          return managedSeasonIds.length > 0;
        case 'schedules':
        case 'games':
          if (isCommissioner) {
            return true;
          }
          if (role === UserRole.Referee) {
            return true;
          }
          return managedSeasonIds.length > 0;
        case 'brackets':
          if (isCommissioner) {
            return true;
          }
          return managedSeasonIds.length > 0;
        case 'user_roles':
          return false;
        default:
          return false;
      }
    },
    [isAdmin, isCommissioner, role, commissionerCityIds, managedSeasonIds, captainTeamIds]
  );

  const refresh = useCallback(async () => {
    // No-op in mock mode
  }, []);

  const value = useMemo<Permissions>(
    () => ({
      loading: false,
      effectiveRole: role,
      seRole: null,
      seRoles: [],
      dbRoles,
      isAdmin,
      isCommissioner,
      commissionerCityIds,
      managedSeasonIds,
      refereeSeasonIds,
      myTeamIds,
      captainTeamIds,
      canView,
      canEdit,
      refresh,
    }),
    [
      role,
      dbRoles,
      isAdmin,
      isCommissioner,
      commissionerCityIds,
      managedSeasonIds,
      refereeSeasonIds,
      myTeamIds,
      captainTeamIds,
      canView,
      canEdit,
      refresh,
    ]
  );

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}
