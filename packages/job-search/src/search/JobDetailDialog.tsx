'use client';

import Link from 'next/link';
import { Badge, Button, Dialog, Icon, Tooltip } from '@true-tech-team/react-components';
import type { JobSearchJob } from '../lib/types';
import styles from './JobDetailDialog.module.scss';

interface JobDetailDialogProps {
  job: JobSearchJob | null;
  onClose: () => void;
  onDelete: (job: JobSearchJob) => void;
  onGenerateResume: (job: JobSearchJob) => void;
  generating: boolean;
  generateTooltip: string;
}

export default function JobDetailDialog({
  job,
  onClose,
  onDelete,
  onGenerateResume,
  generating,
  generateTooltip,
}: JobDetailDialogProps) {
  if (!job) {
    return null;
  }

  return (
    <Dialog
      isOpen
      onClose={onClose}
      onOpenChange={(open) => !open && onClose()}
      title={job.title}
      size="lg"
      actions={
        <>
          <Button variant="danger" onClick={() => onDelete(job)}>
            Delete
          </Button>
          {job.applicationUrl && (
            <Button
              variant="outline"
              onClick={() =>
                window.open(job.applicationUrl ?? undefined, '_blank', 'noopener,noreferrer')
              }
            >
              Apply Now
            </Button>
          )}
          {job.tailoredResumeId ? (
            <Link href={`/resume-print/${job.tailoredResumeId}`}>
              <Button variant="primary">View Generated Resume</Button>
            </Link>
          ) : (
            <Tooltip content={generateTooltip} disabled={!generateTooltip}>
              <Button
                variant="primary"
                onClick={() => onGenerateResume(job)}
                loading={generating}
                disabled={Boolean(generateTooltip) || generating}
              >
                Generate Resume
              </Button>
            </Tooltip>
          )}
        </>
      }
    >
      <div className={styles.body}>
        <div className={styles.metaRow}>
          <span className={styles.metaItem}>
            <strong>Company:</strong> {job.company}
          </span>
          {job.location && (
            <span className={styles.metaItem}>
              <strong>Location:</strong> {job.location}
            </span>
          )}
          {job.workType && (
            <Badge variant="neutral" size="sm">
              {job.workType}
            </Badge>
          )}
          {job.matchScore !== null && (
            <Badge variant={job.matchScore >= 70 ? 'success' : 'info'} size="sm">
              {job.matchScore}% match
            </Badge>
          )}
        </div>

        {job.salary && (
          <p className={styles.line}>
            <strong>Salary:</strong> {job.salary}
          </p>
        )}

        {job.postedDate && (
          <p className={styles.line}>
            <strong>Posted:</strong> {job.postedDate}
          </p>
        )}

        {job.companyWebsite && (
          <p className={styles.line}>
            <a
              href={job.companyWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.websiteLink}
            >
              Company website
              <Icon name="external-link" size="xs" />
            </a>
          </p>
        )}

        {job.matchReason && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Why this matches you</h4>
            <p className={styles.sectionBody}>{job.matchReason}</p>
          </div>
        )}

        {job.description && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Description</h4>
            <p className={styles.sectionBody}>{job.description}</p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
