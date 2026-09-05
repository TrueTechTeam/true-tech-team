'use client';

import { useState } from 'react';
import { Button, Dialog, useToast } from '@true-tech-team/react-components';
import type { JobSearchApplication, JobSearchJob } from '../lib/types';

interface RemoveConfirmDialogProps {
  application: JobSearchApplication | null;
  job: JobSearchJob | null;
  onClose: () => void;
  onRemoved: (id: string) => void;
}

export default function RemoveConfirmDialog({
  application,
  job,
  onClose,
  onRemoved,
}: RemoveConfirmDialogProps) {
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  if (!application) {
    return null;
  }

  const handleRemove = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/job-search/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ removed: true }),
      });
      if (!res.ok) {
        throw new Error('Remove failed');
      }
      toast.success('Application deleted');
      onRemoved(application.id);
    } catch {
      toast.error('Could not delete this application');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      isOpen
      onClose={onClose}
      onOpenChange={(open) => !open && onClose()}
      role="alertdialog"
      title="Delete this application?"
      size="sm"
      actions={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRemove} loading={saving}>
            Delete
          </Button>
        </>
      }
    >
      <p>
        The application {job ? `for "${job.title}" at ${job.company}` : ''} will be removed from
        your applications list. This won&apos;t affect the original job suggestion.
      </p>
    </Dialog>
  );
}
