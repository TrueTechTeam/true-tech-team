import { useState, useCallback } from 'react';

export type DialogMode = 'create' | 'edit';

export function useAdminDialog<T>() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode>('create');
  const [editingItem, setEditingItem] = useState<T | null>(null);

  const openCreate = useCallback(() => {
    setMode('create');
    setEditingItem(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setMode('edit');
    setEditingItem(item);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingItem(null);
  }, []);

  return { isOpen, mode, editingItem, openCreate, openEdit, close };
}
