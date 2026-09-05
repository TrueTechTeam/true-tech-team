'use client';

import { useState } from 'react';
import { Button, Dialog, useToast } from '@true-tech-team/react-components';
import type { JobSearchJob } from '../lib/types';

interface DismissConfirmDialogProps {
  job: JobSearchJob | null;
  onClose: () => void;
  onDismissed: (jobId: string) => void;
}

export default function DismissConfirmDialog({
  job,
  onClose,
  onDismissed,
}: DismissConfirmDialogProps) {
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  if (!job) {
    return null;
  }

  const handleDismiss = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/job-search/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dismissed' }),
      });
      if (!res.ok) {
        throw new Error('Dismiss failed');
      }
      toast.success(`Deleted "${job.title}"`);
      onDismissed(job.id);
    } catch {
      toast.error('Could not delete this job');
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
      title="Delete this job?"
      size="sm"
      actions={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDismiss} loading={saving}>
            Delete
          </Button>
        </>
      }
    >
      <p>
        &quot;{job.title}&quot; at {job.company} will be removed from your suggested jobs. You
        won&apos;t see it again unless you search again and it comes back up.
      </p>
    </Dialog>
  );
}
