import { useCallback } from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';

interface CityFormData {
  name: string;
  state: string;
  is_active: boolean;
}

// Admin only — cities are top-level entities
export function useCityMutations() {
  const { isAdmin } = usePermissions();

  const create = useCallback((data: CityFormData) => {
    if (!isAdmin) {
      console.warn('[useCityMutations] Permission denied: admin only');
      return;
    }
    // TODO: Replace with supabase.from('cities').insert(data)
    console.warn('[useCityMutations] create:', data);
  }, [isAdmin]);

  const update = useCallback((id: string, data: Partial<CityFormData>) => {
    if (!isAdmin) {
      console.warn('[useCityMutations] Permission denied: admin only');
      return;
    }
    // TODO: Replace with supabase.from('cities').update(data).eq('id', id)
    console.warn('[useCityMutations] update:', id, data);
  }, [isAdmin]);

  const remove = useCallback((id: string) => {
    if (!isAdmin) {
      console.warn('[useCityMutations] Permission denied: admin only');
      return;
    }
    // TODO: Replace with supabase.from('cities').delete().eq('id', id)
    console.warn('[useCityMutations] remove:', id);
  }, [isAdmin]);

  return { create, update, remove };
}
