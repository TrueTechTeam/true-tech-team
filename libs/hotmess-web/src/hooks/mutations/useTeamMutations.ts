import { useCallback } from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';

interface TeamFormData {
  name: string;
  shirt_color: string;
  status: string;
}

export function useTeamMutations() {
  const { canEdit } = usePermissions();

  const create = useCallback(
    (data: TeamFormData) => {
      if (!canEdit('teams')) {
        console.warn('[useTeamMutations] Permission denied');
        return;
      }
      // TODO: Replace with supabase.from('teams').insert(data)
      console.warn('[useTeamMutations] create:', data);
    },
    [canEdit]
  );

  const update = useCallback(
    (id: string, data: Partial<TeamFormData>) => {
      if (!canEdit('teams', id)) {
        console.warn('[useTeamMutations] Permission denied');
        return;
      }
      // TODO: Replace with supabase.from('teams').update(data).eq('id', id)
      console.warn('[useTeamMutations] update:', id, data);
    },
    [canEdit]
  );

  const remove = useCallback(
    (id: string) => {
      if (!canEdit('teams')) {
        console.warn('[useTeamMutations] Permission denied');
        return;
      }
      // TODO: Replace with supabase.from('teams').delete().eq('id', id)
      console.warn('[useTeamMutations] remove:', id);
    },
    [canEdit]
  );

  return { create, update, remove };
}
