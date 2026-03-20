import { useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { featureFlags } from '../../lib/feature-flags';
import {
  calculateSeeding,
  generateSingleElimination,
  generateDoubleElimination,
  generateRoundRobin,
  type BracketMatchInput,
} from '../../app/pages/admin/utils/bracketGeneration';
import type { Team } from '@true-tech-team/hotmess-types';
import { mockDivisions } from '../../mocks/data/divisions';
import { mockTeams } from '../../mocks/data/teams';
import { mockBrackets } from '../../mocks/data/brackets';
import { addMockBracketMatches, generateMockId } from '../../mocks/data/bracketMatches';
import type { BracketMatch } from '../useBracketMatches';

const USE_MOCK = featureFlags.useMockData;

interface BracketFormData {
  season_id: string;
  format: string;
}

interface GenerateSeasonBracketsParams {
  season_id: string;
}

export function useBracketMutations() {
  /**
   * Create brackets for each division in a season.
   * Returns the season_id for navigation.
   */
  const create = useCallback(async (data: BracketFormData): Promise<string | null> => {
    if (USE_MOCK) {
      console.warn('[useBracketMutations] create (mock):', data);
      return data.season_id;
    }

    try {
      // Fetch divisions for the season
      const { data: divisions, error: divisionsError } = await supabase
        .from('divisions')
        .select('id, name')
        .eq('season_id', data.season_id);

      if (divisionsError) {
        throw divisionsError;
      }
      if (!divisions || divisions.length === 0) {
        throw new Error('No divisions found for this season');
      }

      // Create a bracket for each division
      const bracketInserts = divisions.map((division) => ({
        division_id: division.id,
        type: data.format,
        name: `${division.name} ${data.format.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} Bracket`,
        team_count: 0,
      }));

      const { data: brackets, error: bracketsError } = await supabase
        .from('brackets')
        .insert(bracketInserts)
        .select('id');

      if (bracketsError) {
        throw bracketsError;
      }
      if (!brackets || brackets.length === 0) {
        throw new Error('Failed to create brackets');
      }

      return data.season_id;
    } catch (error) {
      console.error('[useBracketMutations] create error:', error);
      throw error;
    }
  }, []);

  /**
   * Generate bracket matches for ALL divisions in a season.
   */
  const generateSeason = useCallback(
    async (params: GenerateSeasonBracketsParams): Promise<void> => {
      console.warn('[useBracketMutations] generateSeason called', {
        season_id: params.season_id,
        USE_MOCK,
      });
      if (USE_MOCK) {
        // Generate mock bracket matches using in-memory store
        const seasonDivisions = mockDivisions.filter((d) => d.season_id === params.season_id);
        console.warn(
          '[useBracketMutations] seasonDivisions:',
          seasonDivisions.map((d) => ({ id: d.id, name: d.name }))
        );

        const seasonBrackets = mockBrackets.filter((b) =>
          seasonDivisions.some((d) => d.id === b.division_id)
        );
        console.warn(
          '[useBracketMutations] seasonBrackets:',
          seasonBrackets.map((b) => ({ id: b.id, division_id: b.division_id, type: b.type }))
        );

        if (seasonBrackets.length === 0) {
          console.warn(
            '[useBracketMutations] NO brackets found for season divisions! Check mockBrackets data.'
          );
        }

        for (const bracket of seasonBrackets) {
          const divTeams = mockTeams
            .filter((t) => t.division_id === bracket.division_id && t.status === 'confirmed')
            .map((t) => ({
              ...t,
              pointsFor: t.points_for,
              pointsAgainst: t.points_against,
            })) as unknown as Team[];

          console.warn(
            '[useBracketMutations] bracket',
            bracket.id,
            'divTeams:',
            divTeams.length,
            'teams:',
            divTeams.map((t) => ({
              id: t.id,
              name: t.name,
              status: (t as unknown as Record<string, unknown>).status,
            }))
          );
          if (divTeams.length === 0) {
            console.warn(
              '[useBracketMutations] skipping bracket',
              bracket.id,
              '- no confirmed teams'
            );
            continue;
          }

          const seeded = calculateSeeding(divTeams);
          console.warn(
            '[useBracketMutations] seeded teams:',
            seeded.map((t) => ({ id: t.id, name: t.name, seed: t.seed }))
          );
          let matchInputs: BracketMatchInput[] = [];

          switch (bracket.type) {
            case 'single_elimination':
              matchInputs = generateSingleElimination(seeded);
              break;
            case 'double_elimination':
              matchInputs = generateDoubleElimination(seeded);
              break;
            case 'round_robin':
              matchInputs = generateRoundRobin(seeded);
              break;
          }

          console.warn(
            '[useBracketMutations] generated',
            matchInputs.length,
            'match inputs for bracket',
            bracket.id
          );

          // First pass: create matches with generated IDs
          const mockMatches: BracketMatch[] = matchInputs.map((m) => {
            const team1 = m.team1Id ? divTeams.find((t) => t.id === m.team1Id) : undefined;
            const team2 = m.team2Id ? divTeams.find((t) => t.id === m.team2Id) : undefined;
            return {
              id: generateMockId(),
              bracket_id: bracket.id,
              round: m.round,
              position: m.position,
              team1_id: m.team1Id,
              team2_id: m.team2Id,
              team1: team1 ? { id: team1.id, name: team1.name } : undefined,
              team2: team2 ? { id: team2.id, name: team2.name } : undefined,
            };
          });

          // Second pass: resolve temp IDs to real mock IDs for match linking
          for (let i = 0; i < matchInputs.length; i++) {
            const input = matchInputs[i];
            if (input.winnerNextMatchId) {
              const [, nextRound, nextPos] = input.winnerNextMatchId.split('-');
              const nextMatch = mockMatches.find(
                (m) => m.round === parseInt(nextRound) && m.position === parseInt(nextPos)
              );
              if (nextMatch) {
                mockMatches[i].winner_next_match_id = nextMatch.id;
              }
            }
            if (input.loserNextMatchId) {
              const [, nextRound, nextPos] = input.loserNextMatchId.split('-');
              const nextMatch = mockMatches.find(
                (m) => m.round === parseInt(nextRound) && m.position === parseInt(nextPos)
              );
              if (nextMatch) {
                mockMatches[i].loser_next_match_id = nextMatch.id;
              }
            }
          }

          addMockBracketMatches(mockMatches);
          console.warn(
            '[useBracketMutations] added',
            mockMatches.length,
            'mock matches for bracket',
            bracket.id,
            'matches:',
            mockMatches.map((m) => ({
              id: m.id,
              round: m.round,
              pos: m.position,
              team1: m.team1?.name ?? m.team1_id ?? 'TBD',
              team2: m.team2?.name ?? m.team2_id ?? 'TBD',
              winner_next: m.winner_next_match_id,
              scheduled_at: m.scheduled_at,
              play_area: m.play_area,
            }))
          );
        }
        console.warn('[useBracketMutations] generateSeason mock complete');
        return;
      }

      try {
        // Fetch all brackets for this season's divisions
        const { data: divisions, error: divError } = await supabase
          .from('divisions')
          .select('id')
          .eq('season_id', params.season_id);

        if (divError) {
          throw divError;
        }
        if (!divisions || divisions.length === 0) {
          throw new Error('No divisions found for this season');
        }

        const divisionIds = divisions.map((d) => d.id);

        const { data: brackets, error: bracketError } = await supabase
          .from('brackets')
          .select('id, type, division_id')
          .in('division_id', divisionIds);

        if (bracketError) {
          throw bracketError;
        }
        if (!brackets || brackets.length === 0) {
          throw new Error('No brackets found for this season');
        }

        // Generate matches for each bracket
        for (const bracket of brackets) {
          await generateBracketMatches(bracket.id, bracket.division_id, bracket.type);
        }
      } catch (error) {
        console.error('[useBracketMutations] generateSeason error:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Internal: generate matches for a single bracket
   */
  const generateBracketMatches = async (
    bracketId: string,
    divisionId: string,
    bracketType: string
  ): Promise<void> => {
    // Fetch teams for the division
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, wins, losses, ties, points_for, points_against')
      .eq('division_id', divisionId)
      .eq('status', 'confirmed');

    if (teamsError) {
      throw teamsError;
    }
    if (!teams || teams.length === 0) {
      return;
    }

    // Calculate seeding
    const seededTeams = calculateSeeding(teams as unknown as Team[]);

    // Generate bracket structure based on format
    let matches: BracketMatchInput[] = [];
    switch (bracketType) {
      case 'single_elimination':
        matches = generateSingleElimination(seededTeams);
        break;
      case 'double_elimination':
        matches = generateDoubleElimination(seededTeams);
        break;
      case 'round_robin':
        matches = generateRoundRobin(seededTeams);
        break;
      default:
        throw new Error(`Unknown bracket type: ${bracketType}`);
    }

    // Insert matches into database
    const matchInserts = matches.map((match) => ({
      bracket_id: bracketId,
      round: match.round,
      position: match.position,
      team1_id: match.team1Id || null,
      team2_id: match.team2Id || null,
      winner_next_match_id: null,
      loser_next_match_id: null,
    }));

    const { data: insertedMatches, error: matchesError } = await supabase
      .from('bracket_matches')
      .insert(matchInserts)
      .select('id, round, position');

    if (matchesError) {
      throw matchesError;
    }
    if (!insertedMatches) {
      throw new Error('Failed to create matches');
    }

    // Update winner/loser next match IDs with real IDs
    const linkUpdates = matches
      .map((match, index) => {
        const dbMatch = insertedMatches[index];
        const upd: { id: string; winner_next_match_id?: string; loser_next_match_id?: string } = {
          id: dbMatch.id,
        };

        if (match.winnerNextMatchId) {
          const [, nextRound, nextPos] = match.winnerNextMatchId.split('-');
          const nextMatch = insertedMatches.find(
            (m) => m.round === parseInt(nextRound) && m.position === parseInt(nextPos)
          );
          if (nextMatch) {
            upd.winner_next_match_id = nextMatch.id;
          }
        }

        if (match.loserNextMatchId) {
          const [, nextRound, nextPos] = match.loserNextMatchId.split('-');
          const nextMatch = insertedMatches.find(
            (m) => m.round === parseInt(nextRound) && m.position === parseInt(nextPos)
          );
          if (nextMatch) {
            upd.loser_next_match_id = nextMatch.id;
          }
        }

        return upd;
      })
      .filter((u) => u.winner_next_match_id || u.loser_next_match_id);

    if (linkUpdates.length > 0) {
      await Promise.all(
        linkUpdates.map((update) =>
          supabase
            .from('bracket_matches')
            .update({
              winner_next_match_id: update.winner_next_match_id,
              loser_next_match_id: update.loser_next_match_id,
            })
            .eq('id', update.id)
        )
      );
    }

    // Update bracket team count
    await supabase.from('brackets').update({ team_count: seededTeams.length }).eq('id', bracketId);
  };

  /**
   * Update bracket metadata
   */
  const update = useCallback(
    async (id: string, updates: Partial<{ name: string; type: string }>): Promise<void> => {
      if (USE_MOCK) {
        console.warn('[useBracketMutations] update (mock):', id, updates);
        return;
      }

      try {
        const { error } = await supabase.from('brackets').update(updates).eq('id', id);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('[useBracketMutations] update error:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Delete a bracket and all its matches
   */
  const remove = useCallback(async (id: string): Promise<void> => {
    if (USE_MOCK) {
      console.warn('[useBracketMutations] remove (mock):', id);
      return;
    }

    try {
      const { error } = await supabase.from('brackets').delete().eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('[useBracketMutations] remove error:', error);
      throw error;
    }
  }, []);

  return { create, generateSeason, update, remove };
}
