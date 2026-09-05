'use client';

import { useState, type RefObject } from 'react';
import { Button, useToast } from '@true-tech-team/react-components';

interface DownloadPdfButtonProps {
  targetRef: RefObject<HTMLDivElement | null>;
  fileName: string;
}

// Renders the resume sheet to a PDF entirely client-side (html2canvas + jsPDF)
// instead of going through the browser's print dialog — that dialog can add
// its own date/title/URL header and footer that a page has no way to
// suppress, which isn't part of the resume. This way the PDF only ever
// contains exactly what's in the preview.
export default function DownloadPdfButton({ targetRef, fileName }: DownloadPdfButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const toast = useToast();

  const handleDownload = async () => {
    const node = targetRef.current;
    if (!node) {
      return;
    }
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF({ unit: 'pt', format: 'letter' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png');

      // Multi-page resumes: slice the one tall rendered image across pages.
      // This is a plain pixel-height split, not content-aware, so a section
      // that would avoid a page break under real print CSS can still land
      // right on a page boundary here — an accepted tradeoff for a resume
      // that's designed to fit on one page in the first place.
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(fileName);
    } catch {
      toast.error('Could not generate the PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button variant="primary" onClick={() => void handleDownload()} loading={downloading}>
      Download PDF
    </Button>
  );
}
