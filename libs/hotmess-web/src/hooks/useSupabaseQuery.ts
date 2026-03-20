import { useState, useEffect, useMemo } from 'react';
import { UserRole } from '@true-tech-team/hotmess-types';
import { featureFlags } from '../lib/feature-flags';
import {
  useMockCities,
  useMockSports,
  useMockLeagues,
  useMockSeasons,
  useMockTeams,
  useMockUpcomingGames,
  useMockCity,
  useMockLeague,
  useMockSeason,
  useMockTeam,
  useMockDivisions,
  useMockTeamMembers,
  useMockAllTeamsEnriched,
  useMockAllBrackets,
  useMockBracket,
  useMockSeasonBrackets,
} from '../mocks/hooks/useMockSupabaseQuery';
import { supabase } from '../lib/supabase';
import { usePermissions } from '../contexts/PermissionsContext';

interface QueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for fetching data from Supabase.
 */
export function useSupabaseQuery<T>(
  tableName: string,
  options?: {
    select?: string;
    filter?: Array<{ column: string; value: unknown }>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    single?: boolean;
    enabled?: boolean;
  }
): QueryResult<T> {
  const enabled = options?.enabled !== false;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from(tableName).select(options?.select || '*');

      // Apply filters
      if (options?.filter) {
        for (const f of options.filter) {
          query = query.eq(f.column, f.value);
        }
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      // Execute query
      const { data: result, error: queryError } = options?.single
        ? await query.single()
        : await query;

      if (queryError) {
        throw queryError;
      }
      setData(result as T);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName, JSON.stringify(options)]);

  return { data, loading: enabled ? loading : false, error, refetch: fetchData };
}

// Specific hooks for common data — when mock data is enabled, the real
// useSupabaseQuery call is disabled via `enabled: false` so it never fires.
const USE_MOCK = featureFlags.useMockData;

interface CityRow {
  id: string;
  name: string;
  state: string;
  is_active: boolean;
  slug: string;
}
interface SportRow {
  id: string;
  name: string;
  description: string;
  config: Record<string, unknown>;
  is_active: boolean;
}
interface LeagueRow {
  id: string;
  name: string;
  city_id: string;
  sport_id: string;
  cities: { name: string };
  sports: { name: string };
}
interface SeasonRow {
  id: string;
  name: string;
  status: string;
  season_start_date: string;
  season_end_date: string;
  league_id: string;
  leagues: { name: string };
}
interface TeamRow {
  id: string;
  name: string;
  shirt_color: string;
  status: string;
  wins: number;
  losses: number;
  ties: number;
  points_for: number;
  points_against: number;
  division_id: string;
}
interface GameRow {
  id: string;
  scheduled_at: string;
  status: string;
  home_team: { id: string; name: string };
  away_team: { id: string; name: string };
  venue: { name: string };
  play_area: string;
}

// Detail row interfaces with nested parent joins for breadcrumbs
export interface LeagueDetailRow {
  id: string;
  name: string;
  city_id: string;
  sport_id: string;
  is_active: boolean;
  cities: { id: string; name: string; state: string };
  sports: { id: string; name: string };
}

export interface SeasonDetailRow {
  id: string;
  name: string;
  status: string;
  league_id: string;
  venue_id: string | null;
  registration_start_date: string;
  registration_end_date: string;
  season_start_date: string;
  season_end_date: string;
  schedule_config?: {
    gameDays?: number[];
    firstGameTime?: string;
    timeSlots?: string[];
    totalWeeks?: number;
    minTimeBetweenGames?: number;
    maxGamesPerDay?: number;
    selectedPlayAreas?: string[];
    backupTournamentDates?: string[];
    bufferMinutes?: number;
    tournamentDate?: string;
    makeupDates?: string[];
    blackoutDates?: string[];
  };
  leagues: {
    id: string;
    name: string;
    city_id: string;
    sport_id: string;
    cities: { id: string; name: string };
    sports: {
      id: string;
      name: string;
      config?: { gameDurationMinutes?: number; schedulingRule?: string };
    };
  };
  venues: {
    id: string;
    name: string;
    address: string;
    play_areas: string[];
  } | null;
}

export interface TeamDetailRow {
  id: string;
  name: string;
  shirt_color: string;
  status: string;
  wins: number;
  losses: number;
  ties: number;
  points_for: number;
  points_against: number;
  division_id: string;
  free_agents_requested: number;
  divisions: {
    id: string;
    name: string;
    season_id: string;
    seasons: {
      id: string;
      name: string;
      league_id: string;
      leagues: { id: string; name: string; city_id: string; cities: { id: string; name: string } };
    };
  };
}

