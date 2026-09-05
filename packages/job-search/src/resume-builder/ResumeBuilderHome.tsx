'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, IconButton, Spinner, useToast } from '@true-tech-team/react-components';
import type {
  CreateDocumentPayload,
  ResumeData,
  ResumeDocument,
  UpdateDocumentPayload,
} from './lib/types';
import { createEmptyResumeData } from './editor/emptyResumeData';
import { TEMPLATES, getTemplateById } from './templates/registry';
import TemplateDialog from './TemplateDialog';
import ContentDialog from './ContentDialog';
import styles from './ResumeBuilderHome.module.scss';

const RESUME_NAME = 'My Resume';

interface ResumeBuilderHomeProps {
  // Set when arriving from a job's "Generate Resume" action with no resume
  // yet (see JobSearchOverview's handleGenerateResume) — seeds the target
  // job description used by the Content dialog's AI tools once a template
  // exists.
  seedTargetJobDescription?: string;
}

// Each user has exactly one resume (see
// supabase/009_resume_builder_single_primary.sql): no template yet shows an
// empty state with a "Create Template" action; once one exists, this page is
// just a preview of it plus two entry points — Change Template and Edit
// Content — that each open a focused dialog. No more multi-step wizard.
export default function ResumeBuilderHome({ seedTargetJobDescription }: ResumeBuilderHomeProps) {
  const toast = useToast();
  const [resumeDoc, setResumeDoc] = useState<ResumeDocument | null | undefined>(undefined);
  const [targetJobDescription, setTargetJobDescription] = useState(seedTargetJobDescription ?? '');
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/resume-builder/documents')
      .then((res) => (res.ok ? (res.json() as Promise<{ document: ResumeDocument | null }>) : null))
      .then((data) => {
        if (!cancelled) {
          setResumeDoc(data?.document ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResumeDoc(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectTemplate = useCallback(
    async (templateId: string) => {
      setSavingTemplate(true);
      try {
        if (!resumeDoc) {
          const payload: CreateDocumentPayload = {
            name: RESUME_NAME,
            templateId,
            data: createEmptyResumeData(),
          };
          const res = await fetch('/api/resume-builder/documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            throw new Error('Failed to create resume');
          }
          const { document: created } = (await res.json()) as { document: ResumeDocument };
          setResumeDoc(created);
        } else {
          const payload: UpdateDocumentPayload = { templateId };
          const res = await fetch(`/api/resume-builder/documents/${resumeDoc.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            throw new Error('Failed to update template');
          }
          setResumeDoc((prev) => (prev ? { ...prev, templateId } : prev));
        }
      } catch {
        toast.error('Could not save your template choice');
      } finally {
        setSavingTemplate(false);
      }
    },
    [resumeDoc, toast]
  );

  const handleContentChange = useCallback(
    (data: ResumeData) => {
      setResumeDoc((prev) => (prev ? { ...prev, data } : prev));
      if (!resumeDoc) {
        return;
      }
      const payload: UpdateDocumentPayload = { data };
      void fetch(`/api/resume-builder/documents/${resumeDoc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => toast.error('Could not save your changes'));
    },
    [resumeDoc, toast]
  );

  if (resumeDoc === undefined) {
    return (
      <div className={styles.loading}>
        <Spinner size="lg" />
      </div>
    );
  }

  const template = resumeDoc ? getTemplateById(resumeDoc.templateId) : undefined;
  const TemplateComponent = template?.component;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/job-search">
          <IconButton icon="arrow-left" aria-label="Back to Job Search" variant="ghost" />
        </Link>
        <h1 className={styles.title}>Resume Builder</h1>
      </div>

      {!resumeDoc ? (
        <div className={styles.empty}>
          <p>You don&apos;t have a resume template yet.</p>
          <Button variant="primary" onClick={() => setTemplateDialogOpen(true)}>
            Create Template
          </Button>
        </div>
      ) : (
        <>
          <div className={styles.actions}>
            <Button
              variant="outline"
              onClick={() => setTemplateDialogOpen(true)}
              loading={savingTemplate}
            >
              Change Template
            </Button>
            <Button variant="outline" onClick={() => setContentDialogOpen(true)}>
              Edit Content
            </Button>
            <Link href={`/resume-print/${resumeDoc.id}`} className={styles.printLink}>
              Print / Download PDF
            </Link>
          </div>

          <div className={styles.preview}>
            {TemplateComponent ? (
              <TemplateComponent data={resumeDoc.data} />
            ) : (
              <p className={styles.missingTemplate}>Template not found.</p>
            )}
          </div>
        </>
      )}

      <TemplateDialog
        isOpen={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        currentTemplateId={resumeDoc?.templateId ?? TEMPLATES[0]?.id ?? null}
        draft={resumeDoc?.data ?? createEmptyResumeData()}
        onSelect={handleSelectTemplate}
      />

      {resumeDoc && (
        <ContentDialog
          isOpen={contentDialogOpen}
          onClose={() => setContentDialogOpen(false)}
          documentId={resumeDoc.id}
          draft={resumeDoc.data}
          onChange={handleContentChange}
          targetJobDescription={targetJobDescription}
          onTargetJobDescriptionChange={setTargetJobDescription}
        />
      )}
    </div>
  );
}
