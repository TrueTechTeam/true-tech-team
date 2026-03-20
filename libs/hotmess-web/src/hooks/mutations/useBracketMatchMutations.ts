import { useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { featureFlags } from '../../lib/feature-flags';
import { updateMockBracketMatch } from '../../mocks/data/bracketMatches';
import type { BracketMatch } from '../useBracketMatches';

const USE_MOCK = featureFlags.useMockData;

export interface MatchUpdateData {
  scheduled_at?: string;
  venue_id?: string;
  play_area?: string;
  team1_score?: number;
  team2_score?: number;
  winner_id?: string;
}

export function useBracketMatchMutations() {
  /**
   * Update a single match
   */
  const update = useCallback(async (matchId: string, updates: MatchUpdateData): Promise<void> => {
    if (USE_MOCK) {
      console.warn('[useBracketMatchMutations] update (mock):', matchId, updates);
      updateMockBracketMatch(matchId, updates);
      return;
    }

    try {
      const { error } = await supabase.from('bracket_matches').update(updates).eq('id', matchId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('[useBracketMatchMutations] update error:', error);
      throw error;
    }
  }, []);

  /**
   * Batch update multiple matches
   */
  const bulkUpdate = useCallback(
    async (updates: Array<{ id: string; data: MatchUpdateData }>): Promise<void> => {
      if (USE_MOCK) {
        console.warn('[useBracketMatchMutations] bulkUpdate (mock):', updates.length, 'updates');
        for (const { id, data } of updates) {
          updateMockBracketMatch(id, data);
        }
        console.warn('[useBracketMatchMutations] bulkUpdate mock persisted');
        return;
      }

      try {
        // Execute all updates in parallel
        await Promise.all(
          updates.map(({ id, data }) => supabase.from('bracket_matches').update(data).eq('id', id))
        );
      } catch (error) {
        console.error('[useBracketMatchMutations] bulkUpdate error:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Record match result and update winner
   */
  const recordResult = useCallback(
    async (
      matchId: string,
      team1Score: number,
      team2Score: number,
      match: BracketMatch
    ): Promise<void> => {
      if (USE_MOCK) {
        console.warn(
          '[useBracketMatchMutations] recordResult (mock):',
          matchId,
          team1Score,
          team2Score
        );
        return;
      }

      try {
        const winnerId =
          team1Score > team2Score
            ? match.team1_id
            : team2Score > team1Score
              ? match.team2_id
              : null;

        const updates: MatchUpdateData = {
          team1_score: team1Score,
          team2_score: team2Score,
          winner_id: winnerId ?? undefined,
        };

        await update(matchId, updates);

        // TODO: Update next match with winner (if applicable)
        // This would require additional logic to handle bracket advancement
      } catch (error) {
        console.error('[useBracketMatchMutations] recordResult error:', error);
        throw error;
      }
    },
    [update]
  );

  return { update, bulkUpdate, recordResult };
}
