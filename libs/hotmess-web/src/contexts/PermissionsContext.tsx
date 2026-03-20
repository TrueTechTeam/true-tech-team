import { type ReactNode, createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { UserRole, ROLE_HIERARCHY } from '@true-tech-team/hotmess-types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { fetchSERoles, getHighestSERole, type SERoleResult } from '../lib/sports-engine-roles';

/** A row from the user_roles table */
export interface UserRoleRow {
  id: string;
  user_id: string;
  role: UserRole;
  city_id: string | null;
  source: 'sports_engine' | 'manual';
  se_permission_level: string | null;
}

export interface Permissions {
  loading: boolean;
  effectiveRole: UserRole;
  seRole: UserRole | null;
  seRoles: SERoleResult[];
  dbRoles: UserRoleRow[];
  isAdmin: boolean;
  isCommissioner: boolean;
  commissionerCityIds: string[];
  managedSeasonIds: string[];
  refereeSeasonIds: string[];
  myTeamIds: string[];
  captainTeamIds: string[];
  canView: (resource: string, scopeId?: string) => boolean;
  canEdit: (resource: string, scopeId?: string) => boolean;
  refresh: () => Promise<void>;
}

const defaultPermissions: Permissions = {
  loading: true,
  effectiveRole: UserRole.Player,
  seRole: null,
  seRoles: [],
  dbRoles: [],
  isAdmin: false,
  isCommissioner: false,
  commissionerCityIds: [],
  managedSeasonIds: [],
  refereeSeasonIds: [],
  myTeamIds: [],
  captainTeamIds: [],
  canView: () => false,
  canEdit: () => false,
  refresh: async () => { /* noop */ },
};

export const PermissionsContext = createContext<Permissions>(defaultPermissions);

function getHighestRole(...roles: (UserRole | null)[]): UserRole {
  let highest = -1;
  let highestRole = UserRole.Player;
  for (const role of roles) {
    if (!role) continue;
    const idx = ROLE_HIERARCHY.indexOf(role);
    if (idx > highest) {
      highest = idx;
      highestRole = role;
    }
  }
  return highestRole;
}

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { profile, getAccessToken, isAuthenticated } = useAuth();
  const userId = profile?.id ?? null;

  const [loading, setLoading] = useState(true);
  const [seRoles, setSeRoles] = useState<SERoleResult[]>([]);
  const [dbRoles, setDbRoles] = useState<UserRoleRow[]>([]);
  const [managedSeasonIds, setManagedSeasonIds] = useState<string[]>([]);
  const [refereeSeasonIds, setRefereeSeasonIds] = useState<string[]>([]);
  const [myTeamIds, setMyTeamIds] = useState<string[]>([]);
  const [captainTeamIds, setCaptainTeamIds] = useState<string[]>([]);

  const fetchPermissions = useCallback(async () => {
    if (!userId || !isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Layer 1: Fetch SE roles (graceful fallback if unavailable)
      const accessToken = await getAccessToken();
      let fetchedSeRoles: SERoleResult[] = [];
      if (accessToken) {
        fetchedSeRoles = await fetchSERoles(accessToken);
      }
      setSeRoles(fetchedSeRoles);

      // Layer 2: Fetch DB roles from user_roles table
      const { data: userRolesData } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);
      setDbRoles((userRolesData as UserRoleRow[]) ?? []);

      // Fetch managed seasons
      const { data: managedSeasons } = await supabase
        .from('seasons')
        .select('id')
        .eq('manager_id', userId);
      setManagedSeasonIds((managedSeasons ?? []).map((s: { id: string }) => s.id));

      // Fetch referee assignments — get seasons via games.division_id → divisions.season_id
      const { data: refereeGames } = await supabase
        .from('games')
        .select('division_id, divisions(season_id)')
        .eq('referee_id', userId);
      const refSeasonIds = new Set<string>();
      for (const g of refereeGames ?? []) {
        const div = g.divisions as unknown as { season_id: string } | null;
        if (div?.season_id) refSeasonIds.add(div.season_id);
      }
      setRefereeSeasonIds(Array.from(refSeasonIds));

      // Fetch team memberships
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', userId)
        .eq('status', 'active');
      const allTeamIds: string[] = [];
      const captTeamIds: string[] = [];
      for (const tm of teamMembers ?? []) {
        allTeamIds.push(tm.team_id);
        if (tm.role === 'team_captain') captTeamIds.push(tm.team_id);
      }
      setMyTeamIds(allTeamIds);
      setCaptainTeamIds(captTeamIds);
    } catch (error) {
      console.error('[Permissions] Failed to fetch permissions:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, isAuthenticated, getAccessToken]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Derived values
  const seRole = useMemo(() => getHighestSERole(seRoles), [seRoles]);

  const dbHighestRole = useMemo(() => {
    if (dbRoles.length === 0) return null;
    return getHighestRole(...dbRoles.map((r) => r.role));
  }, [dbRoles]);

  const teamBasedRole = useMemo(() => {
    if (captainTeamIds.length > 0) return UserRole.TeamCaptain;
    if (myTeamIds.length > 0) return UserRole.Player;
    return null;
  }, [captainTeamIds, myTeamIds]);

  const contextRole = useMemo(() => {
    if (managedSeasonIds.length > 0) return UserRole.Manager;
    if (refereeSeasonIds.length > 0) return UserRole.Referee;
    return null;
  }, [managedSeasonIds, refereeSeasonIds]);

  // SE roles have priority, DB enhances (never downgrades)
  const effectiveRole = useMemo(
    () => getHighestRole(seRole, dbHighestRole, contextRole, teamBasedRole),
    [seRole, dbHighestRole, contextRole, teamBasedRole]
  );

  const isAdmin = effectiveRole === UserRole.Admin;

  const isCommissioner = useMemo(
    () => effectiveRole === UserRole.Commissioner || dbRoles.some((r) => r.role === UserRole.Commissioner),
    [effectiveRole, dbRoles]
  );

  const commissionerCityIds = useMemo(
    () =>
      dbRoles
        .filter((r) => r.role === UserRole.Commissioner && r.city_id)
        .map((r) => r.city_id as string),
    [dbRoles]
  );

  const canView = useCallback(
    (resource: string, scopeId?: string): boolean => {
      if (isAdmin) return true;

      switch (resource) {
        case 'cities':
          return isCommissioner; // commissioners see their cities
        case 'sports':
          return isAdmin || isCommissioner;
        case 'leagues':
          if (isCommissioner && scopeId) return commissionerCityIds.includes(scopeId);
          return isCommissioner;
        case 'seasons':
          if (isCommissioner) return true; // filtered by city in hooks
          if (scopeId) return managedSeasonIds.includes(scopeId) || refereeSeasonIds.includes(scopeId);
          return managedSeasonIds.length > 0 || refereeSeasonIds.length > 0 || myTeamIds.length > 0;
        case 'teams':
          if (isCommissioner) return true;
          if (scopeId) return myTeamIds.includes(scopeId);
          return myTeamIds.length > 0;
        case 'schedules':
        case 'games':
          if (isCommissioner) return true;
          return managedSeasonIds.length > 0 || refereeSeasonIds.length > 0 || myTeamIds.length > 0;
        case 'brackets':
          if (isCommissioner) return true;
          return managedSeasonIds.length > 0 || refereeSeasonIds.length > 0;
        default:
          return false;
      }
    },
    [isAdmin, isCommissioner, commissionerCityIds, managedSeasonIds, refereeSeasonIds, myTeamIds]
  );

  const canEdit = useCallback(
    (resource: string, scopeId?: string): boolean => {
      if (isAdmin) return true;

      switch (resource) {
        case 'cities':
          return false; // admin only
        case 'sports':
          return false; // admin only
        case 'leagues':
          if (isCommissioner && scopeId) return commissionerCityIds.includes(scopeId);
          return false;
        case 'seasons':
          if (isCommissioner) return true; // filtered by city
          if (scopeId) return managedSeasonIds.includes(scopeId);
          return false;
        case 'teams':
          if (isCommissioner) return true;
          if (scopeId) return captainTeamIds.includes(scopeId);
          return managedSeasonIds.length > 0;
        case 'schedules':
        case 'games':
          if (isCommissioner) return true;
          if (effectiveRole === UserRole.Referee) return true; // score only, enforced in mutation
          return managedSeasonIds.length > 0;
        case 'brackets':
          if (isCommissioner) return true;
          return managedSeasonIds.length > 0;
        case 'user_roles':
          return false; // admin only
        default:
          return false;
      }
    },
    [isAdmin, isCommissioner, effectiveRole, commissionerCityIds, managedSeasonIds, captainTeamIds]
  );

  const value = useMemo<Permissions>(
    () => ({
      loading,
      effectiveRole,
      seRole,
      seRoles,
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
      refresh: fetchPermissions,
    }),
    [
      loading,
      effectiveRole,
      seRole,
      seRoles,
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
      fetchPermissions,
    ]
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions(): Permissions {
  return useContext(PermissionsContext);
}