export interface BracketDetailRow {
  id: string;
  division_id: string;
  type: string;
  name: string;
  team_count: number;
  divisions: {
    id: string;
    name: string;
    season_id: string;
    seasons: {
      id: string;
      name: string;
      league_id: string;
      leagues: { id: string; name: string; city_id: string };
    };
  };
}

export interface BracketListRow {
  id: string;
  division_id: string;
  type: string;
  name: string;
  team_count: number;
  divisions: {
    id: string;
    name: string;
    season_id: string;
    seasons: {
      id: string;
      name: string;
      status: string;
      league_id: string;
      leagues: {
        id: string;
        name: string;
        city_id: string;
        cities: { id: string; name: string };
      } | null;
    } | null;
  } | null;
}

export interface SeasonBracketRow {
  id: string;
  division_id: string;
  type: string;
  name: string;
  team_count: number;
  divisions: { id: string; name: string; season_id: string } | null;
}

export interface DivisionRow {
  id: string;
  name: string;
  season_id: string;
  skill_level: number;
  max_teams: number;
}

export interface TeamMemberRow {
  id: string;
  team_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'player' | 'team_captain';
  is_rookie: boolean;
}

// ============================================
// PERMISSION-FILTERED HOOKS
// ============================================

export function useCities() {
  const { isAdmin, isCommissioner, commissionerCityIds } = usePermissions();
  const mock = useMockCities();
  const real = useSupabaseQuery<CityRow[]>('cities', {
    filter: [{ column: 'is_active', value: true }],
    orderBy: { column: 'name', ascending: true },
    enabled: !USE_MOCK,
  });
  const result = USE_MOCK ? mock : real;

  const filtered = useMemo(() => {
    if (!result.data || isAdmin) {
      return result.data;
    }
    if (isCommissioner) {
      return result.data.filter((c) => commissionerCityIds.includes(c.id));
    }
    return result.data;
  }, [result.data, isAdmin, isCommissioner, commissionerCityIds]);

  return { ...result, data: filtered };
}

export function useSports() {
  const mock = useMockSports();
  const real = useSupabaseQuery<SportRow[]>('sports', {
    filter: [{ column: 'is_active', value: true }],
    orderBy: { column: 'name', ascending: true },
    enabled: !USE_MOCK,
  });
  // Sports are not permission-filtered — all roles see all sports
  return USE_MOCK ? mock : real;
}

export function useLeagues(cityId?: string) {
  const { isAdmin, isCommissioner, commissionerCityIds } = usePermissions();
  const mock = useMockLeagues(cityId);
  const real = useSupabaseQuery<LeagueRow[]>('leagues', {
    select: '*, cities(name), sports(name)',
    filter: cityId ? [{ column: 'city_id', value: cityId }] : undefined,
    orderBy: { column: 'name', ascending: true },
    enabled: !USE_MOCK,
  });
  const result = USE_MOCK ? mock : real;

  const filtered = useMemo(() => {
    if (!result.data || isAdmin) {
      return result.data;
    }
    if (isCommissioner) {
      return result.data.filter((l) => commissionerCityIds.includes(l.city_id));
    }
    return result.data;
  }, [result.data, isAdmin, isCommissioner, commissionerCityIds]);

  return { ...result, data: filtered };
}

export function useSeasons(leagueId?: string) {
  const {
    isAdmin,
    isCommissioner,
    commissionerCityIds,
    effectiveRole,
    managedSeasonIds,
    refereeSeasonIds,
  } = usePermissions();
  const mock = useMockSeasons(leagueId);
  const real = useSupabaseQuery<SeasonRow[]>('seasons', {
    select: '*, leagues(name, city_id)',
    filter: leagueId ? [{ column: 'league_id', value: leagueId }] : undefined,
    orderBy: { column: 'season_start_date', ascending: false },
    enabled: !USE_MOCK,
  });
  const result = USE_MOCK ? mock : real;

  const filtered = useMemo(() => {
    if (!result.data || isAdmin) {
      return result.data;
    }
    if (isCommissioner) {
      return result.data.filter((s) => {
        const cityId = (s as SeasonRow & { leagues: { city_id?: string } }).leagues?.city_id;
        return cityId ? commissionerCityIds.includes(cityId) : false;
      });
    }
    if (effectiveRole === UserRole.Manager) {
      return result.data.filter((s) => managedSeasonIds.includes(s.id));
    }
    if (effectiveRole === UserRole.Referee) {
      return result.data.filter((s) => refereeSeasonIds.includes(s.id));
    }
    // Captain/Player: show all seasons (they need to see registration-open seasons)
    // Their team-specific filtering happens at the dashboard level
    return result.data;
  }, [
    result.data,
    isAdmin,
    isCommissioner,
    commissionerCityIds,
    effectiveRole,
    managedSeasonIds,
    refereeSeasonIds,
  ]);

  return { ...result, data: filtered };
}

