'use client';

import { useRef, type ReactNode } from 'react';
import BackButton from './BackButton';
import DownloadPdfButton from './DownloadPdfButton';
import styles from '../print.module.scss';

interface ResumePreviewFrameProps {
  children: ReactNode;
  fileName: string;
}

// The actual template markup is rendered server-side (page.tsx) and passed
// in as children — only the ref + download button need to be client-side.
export default function ResumePreviewFrame({ children, fileName }: ResumePreviewFrameProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className={styles.printBar}>
        <BackButton />
        <DownloadPdfButton targetRef={sheetRef} fileName={fileName} />
      </div>
      <div className={styles.printSheet} ref={sheetRef}>
        {children}
      </div>
    </>
  );
}
