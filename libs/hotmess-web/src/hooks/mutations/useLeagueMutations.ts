import { useCallback } from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';

interface LeagueFormData {
  name: string;
  city_id: string;
  sport_id: string;
}

export function useLeagueMutations() {
  const { canEdit } = usePermissions();

  const create = useCallback(
    (data: LeagueFormData) => {
      if (!canEdit('leagues', data.city_id)) {
        console.warn('[useLeagueMutations] Permission denied');
        return;
      }
      // TODO: Replace with supabase.from('leagues').insert(data)
      console.warn('[useLeagueMutations] create:', data);
    },
    [canEdit]
  );

  const update = useCallback(
    (id: string, data: Partial<LeagueFormData>) => {
      if (!canEdit('leagues', data.city_id)) {
        console.warn('[useLeagueMutations] Permission denied');
        return;
      }
      // TODO: Replace with supabase.from('leagues').update(data).eq('id', id)
      console.warn('[useLeagueMutations] update:', id, data);
    },
    [canEdit]
  );

  const remove = useCallback(
    (id: string) => {
      if (!canEdit('leagues')) {
        console.warn('[useLeagueMutations] Permission denied');
        return;
      }
      // TODO: Replace with supabase.from('leagues').delete().eq('id', id)
      console.warn('[useLeagueMutations] remove:', id);
    },
    [canEdit]
  );

  return { create, update, remove };
}
