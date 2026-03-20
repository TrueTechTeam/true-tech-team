import { useCallback } from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';

interface SportFormData {
  name: string;
  icon: string;
  teamSize: number;
  isActive: boolean;
}

// Admin only — sports are top-level entities
export function useSportMutations() {
  const { isAdmin } = usePermissions();

  const create = useCallback(
    (data: SportFormData) => {
      if (!isAdmin) {
        console.warn('[useSportMutations] Permission denied: admin only');
        return;
      }
      // TODO: Replace with supabase.from('sports').insert(data)
      console.warn('[useSportMutations] create:', data);
    },
    [isAdmin]
  );

  const update = useCallback(
    (id: string, data: Partial<SportFormData>) => {
      if (!isAdmin) {
        console.warn('[useSportMutations] Permission denied: admin only');
        return;
      }
      // TODO: Replace with supabase.from('sports').update(data).eq('id', id)
      console.warn('[useSportMutations] update:', id, data);
    },
    [isAdmin]
  );

  const remove = useCallback(
    (id: string) => {
      if (!isAdmin) {
        console.warn('[useSportMutations] Permission denied: admin only');
        return;
      }
      // TODO: Replace with supabase.from('sports').delete().eq('id', id)
      console.warn('[useSportMutations] remove:', id);
    },
    [isAdmin]
  );

  return { create, update, remove };
}
