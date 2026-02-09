import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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
  }
): QueryResult<T[]> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
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

      if (queryError) throw queryError;
      setData(result as T[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [
    tableName,
    options?.select,
    options?.filter?.column,
    options?.filter?.value,
    options?.orderBy?.column,
    options?.orderBy?.ascending,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// City hooks
export function useCities() {
  return useSupabaseQuery<{
    id: string;
    name: string;
    state: string;
    timezone: string;
  }>('cities', { orderBy: { column: 'name' } });
}

// Sport hooks
export function useSports() {
  return useSupabaseQuery<{
    id: string;
    name: string;
    description: string;
    icon: string;
    rules_url: string;
  }>('sports', { orderBy: { column: 'name' } });
}

// League hooks
export function useLeagues() {
  return useSupabaseQuery<{
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
  });
}

export function useLeaguesByCity(cityId: string | undefined) {
  const [data, setData] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!cityId) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: result, error: queryError } = await supabase
        .from('leagues')
        .select('*, sports(name)')
        .eq('city_id', cityId);

      if (queryError) throw queryError;
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [cityId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Season hooks
export function useSeasons() {
  return useSupabaseQuery<{
    id: string;
    name: string;
    league_id: string;
    start_date: string;
    end_date: string;
    registration_open: string;
    registration_close: string;
    status: string;
    leagues?: { name: string };
  }>('seasons', {
    select: '*, leagues(name)',
    orderBy: { column: 'start_date', ascending: false },
  });
}

export function useActiveSeasons() {
  const [data, setData] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: result, error: queryError } = await supabase
        .from('seasons')
        .select('*, leagues(name, cities(name), sports(name))')
        .in('status', ['registration', 'active'])
        .order('start_date');

      if (queryError) throw queryError;
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Team hooks
export function useTeams() {
  return useSupabaseQuery<{
    id: string;
    name: string;
    division_id: string;
    captain_id: string;
    logo_url: string;
  }>('teams', { orderBy: { column: 'name' } });
}

interface TeamMembership {
  id: string;
  user_id: string;
  team_id: string;
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
  const [data, setData] = useState<TeamMembership[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setData([]);
      setLoading(false);
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

      if (queryError) throw queryError;
      setData(result as TeamMembership[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Game hooks
interface Game {
  id: string;
  home_team_id: string;
  away_team_id: string;
  scheduled_at: string;
  home_team?: { name: string };
  away_team?: { name: string };
  venues?: { name: string; address?: string };
}

export function useUpcomingGames(userId: string | undefined) {
  const [data, setData] = useState<Game[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // First get user's teams
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userId);

      if (teamError) throw teamError;

      const teamIds = teamMembers?.map((tm) => tm.team_id) || [];

      if (teamIds.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      // Then get upcoming games for those teams
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

      if (gamesError) throw gamesError;
      setData(games as Game[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Venue hooks
export function useVenues() {
  return useSupabaseQuery<{
    id: string;
    name: string;
    address: string;
    city_id: string;
    latitude: number;
    longitude: number;
  }>('venues', { orderBy: { column: 'name' } });
}
