'use client';

import { useState } from 'react';
import { Button, Spinner, Badge } from '@true-tech-team/react-components';
import type { ResumeCritique, ResumeData } from '../lib/types';
import { UsageIndicator, useAgentStream } from '@true-tech-team/dashboard-kit';
import styles from './CritiquePanel.module.scss';

interface CritiquePanelProps {
  resumeData: ResumeData;
  targetJobDescription: string;
  documentId: string | undefined;
}

export default function CritiquePanel({
  resumeData,
  targetJobDescription,
  documentId,
}: CritiquePanelProps) {
  const [usageRefreshKey, setUsageRefreshKey] = useState(0);
  const { status, result, errorMessage, run } = useAgentStream<ResumeCritique>({
    onDone: () => setUsageRefreshKey((k) => k + 1),
  });

  const handleRun = () => {
    void run({
      url: '/api/resume-builder/critique',
      body: {
        resumeData,
        targetJobDescription: targetJobDescription.trim() || undefined,
        resumeDocumentId: documentId,
      },
    });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.headerRow}>
        <h3 className={styles.heading}>AI Resume Feedback</h3>
        <UsageIndicator
          fetchUrl="/api/resume-builder/usage?slot=critique"
          label="daily critiques"
          refreshKey={usageRefreshKey}
        />
      </div>

      <Button
        variant="primary"
        onClick={handleRun}
        loading={status === 'streaming'}
        disabled={status === 'streaming'}
      >
        Run AI Critique
      </Button>

      {status === 'streaming' && (
        <div className={styles.loading}>
          <Spinner size="sm" />
          <span>Reviewing your resume…</span>
        </div>
      )}

      {status === 'error' && errorMessage && <div className={styles.error}>{errorMessage}</div>}

      {status === 'done' && result && (
        <div className={styles.result}>
          <div className={styles.scoreRow}>
            <Badge variant={result.overallScore >= 70 ? 'success' : 'warning'} size="md">
              Score: {result.overallScore}/100
            </Badge>
          </div>

          {result.strengths.length > 0 && (
            <div className={styles.resultSection}>
              <h4>Strengths</h4>
              <ul>
                {result.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {result.weaknesses.length > 0 && (
            <div className={styles.resultSection}>
              <h4>Weaknesses</h4>
              <ul>
                {result.weaknesses.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {result.suggestions.length > 0 && (
            <div className={styles.resultSection}>
              <h4>Suggestions</h4>
              <ul>
                {result.suggestions.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {result.keywordGaps && result.keywordGaps.length > 0 && (
            <div className={styles.resultSection}>
              <h4>Keyword Gaps</h4>
              <ul>
                {result.keywordGaps.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
