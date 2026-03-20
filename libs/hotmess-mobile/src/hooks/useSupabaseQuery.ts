import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { featureFlags } from '../lib/feature-flags';
import {
  useMockCities,
  useMockSports,
  useMockLeagues,
  useMockLeaguesByCity,
  useMockActiveSeasons,
  useMockMyTeams,
  useMockUpcomingGames,
  useMockRefereeGames,
  useMockPendingJoinRequests,
  useMockMessageThreads,
  useMockThreadMessages,
  useMockTeamMembers,
  useMockVenues,
  useMockSuperlativeCategories,
} from '../mocks/hooks/useMockSupabaseQuery';

const USE_MOCK = featureFlags.useMockData;

interface QueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Generic hook for fetching data from Supabase
function useSupabaseQuery<T>(
  tableName: string,
  options?: {
    select?: string;
    filter?: { column: string; value: unknown };
    orderBy?: { column: string; ascending?: boolean };
    enabled?: boolean;
  }
): QueryResult<T[]> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const enabled = options?.enabled ?? true;

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase.from(tableName).select(options?.select || '*');

      if (options?.filter) {
        query = query.eq(options.filter.column, options.filter.value);
      }

      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      const { data: result, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }
      setData(result as T[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [tableName, options?.select, options?.filter, options?.orderBy, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ==========================================
// City hooks
// ==========================================
export function useCities() {
  const mock = useMockCities();
  const real = useSupabaseQuery<{
    id: string;
    name: string;
    state: string;
    timezone: string;
  }>('cities', { orderBy: { column: 'name' }, enabled: !USE_MOCK });
  return USE_MOCK ? mock : real;
}

// ==========================================
// Sport hooks
// ==========================================
export function useSports() {
  const mock = useMockSports();
  const real = useSupabaseQuery<{
    id: string;
    name: string;
    description: string;
    icon: string;
    rules_url: string;
  }>('sports', { orderBy: { column: 'name' }, enabled: !USE_MOCK });
  return USE_MOCK ? mock : real;
}

// ==========================================
// League hooks
// ==========================================
export function useLeagues() {
  const mock = useMockLeagues();
  const real = useSupabaseQuery<{
    id: string;
    name: string;
    city_id: string;
    sport_id: string;
    description: string;
    cities?: { name: string; state: string };
    sports?: { name: string };
  }>('leagues', {
    select: '*, cities(name, state), sports(name)',
    orderBy: { column: 'name' },
    enabled: !USE_MOCK,
  });
  return USE_MOCK ? mock : real;
}

export function useLeaguesByCity(cityId: string | undefined) {
  const mock = useMockLeaguesByCity(cityId);

  const [data, setData] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (USE_MOCK || !cityId) {
      if (!USE_MOCK) {
        setData([]);
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const { data: result, error: queryError } = await supabase
        .from('leagues')
        .select('*, sports(name)')
        .eq('city_id', cityId);

      if (queryError) {
        throw queryError;
      }
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [cityId]);

  useEffect(() => {
    if (!USE_MOCK) {
      fetchData();
    }
  }, [fetchData]);

  return USE_MOCK ? mock : { data, loading, error, refetch: fetchData };
}

// ==========================================
// Season hooks
// ==========================================
interface ActiveSeason {
  id: string;
  name: string;
  status?: string;
  start_date?: string;
  leagues?: { name: string; sports?: { name: string }; cities?: { name: string } };
}

export function useActiveSeasons() {
  const mock = useMockActiveSeasons();

  const [data, setData] = useState<ActiveSeason[] | null>(null);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (USE_MOCK) {
      return;
    }
    setLoading(true);
    try {
      const { data: result, error: queryError } = await supabase
        .from('seasons')
        .select('*, leagues(name, cities(name), sports(name))')
        .in('status', ['registration', 'active'])
        .order('start_date');

      if (queryError) {
        throw queryError;
      }
      setData(result as ActiveSeason[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!USE_MOCK) {
      fetchData();
    }
  }, [fetchData]);

  return USE_MOCK ? mock : { data, loading, error, refetch: fetchData };
}

// ==========================================
// Team hooks
// ==========================================
export function useTeams() {
  const mock = useMockVenues(); // placeholder - not heavily used
  const real = useSupabaseQuery<{
    id: string;
    name: string;
    division_id: string;
    captain_id: string;
    logo_url: string;
  }>('teams', { orderBy: { column: 'name' }, enabled: !USE_MOCK });
  return USE_MOCK ? mock : real;
}

interface TeamMembership {
  id: string;
  user_id: string;
  team_id: string | null;
  role?: string;
  teams?: {
    id: string;
    name: string;
    divisions?: {
      id: string;
      name: string;
      seasons?: {
        id: string;
        name: string;
        status?: string;
        leagues?: {
          name: string;
          sports?: { name: string };
          cities?: { name: string };
        };
      };
    };
  };
}

export function useMyTeams(userId: string | undefined) {
  const mock = useMockMyTeams(userId);

  const [data, setData] = useState<TeamMembership[] | null>(null);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (USE_MOCK || !userId) {
      if (!USE_MOCK) {
        setData([]);
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const { data: result, error: queryError } = await supabase
        .from('team_members')
        .select(
          `
          *,
          teams(
            *,
            divisions(
              *,
              seasons(
                *,
                leagues(name, sports(name), cities(name))
              )
            )
          )
        `
        )
        .eq('user_id', userId);

      if (queryError) {
        throw queryError;
      }
      setData(result as TeamMembership[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!USE_MOCK) {
      fetchData();
    }
  }, [fetchData]);

  return USE_MOCK ? mock : { data, loading, error, refetch: fetchData };
}

// ==========================================
// Game hooks
// ==========================================
interface Game {
  id: string;
  scheduled_at: string;
  status: string;
  home_team: { id: string; name: string };
  away_team: { id: string; name: string };
  venue?: { name: string; address?: string };
  play_area?: string;
  division_id?: string;
  home_score: number | null;
  away_score: number | null;
  referee_id?: string | null;
  home_team_id?: string | null;
  away_team_id?: string | null;
}

export function useUpcomingGames(userId: string | undefined) {
  const mock = useMockUpcomingGames(userId);

  const [data, setData] = useState<Game[] | null>(null);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (USE_MOCK || !userId) {
      if (!USE_MOCK) {
        setData([]);
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userId);

      if (teamError) {
        throw teamError;
      }
      const teamIds = teamMembers?.map((tm) => tm.team_id) || [];

      if (teamIds.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select(
          `
          *,
          home_team:teams!games_home_team_id_fkey(name),
          away_team:teams!games_away_team_id_fkey(name),
          venues(name, address)
        `
        )
        .or(`home_team_id.in.(${teamIds.join(',')}),away_team_id.in.(${teamIds.join(',')})`)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at');

      if (gamesError) {
        throw gamesError;
      }
      setData(games as Game[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!USE_MOCK) {
      fetchData();
    }
  }, [fetchData]);

  return USE_MOCK ? mock : { data, loading, error, refetch: fetchData };
}

export function useRefereeGames(userId: string | undefined) {
  const mock = useMockRefereeGames(userId);

  const [data, setData] = useState<Game[] | null>(null);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (USE_MOCK || !userId) {
      if (!USE_MOCK) {
        setData([]);
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select(
          `
          *,
          home_team:teams!games_home_team_id_fkey(id, name),
          away_team:teams!games_away_team_id_fkey(id, name),
          venues(name, address)
        `
        )
        .eq('referee_id', userId)
        .order('scheduled_at');

      if (gamesError) {
        throw gamesError;
      }
      setData(games as Game[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!USE_MOCK) {
      fetchData();
    }
  }, [fetchData]);

  return USE_MOCK ? mock : { data, loading, error, refetch: fetchData };
}

// ==========================================
// Team member hooks
// ==========================================
export function useTeamMembers(teamId: string | undefined) {
  const mock = useMockTeamMembers(teamId);
  const real = useSupabaseQuery<{
    id: string;
    team_id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    role: string;
    status: string;
  }>('team_members', {
    filter: teamId ? { column: 'team_id', value: teamId } : undefined,
    enabled: !USE_MOCK && !!teamId,
  });
  return USE_MOCK ? mock : real;
}

interface JoinRequest {
  id: string;
  team_id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  status?: string;
}

export function usePendingJoinRequests(teamIds: string[]) {
  const mock = useMockPendingJoinRequests(teamIds);

  const [data, setData] = useState<JoinRequest[] | null>(null);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (USE_MOCK || teamIds.length === 0) {
      if (!USE_MOCK) {
        setData([]);
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const { data: result, error: queryError } = await supabase
        .from('team_members')
        .select('*')
        .in('team_id', teamIds)
        .eq('status', 'requested');

      if (queryError) {
        throw queryError;
      }
      setData(result as JoinRequest[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [teamIds]);

  useEffect(() => {
    if (!USE_MOCK) {
      fetchData();
    }
  }, [fetchData]);

  return USE_MOCK ? mock : { data, loading, error, refetch: fetchData };
}

// ==========================================
// Message hooks
// ==========================================
export function useMessageThreads(userId: string | undefined) {
  const mock = useMockMessageThreads(userId);

  const [data, setData] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (USE_MOCK || !userId) {
      if (!USE_MOCK) {
        setData([]);
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const { data: result, error: queryError } = await supabase
        .from('thread_participants')
        .select('*, threads(*)')
        .eq('user_id', userId);

      if (queryError) {
        throw queryError;
      }
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!USE_MOCK) {
      fetchData();
    }
  }, [fetchData]);

  return USE_MOCK ? mock : { data, loading, error, refetch: fetchData };
}

export function useThreadMessages(threadId: string | undefined) {
  const mock = useMockThreadMessages(threadId);

  const [data, setData] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (USE_MOCK || !threadId) {
      if (!USE_MOCK) {
        setData([]);
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const { data: result, error: queryError } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (queryError) {
        throw queryError;
      }
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    if (!USE_MOCK) {
      fetchData();
    }
  }, [fetchData]);

  return USE_MOCK ? mock : { data, loading, error, refetch: fetchData };
}

// ==========================================
// Superlative hooks
// ==========================================
export function useSuperlativeCategories(seasonId: string | undefined) {
  const mock = useMockSuperlativeCategories(seasonId);
  const real = useSupabaseQuery<{
    id: string;
    season_id: string;
    name: string;
    description: string;
    display_order: number;
  }>('superlative_categories', {
    filter: seasonId ? { column: 'season_id', value: seasonId } : undefined,
    orderBy: { column: 'display_order' },
    enabled: !USE_MOCK && !!seasonId,
  });
  return USE_MOCK ? mock : real;
}

// ==========================================
// Venue hooks
// ==========================================
export function useVenues() {
  const mock = useMockVenues();
  const real = useSupabaseQuery<{
    id: string;
    name: string;
    address: string;
    city_id: string;
    latitude: number;
    longitude: number;
  }>('venues', { orderBy: { column: 'name' }, enabled: !USE_MOCK });
  return USE_MOCK ? mock : real;
}
