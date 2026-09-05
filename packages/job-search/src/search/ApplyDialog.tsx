'use client';

import { useEffect, useState } from 'react';
import { Button, Dialog, Input, Textarea, useToast } from '@true-tech-team/react-components';
import type { CreateApplicationPayload, JobSearchJob } from '../lib/types';
import styles from './ApplyDialog.module.scss';

interface ApplyDialogProps {
  job: JobSearchJob | null;
  onClose: () => void;
  onApplied: (jobId: string) => void;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function ApplyDialog({ job, onClose, onApplied }: ApplyDialogProps) {
  const [appliedDate, setAppliedDate] = useState(today());
  const [confirmationLink, setConfirmationLink] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [salary, setSalary] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (job) {
      setAppliedDate(today());
      setConfirmationLink('');
      setContactPerson('');
      setSalary(job.salary ?? '');
      setNotes('');
    }
  }, [job]);

  if (!job) {
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: CreateApplicationPayload = {
        jobId: job.id,
        appliedDate: appliedDate || null,
        confirmationLink: confirmationLink.trim() || null,
        contactPerson: contactPerson.trim() || null,
        salary: salary.trim() || null,
        notes: notes.trim() || null,
      };
      const res = await fetch('/api/job-search/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Save failed');
      }
      toast.success(`Marked "${job.title}" as applied`);
      onApplied(job.id);
    } catch {
      toast.error('Could not record this application');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      isOpen
      onClose={onClose}
      onOpenChange={(open) => !open && onClose()}
      title={`Mark "${job.title}" as Applied`}
      size="md"
      actions={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            Save Application
          </Button>
        </>
      }
    >
      <div className={styles.field}>
        <Input
          type="date"
          label="Applied Date"
          value={appliedDate}
          onChange={(e) => setAppliedDate(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <Input
          type="url"
          label="Confirmation Link"
          placeholder="e.g. link to application confirmation email or portal"
          value={confirmationLink}
          onChange={(e) => setConfirmationLink(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <Input
          label="Contact Person"
          placeholder="e.g. recruiter or hiring manager name"
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <Input
          label="Salary"
          placeholder="e.g. 90k-100k"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <Textarea
          label="Notes"
          placeholder="Any details worth remembering about this application…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
    </Dialog>
  );
}
