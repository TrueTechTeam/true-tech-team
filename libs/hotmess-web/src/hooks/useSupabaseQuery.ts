import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
    filter?: { column: string; value: unknown }[];
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    single?: boolean;
  }
): QueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
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

      if (queryError) throw queryError;
      setData(result as T);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tableName, JSON.stringify(options)]);

  return { data, loading, error, refetch: fetchData };
}

// Specific hooks for common data
export function useCities() {
  return useSupabaseQuery<
    Array<{
      id: string;
      name: string;
      state: string;
      is_active: boolean;
    }>
  >('cities', {
    filter: [{ column: 'is_active', value: true }],
    orderBy: { column: 'name', ascending: true },
  });
}

export function useSports() {
  return useSupabaseQuery<
    Array<{
      id: string;
      name: string;
      description: string;
      config: Record<string, unknown>;
      is_active: boolean;
    }>
  >('sports', {
    filter: [{ column: 'is_active', value: true }],
    orderBy: { column: 'name', ascending: true },
  });
}

export function useLeagues(cityId?: string) {
  return useSupabaseQuery<
    Array<{
      id: string;
      name: string;
      city_id: string;
      sport_id: string;
      cities: { name: string };
      sports: { name: string };
    }>
  >('leagues', {
    select: '*, cities(name), sports(name)',
    filter: cityId ? [{ column: 'city_id', value: cityId }] : undefined,
    orderBy: { column: 'name', ascending: true },
  });
}

export function useSeasons(leagueId?: string) {
  return useSupabaseQuery<
    Array<{
      id: string;
      name: string;
      status: string;
      season_start_date: string;
      season_end_date: string;
      leagues: { name: string };
    }>
  >('seasons', {
    select: '*, leagues(name)',
    filter: leagueId ? [{ column: 'league_id', value: leagueId }] : undefined,
    orderBy: { column: 'season_start_date', ascending: false },
  });
}

export function useTeams(divisionId?: string) {
  return useSupabaseQuery<
    Array<{
      id: string;
      name: string;
      shirt_color: string;
      status: string;
      wins: number;
      losses: number;
      ties: number;
    }>
  >('teams', {
    filter: divisionId ? [{ column: 'division_id', value: divisionId }] : undefined,
    orderBy: { column: 'wins', ascending: false },
  });
}

export function useUpcomingGames(teamId?: string) {
  return useSupabaseQuery<
    Array<{
      id: string;
      scheduled_at: string;
      status: string;
      home_team: { id: string; name: string };
      away_team: { id: string; name: string };
      venue: { name: string };
      play_area: string;
    }>
  >('games', {
    select:
      '*, home_team:teams!home_team_id(id, name), away_team:teams!away_team_id(id, name), venue:venues(name)',
    filter: [{ column: 'status', value: 'scheduled' }],
    orderBy: { column: 'scheduled_at', ascending: true },
    limit: 10,
  });
}
