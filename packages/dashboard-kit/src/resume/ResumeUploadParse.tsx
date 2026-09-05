'use client';

import { useEffect, useState } from 'react';
import { FilePicker, Button, Tooltip, useToast } from '@true-tech-team/react-components';
import { useUsageStatus } from '../useUsageStatus';
import { useAgentStream } from './useAgentStream';
import styles from './ResumeUploadParse.module.scss';

export interface ResumeUploadParseProps<TResult> {
  // POSTs a multipart 'file' field, streams back an AgentStreamEvent<TResult>
  // NDJSON response (e.g. /api/resume-builder/upload).
  uploadUrl: string;
  // Usage-status endpoint for the shared parse quota (e.g.
  // /api/resume-builder/usage?slot=fill).
  usageUrl: string;
  onParsed: (data: TResult) => void;
  // Called once the stream finishes — callers use this to bump their own
  // usage-status refresh key.
  onUsed?: () => void;
  usageRefreshKey?: number;
  successMessage?: string;
}

// Generic resume upload-and-parse control: pick a file, hit an upload
// endpoint that extracts its text and runs a fill-style agent over it, and
// hand the parsed result back to the caller. Shared by the Resume Builder
// wizard's Content step and the Job Search profile dialog's "Import from
// Resume" section — both point it at the same
// /api/resume-builder/upload endpoint but do different things with the
// result, so this component stays generic over the parsed shape.
export default function ResumeUploadParse<TResult>({
  uploadUrl,
  usageUrl,
  onParsed,
  onUsed,
  usageRefreshKey,
  successMessage = 'Resume parsed — review and edit below',
}: ResumeUploadParseProps<TResult>) {
  const [file, setFile] = useState<File | null>(null);
  const toast = useToast();
  const usage = useUsageStatus(usageUrl, usageRefreshKey);
  const { status, result, errorMessage, run } = useAgentStream<TResult>({ onDone: onUsed });

  useEffect(() => {
    if (status === 'done' && result) {
      onParsed(result);
      toast.success(successMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when a new result actually lands
  }, [status, result]);

  const handleFileChange = (files: File[]) => {
    setFile(files[0] ?? null);
  };

  const handleUpload = () => {
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    void run({ url: uploadUrl, body: formData });
  };

  const usageExhausted = usage !== null && !usage.allowed;

  return (
    <div className={styles.section}>
      <FilePicker
        label="Upload your existing resume"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
        buttonText="Choose file"
        dragAndDrop
        helperText="PDF, Word, or plain text."
      />

      <Tooltip content="You've hit your daily AI usage limit." disabled={!usageExhausted}>
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={!file || status === 'streaming' || usageExhausted}
          loading={status === 'streaming'}
        >
          Parse resume
        </Button>
      </Tooltip>

      {status === 'error' && errorMessage && <div className={styles.error}>{errorMessage}</div>}
    </div>
  );
}
