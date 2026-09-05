'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  Input,
  Select,
  Textarea,
  useToast,
} from '@true-tech-team/react-components';
import type { JobSearchApplication, JobSearchJob, UpdateApplicationPayload } from '../lib/types';
import styles from './EditApplicationDialog.module.scss';

interface EditApplicationDialogProps {
  application: JobSearchApplication | null;
  job: JobSearchJob | null;
  onClose: () => void;
  onUpdated: (updated: JobSearchApplication) => void;
}

const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied' },
  { value: 'phone_screen', label: 'Phone Screen' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

// Application interviewDate is a full timestamp — datetime-local inputs
// need "YYYY-MM-DDTHH:mm", so trim off seconds/timezone from the ISO string.
function toDatetimeLocal(value: string | null) {
  if (!value) {
    return '';
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditApplicationDialog({
  application,
  job,
  onClose,
  onUpdated,
}: EditApplicationDialogProps) {
  const [status, setStatus] = useState<JobSearchApplication['status']>('applied');
  const [interviewDate, setInterviewDate] = useState('');
  const [confirmationLink, setConfirmationLink] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [salary, setSalary] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (application) {
      setStatus(application.status);
      setInterviewDate(toDatetimeLocal(application.interviewDate));
      setConfirmationLink(application.confirmationLink ?? '');
      setContactPerson(application.contactPerson ?? '');
      setSalary(application.salary ?? '');
      setNotes(application.notes ?? '');
    }
  }, [application]);

  if (!application) {
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: UpdateApplicationPayload = {
        status,
        interviewDate: interviewDate ? new Date(interviewDate).toISOString() : null,
        confirmationLink: confirmationLink.trim() || null,
        contactPerson: contactPerson.trim() || null,
        salary: salary.trim() || null,
        notes: notes.trim() || null,
      };
      const res = await fetch(`/api/job-search/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Save failed');
      }
      const { application: updated } = (await res.json()) as { application: JobSearchApplication };
      toast.success('Application updated');
      onUpdated(updated);
    } catch {
      toast.error('Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      isOpen
      onClose={onClose}
      onOpenChange={(open) => !open && onClose()}
      title={job ? `Edit Application — ${job.title}` : 'Edit Application'}
      size="md"
      actions={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
        </>
      }
    >
      <div className={styles.field}>
        <label className={styles.label} htmlFor="edit-app-status">
          Status
        </label>
        <Select
          id="edit-app-status"
          value={status}
          onChange={(v) => setStatus(v as JobSearchApplication['status'])}
          options={STATUS_OPTIONS}
        />
      </div>
      <div className={styles.field}>
        <Input
          type="datetime-local"
          label="Interview Date"
          value={interviewDate}
          onChange={(e) => setInterviewDate(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <Input
          type="url"
          label="Confirmation Link"
          value={confirmationLink}
          onChange={(e) => setConfirmationLink(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <Input
          label="Contact Person"
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <Input label="Salary" value={salary} onChange={(e) => setSalary(e.target.value)} />
      </div>
      <div className={styles.field}>
        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      </div>
    </Dialog>
  );
}
