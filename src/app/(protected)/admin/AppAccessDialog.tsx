'use client';

import { useState } from 'react';
import {
  Dialog,
  Button,
  CheckboxGroup,
  CheckboxGroupItem,
  useToast,
} from '@true-tech-team/react-components';
import { APPS } from '../../../lib/apps/registry';

interface AppAccessDialogProps {
  userName: string;
  initialSlugs: string[];
  onClose: () => void;
  onSave: (slugs: string[]) => Promise<void>;
}

// Nothing here writes to app_permissions until Save is pressed — selections
// are local draft state, diffed against initialSlugs by the caller.
export default function AppAccessDialog({
  userName,
  initialSlugs,
  onClose,
  onSave,
}: AppAccessDialogProps) {
  const [selected, setSelected] = useState<string[]>(initialSlugs);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(selected);
      toast.success(`Updated app access for ${userName}`);
    } catch {
      toast.error(`Could not update app access for ${userName}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      isOpen
      onClose={onClose}
      onOpenChange={(open) => !open && onClose()}
      title={`App Access — ${userName}`}
      size="sm"
      actions={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            Save
          </Button>
        </>
      }
    >
      <CheckboxGroup value={selected} onChange={setSelected} label="Apps this user can access">
        {APPS.map((app) => (
          <CheckboxGroupItem
            key={app.slug}
            value={app.slug}
            label={app.label}
            helperText={app.description}
          />
        ))}
      </CheckboxGroup>
    </Dialog>
  );
}