export function useTeams(divisionId?: string) {
  const { isAdmin, isCommissioner, effectiveRole, myTeamIds } = usePermissions();
  const mock = useMockTeams(divisionId);
  const real = useSupabaseQuery<TeamRow[]>('teams', {
    filter: divisionId ? [{ column: 'division_id', value: divisionId }] : undefined,
    orderBy: { column: 'wins', ascending: false },
    enabled: !USE_MOCK,
  });
  const result = USE_MOCK ? mock : real;

  const filtered = useMemo(() => {
    if (!result.data || isAdmin || isCommissioner) {
      return result.data;
    }
    // When a divisionId is provided, show all teams in that division (for standings views)
    if (divisionId) {
      return result.data;
    }
    if (effectiveRole === UserRole.TeamCaptain || effectiveRole === UserRole.Player) {
      return result.data.filter((t) => myTeamIds.includes(t.id));
    }
    return result.data;
  }, [result.data, isAdmin, isCommissioner, divisionId, effectiveRole, myTeamIds]);

  return { ...result, data: filtered };
}

export function useUpcomingGames(_teamId?: string) {
  const mock = useMockUpcomingGames();
  const real = useSupabaseQuery<GameRow[]>('games', {
    select:
      '*, home_team:teams!home_team_id(id, name), away_team:teams!away_team_id(id, name), venue:venues(name)',
    filter: [{ column: 'status', value: 'scheduled' }],
    orderBy: { column: 'scheduled_at', ascending: true },
    limit: 10,
    enabled: !USE_MOCK,
  });
  const result = USE_MOCK ? mock : real;

  // Game filtering is handled at the dashboard/page level since games
  // need team/season context that isn't always on the game row
  return result;
}

// Single-entity hooks for detail pages — these don't need list-level
// permission filtering since they load a specific entity by ID.
// Access control is handled by route protection + RLS at the DB level.

export function useCity(cityId?: string) {
  const mock = useMockCity(cityId);
  const real = useSupabaseQuery<CityRow>('cities', {
    filter: cityId ? [{ column: 'id', value: cityId }] : undefined,
    single: true,
    enabled: !USE_MOCK && !!cityId,
  });
  return USE_MOCK ? mock : real;
}

export function useLeague(leagueId?: string) {
  const mock = useMockLeague(leagueId);
  const real = useSupabaseQuery<LeagueDetailRow>('leagues', {
    select: '*, cities(id, name, state), sports(id, name)',
    filter: leagueId ? [{ column: 'id', value: leagueId }] : undefined,
    single: true,
    enabled: !USE_MOCK && !!leagueId,
  });
  return USE_MOCK ? mock : real;
}

export function useSeason(seasonId?: string) {
  const mock = useMockSeason(seasonId);
  const real = useSupabaseQuery<SeasonDetailRow>('seasons', {
    select:
      '*, leagues(id, name, city_id, sport_id, cities(id, name), sports(id, name, config)), venues(id, name, address, play_areas)',
    filter: seasonId ? [{ column: 'id', value: seasonId }] : undefined,
    single: true,
    enabled: !USE_MOCK && !!seasonId,
  });
  return USE_MOCK ? mock : real;
}

export function useTeam(teamId?: string) {
  const mock = useMockTeam(teamId);
  const real = useSupabaseQuery<TeamDetailRow>('teams', {
    select:
      '*, divisions(id, name, season_id, seasons(id, name, league_id, leagues(id, name, city_id, cities(id, name))))',
    filter: teamId ? [{ column: 'id', value: teamId }] : undefined,
    single: true,
    enabled: !USE_MOCK && !!teamId,
  });
  return USE_MOCK ? mock : real;
}

export function useBracket(bracketId?: string) {
  const mock = useMockBracket(bracketId);
  const real = useSupabaseQuery<BracketDetailRow>('brackets', {
    select:
      '*, divisions(id, name, season_id, seasons(id, name, league_id, leagues(id, name, city_id)))',
    filter: bracketId ? [{ column: 'id', value: bracketId }] : undefined,
    single: true,
    enabled: !USE_MOCK && !!bracketId,
  });
  return USE_MOCK ? mock : real;
}

export function useDivisions(seasonId?: string) {
  const mock = useMockDivisions(seasonId);
  const real = useSupabaseQuery<DivisionRow[]>('divisions', {
    filter: seasonId ? [{ column: 'season_id', value: seasonId }] : undefined,
    orderBy: { column: 'name', ascending: true },
    enabled: !USE_MOCK && !!seasonId,
  });
  return USE_MOCK ? mock : real;
}

