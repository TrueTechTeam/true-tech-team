import { useCallback } from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';

interface GameFormData {
  home_team_id: string;
  away_team_id: string;
  venue_id: string;
  scheduled_at: string;
}

interface ScoreFormData {
  home_score: number;
  away_score: number;
}

export function useScheduleMutations() {
  const { canEdit } = usePermissions();

  const create = useCallback((data: GameFormData) => {
    if (!canEdit('schedules')) {
      console.warn('[useScheduleMutations] Permission denied');
      return;
    }
    // TODO: Replace with supabase.from('games').insert(data)
    console.warn('[useScheduleMutations] create:', data);
  }, [canEdit]);

  const update = useCallback((id: string, data: Partial<GameFormData>) => {
    if (!canEdit('schedules')) {
      console.warn('[useScheduleMutations] Permission denied');
      return;
    }
    // TODO: Replace with supabase.from('games').update(data).eq('id', id)
    console.warn('[useScheduleMutations] update:', id, data);
  }, [canEdit]);

  const submitScore = useCallback((id: string, data: ScoreFormData) => {
    if (!canEdit('games')) {
      console.warn('[useScheduleMutations] Permission denied');
      return;
    }
    // TODO: Replace with supabase.from('games').update({ ...data, status: 'completed' }).eq('id', id)
    console.warn('[useScheduleMutations] submitScore:', id, data);
  }, [canEdit]);

  const remove = useCallback((id: string) => {
    if (!canEdit('schedules')) {
      console.warn('[useScheduleMutations] Permission denied');
      return;
    }
    // TODO: Replace with supabase.from('games').delete().eq('id', id)
    console.warn('[useScheduleMutations] remove:', id);
  }, [canEdit]);

  return { create, update, submitScore, remove };
}
