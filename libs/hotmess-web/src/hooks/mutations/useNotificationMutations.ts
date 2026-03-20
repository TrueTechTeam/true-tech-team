import { useCallback } from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';

interface NotificationFormData {
  title: string;
  message: string;
  target: 'all' | 'city' | 'league' | 'team';
  target_name?: string;
  status: 'draft' | 'scheduled' | 'sent';
  sent_date?: string;
}

export function useNotificationMutations() {
  const { canEdit } = usePermissions();

  const create = useCallback((data: NotificationFormData) => {
    if (!canEdit('notifications')) {
      console.warn('[useNotificationMutations] Permission denied');
      return;
    }
    // TODO: Replace with supabase.from('notifications').insert(data)
    console.warn('[useNotificationMutations] create:', data);
  }, [canEdit]);

  const update = useCallback((id: string, data: Partial<NotificationFormData>) => {
    if (!canEdit('notifications')) {
      console.warn('[useNotificationMutations] Permission denied');
      return;
    }
    // TODO: Replace with supabase.from('notifications').update(data).eq('id', id)
    console.warn('[useNotificationMutations] update:', id, data);
  }, [canEdit]);

  const send = useCallback((id: string) => {
    if (!canEdit('notifications')) {
      console.warn('[useNotificationMutations] Permission denied');
      return;
    }
    // TODO: Replace with supabase.from('notifications').update({ status: 'sent', sent_date: new Date().toISOString() }).eq('id', id)
    console.warn('[useNotificationMutations] send:', id);
  }, [canEdit]);

  const remove = useCallback((id: string) => {
    if (!canEdit('notifications')) {
      console.warn('[useNotificationMutations] Permission denied');
      return;
    }
    // TODO: Replace with supabase.from('notifications').delete().eq('id', id)
    console.warn('[useNotificationMutations] remove:', id);
  }, [canEdit]);

  return { create, update, send, remove };
}
