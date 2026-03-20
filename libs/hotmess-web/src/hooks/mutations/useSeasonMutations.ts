import { useCallback } from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';

interface SeasonFormData {
  name: string;
  league_id: string;
  registration_start_date: string;
  registration_end_date: string;
  season_start_date: string;
  season_end_date: string;
  status: string;
}

export function useSeasonMutations() {
  const { canEdit } = usePermissions();

  const create = useCallback((data: SeasonFormData) => {
    if (!canEdit('seasons')) {
      console.warn('[useSeasonMutations] Permission denied');
      return;
    }
    // TODO: Replace with supabase.from('seasons').insert(data)
    console.warn('[useSeasonMutations] create:', data);
  }, [canEdit]);

  const update = useCallback((id: string, data: Partial<SeasonFormData>) => {
    if (!canEdit('seasons', id)) {
      console.warn('[useSeasonMutations] Permission denied');
      return;
    }
    // TODO: Replace with supabase.from('seasons').update(data).eq('id', id)
    console.warn('[useSeasonMutations] update:', id, data);
  }, [canEdit]);

  const remove = useCallback((id: string) => {
    if (!canEdit('seasons')) {
      console.warn('[useSeasonMutations] Permission denied');
      return;
    }
    // TODO: Replace with supabase.from('seasons').delete().eq('id', id)
    console.warn('[useSeasonMutations] remove:', id);
  }, [canEdit]);

  return { create, update, remove };
}
