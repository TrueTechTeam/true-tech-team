import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSupabaseQuery } from './useSupabaseQuery';
import { featureFlags } from '../lib/feature-flags';
import { getMockBracketMatches, getMockBracketMatchesByIds } from '../mocks/data/bracketMatches';
import { supabase } from '../lib/supabase';

const USE_MOCK = featureFlags.useMockData;

export interface BracketMatch {
  id: string;
  bracket_id: string;
  round: number;
  position: number;
  team1_id?: string;
  team2_id?: string;
  winner_next_match_id?: string;
  loser_next_match_id?: string;
  venue_id?: string;
  play_area?: string;
  scheduled_at?: string;
  team1_score?: number;
  team2_score?: number;
  winner_id?: string;
  team1?: { id: string; name: string };
  team2?: { id: string; name: string };
  venue?: { id: string; name: string };
}

/**
 * Hook to fetch bracket matches with team and venue details
 */
export function useBracketMatches(bracketId?: string) {
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Mock: read from in-memory store (re-reads on refreshKey change)
  const mockMatches = USE_MOCK ? getMockBracketMatches(bracketId) : [];
  void refreshKey; // ensure refreshKey is read so refetch triggers re-render

  const mockData = { data: mockMatches, loading: false, error: null, refetch };

  const real = useSupabaseQuery<BracketMatch[]>('bracket_matches', {
    select:
      '*, team1:teams!team1_id(id, name), team2:teams!team2_id(id, name), venue:venues(id, name)',
    filter: bracketId ? [{ column: 'bracket_id', value: bracketId }] : undefined,
    orderBy: { column: 'round', ascending: true },
    enabled: !USE_MOCK && !!bracketId,
  });

  return USE_MOCK ? mockData : real;
}

/**
 * Hook to fetch bracket matches for ALL brackets in a season.
 * Takes an array of bracket IDs and returns all matches combined.
 */
export function useAllBracketMatches(bracketIds: string[]) {
  const [data, setData] = useState<BracketMatch[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Stabilize the bracketIds key to avoid complex expression in dependency array
  const bracketIdsKey = useMemo(() => bracketIds.join(','), [bracketIds]);

  useEffect(() => {
    if (bracketIds.length === 0) {
      setData([]);
      return;
    }

    if (USE_MOCK) {
      setData(getMockBracketMatchesByIds(bracketIds));
      return;
    }

    let cancelled = false;
    setLoading(true);

    supabase
      .from('bracket_matches')
      .select(
        '*, team1:teams!team1_id(id, name), team2:teams!team2_id(id, name), venue:venues(id, name)'
      )
      .in('bracket_id', bracketIds)
      .order('round', { ascending: true })
      .then(({ data: result, error }) => {
        if (cancelled) {
          return;
        }
        if (error) {
          console.error('[useAllBracketMatches] error:', error);
          setData([]);
        } else {
          setData((result as BracketMatch[]) || []);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bracketIdsKey, refreshKey]);

  return { data, loading, refetch };
}
