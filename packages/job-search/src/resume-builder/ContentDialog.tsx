'use client';

import { useState } from 'react';
import { Dialog, Tabs, TabList, Tab, Textarea, Button } from '@true-tech-team/react-components';
import { ResumeUploadParse } from '@true-tech-team/dashboard-kit';
import type { ResumeData, ResumeDataWithSuggestions } from './lib/types';
import type { JobSearchProfile, JobSearchProfilePayload } from '../lib/types';
import { mapResumeDataToProfilePayload, mapSuggestedSearchPreferences } from '../lib/resumeImport';
import ManualFillSection from './editor/ManualFillSection';
import AIAssistFillButton from './editor/AIAssistFillButton';
import CritiquePanel from './editor/CritiquePanel';
import styles from './ContentDialog.module.scss';

type ContentMode = 'manual' | 'upload';

// If the user doesn't have a Job Search profile yet, seed one from whatever
// a parsed resume tells us — they can refine it later from Job Search
// Settings. Silently a no-op if a profile already exists or the requests
// fail; this is a convenience, not a required step.
async function configureJobSearchProfileIfMissing(data: ResumeDataWithSuggestions) {
  try {
    const res = await fetch('/api/job-search/profile');
    if (!res.ok) {
      return;
    }
    const { profile } = (await res.json()) as { profile: JobSearchProfile | null };
    if (profile) {
      return;
    }

    const payload: JobSearchProfilePayload = {
      ...mapResumeDataToProfilePayload(data),
      targetTitle: null,
      industry: null,
      orgTypes: [],
      dreamCompanies: null,
      priorities: [],
      searchLocation: null,
      workType: 'any',
      willingToRelocate: false,
      salaryMin: null,
      salaryMax: null,
      experienceLevel: 'mid',
      skillsFocus: null,
      excitingWork: null,
      idealWorkday: null,
      careerGoal: null,
      avoidTypes: null,
      openPrompt: null,
      // A starting point the candidate can edit, inferred from their resume.
      ...mapSuggestedSearchPreferences(data),
    };

    await fetch('/api/job-search/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Non-fatal — the user can still fill out their Job Search profile
    // manually later.
  }
}

interface ContentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  draft: ResumeData;
  // Persists immediately (the parent PATCHes the resume document) — there's
  // no separate save step inside this dialog.
  onChange: (data: ResumeData) => void;
  targetJobDescription: string;
  onTargetJobDescriptionChange: (value: string) => void;
}

export default function ContentDialog({
  isOpen,
  onClose,
  documentId,
  draft,
  onChange,
  targetJobDescription,
  onTargetJobDescriptionChange,
}: ContentDialogProps) {
  const [mode, setMode] = useState<ContentMode>('manual');
  const [showCritique, setShowCritique] = useState(false);
  const [fillUsageRefreshKey, setFillUsageRefreshKey] = useState(0);
  const bumpFillUsage = () => setFillUsageRefreshKey((k) => k + 1);

  const handleParsed = (data: ResumeDataWithSuggestions) => {
    onChange(data);
    setMode('manual');
    void configureJobSearchProfileIfMissing(data);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onOpenChange={(open) => !open && onClose()}
      title="Edit Resume Content"
      size="xl"
    >
      <div className={styles.body}>
        <Textarea
          label="Target job description (optional)"
          helperText="Paste a job posting to tailor AI-generated content toward it."
          value={targetJobDescription}
          onChange={(e) => onTargetJobDescriptionChange(e.target.value)}
          rows={3}
        />

        <div className={styles.aiActions}>
          <AIAssistFillButton
            draft={draft}
            targetJobDescription={targetJobDescription}
            onApply={onChange}
            onUsed={bumpFillUsage}
            usageRefreshKey={fillUsageRefreshKey}
          />
          <Button variant="outline" onClick={() => setShowCritique((v) => !v)}>
            {showCritique ? 'Hide AI Feedback' : 'Get AI Feedback'}
          </Button>
        </div>

        {showCritique && (
          <CritiquePanel
            resumeData={draft}
            targetJobDescription={targetJobDescription}
            documentId={documentId}
          />
        )}

        <Tabs value={mode} onChange={(v) => setMode(v as ContentMode)}>
          <TabList>
            <Tab value="manual">Fill manually</Tab>
            <Tab value="upload">Upload existing resume</Tab>
          </TabList>
        </Tabs>

        <div className={styles.modeBody}>
          {mode === 'manual' ? (
            <ManualFillSection draft={draft} onChange={onChange} />
          ) : (
            <ResumeUploadParse<ResumeDataWithSuggestions>
              uploadUrl="/api/resume-builder/upload"
              usageUrl="/api/resume-builder/usage?slot=fill"
              onParsed={handleParsed}
              onUsed={bumpFillUsage}
              usageRefreshKey={fillUsageRefreshKey}
            />
          )}
        </div>
      </div>
    </Dialog>
  );
}