export function useTeamMembers(teamId?: string) {
  const mock = useMockTeamMembers(teamId);
  const real = useSupabaseQuery<TeamMemberRow[]>('team_members', {
    filter: teamId ? [{ column: 'team_id', value: teamId }] : undefined,
    orderBy: { column: 'role', ascending: true },
    enabled: !USE_MOCK && !!teamId,
  });
  return USE_MOCK ? mock : real;
}

// Enriched team row with full hierarchy for the "All Teams" page
export interface AllTeamRow {
  id: string;
  name: string;
  shirt_color: string;
  status: string;
  wins: number;
  losses: number;
  ties: number;
  division_id: string;
  divisions: {
    id: string;
    name: string;
    season_id: string;
    seasons: {
      id: string;
      name: string;
      status: string;
      season_start_date: string;
      season_end_date: string;
      league_id: string;
      leagues: {
        id: string;
        name: string;
        city_id: string;
        sport_id: string;
        cities: { id: string; name: string };
        sports: { id: string; name: string };
      } | null;
    } | null;
  } | null;
}

export function useAllBrackets() {
  const { isAdmin, isCommissioner, commissionerCityIds, effectiveRole, managedSeasonIds } =
    usePermissions();
  const mock = useMockAllBrackets();
  const real = useSupabaseQuery<BracketListRow[]>('brackets', {
    select:
      '*, divisions(id, name, season_id, seasons(id, name, status, league_id, leagues(id, name, city_id, cities(id, name))))',
    orderBy: { column: 'name', ascending: true },
    enabled: !USE_MOCK,
  });
  const result = USE_MOCK ? mock : real;

  const filtered = useMemo(() => {
    if (!result.data || isAdmin) {
      return result.data;
    }
    if (isCommissioner) {
      return result.data.filter((b) => {
        const cityId = b.divisions?.seasons?.leagues?.city_id;
        return cityId ? commissionerCityIds.includes(cityId) : false;
      });
    }
    if (effectiveRole === UserRole.Manager) {
      return result.data.filter((b) => {
        const seasonId = b.divisions?.seasons?.id;
        return seasonId ? managedSeasonIds.includes(seasonId) : false;
      });
    }
    return result.data;
  }, [result.data, isAdmin, isCommissioner, commissionerCityIds, effectiveRole, managedSeasonIds]);

  return { ...result, data: filtered };
}

export function useSeasonBrackets(seasonId?: string) {
  const mock = useMockSeasonBrackets(seasonId);
  const real = useSupabaseQuery<SeasonBracketRow[]>('brackets', {
    select: '*, divisions!inner(id, name, season_id)',
    filter: seasonId ? [{ column: 'divisions.season_id', value: seasonId }] : undefined,
    orderBy: { column: 'name', ascending: true },
    enabled: !USE_MOCK && !!seasonId,
  });
  return USE_MOCK ? mock : real;
}

export function useAllTeamsEnriched() {
  const {
    isAdmin,
    isCommissioner,
    commissionerCityIds,
    effectiveRole,
    managedSeasonIds,
    myTeamIds,
  } = usePermissions();
  const mock = useMockAllTeamsEnriched();
  const real = useSupabaseQuery<AllTeamRow[]>('teams', {
    select:
      '*, divisions(id, name, season_id, seasons(id, name, status, season_start_date, season_end_date, league_id, leagues(id, name, city_id, sport_id, cities(id, name), sports(id, name))))',
    orderBy: { column: 'name', ascending: true },
    enabled: !USE_MOCK,
  });
  const result = USE_MOCK ? mock : real;

  const filtered = useMemo(() => {
    if (!result.data || isAdmin) {
      return result.data;
    }
    if (isCommissioner) {
      return result.data.filter((t) => {
        const cityId = t.divisions?.seasons?.leagues?.city_id;
        return cityId ? commissionerCityIds.includes(cityId) : false;
      });
    }
    if (effectiveRole === UserRole.Manager) {
      return result.data.filter((t) => {
        const seasonId = t.divisions?.seasons?.id;
        return seasonId ? managedSeasonIds.includes(seasonId) : false;
      });
    }
    if (effectiveRole === UserRole.TeamCaptain || effectiveRole === UserRole.Player) {
      return result.data.filter((t) => myTeamIds.includes(t.id));
    }
    return result.data;
  }, [
    result.data,
    isAdmin,
    isCommissioner,
    commissionerCityIds,
    effectiveRole,
    managedSeasonIds,
    myTeamIds,
  ]);

  return { ...result, data: filtered };
}
