'use client';

import { Button, Tooltip } from '@true-tech-team/react-components';
import type { ResumeData } from '../lib/types';
import { useUsageStatus, useAgentStream } from '@true-tech-team/dashboard-kit';
import styles from './AIAssistFillButton.module.scss';

interface AIAssistFillButtonProps {
  draft: ResumeData;
  targetJobDescription: string;
  onApply: (data: ResumeData) => void;
  // Shares the 'resume-builder-fill' usage slug/quota with ContentDialog's
  // ResumeUploadParse — called once this run's stream finishes so the parent
  // can refresh the shared usage-status fetch both buttons read from.
  onUsed: () => void;
  usageRefreshKey: number;
}

export default function AIAssistFillButton({
  draft,
  targetJobDescription,
  onApply,
  onUsed,
  usageRefreshKey,
}: AIAssistFillButtonProps) {
  const usage = useUsageStatus('/api/resume-builder/usage?slot=fill', usageRefreshKey);
  const { status, errorMessage, run } = useAgentStream<ResumeData>({
    onResult: onApply,
    onDone: onUsed,
  });

  const handleClick = () => {
    void run({
      url: '/api/resume-builder/fill',
      body: {
        existingDraft: draft,
        targetJobDescription: targetJobDescription.trim() || undefined,
      },
    });
  };

  const usageExhausted = usage !== null && !usage.allowed;

  return (
    <div className={styles.wrapper}>
      <Tooltip content="You've hit your daily AI usage limit." disabled={!usageExhausted}>
        <Button
          variant="secondary"
          onClick={handleClick}
          loading={status === 'streaming'}
          disabled={status === 'streaming' || usageExhausted}
        >
          Tailor & Polish with AI
        </Button>
      </Tooltip>
      <p className={styles.hint}>
        Uses your current draft (and the target job description from the Content step, if set) to
        improve wording and fill in gaps.
      </p>
      {status === 'error' && errorMessage && <div className={styles.error}>{errorMessage}</div>}
    </div>
  );
}
