import { useState } from 'react';
import { Button } from '@true-tech-team/ui-components';
import type { BracketMatch } from '../../../../../hooks/useBracketMatches';
import type { MatchWithGameId } from '../../utils/divisionLettering';
import { generateBracketPdf } from './pdf/generateBracketPdf';
import styles from './BracketExport.module.scss';

interface BracketExportProps {
  seasonName: string;
  tournamentDate: string;
  sportName: string;
  brackets: Array<{
    bracketId: string;
    divisionName: string;
    divisionLetter: string;
    matches: BracketMatch[];
    teamSeedMap?: Map<string, number>;
  }>;
  masterScheduleMatches: MatchWithGameId[];
  timeSlots: string[];
}

function matchesToCsv(brackets: BracketExportProps['brackets'], tournamentDate: string): string {
  const allMatches = brackets.flatMap((b) => b.matches);
  const header = 'Round,Match,Team 1,Team 2,Time,Play Area,Status';
  const rows = allMatches
    .sort((a, b) => a.round - b.round || a.position - b.position)
    .map((m) => {
      const time = m.scheduled_at
        ? new Date(m.scheduled_at).toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
          })
        : '';
      const status = m.winner_id ? 'Complete' : 'Pending';
      return [
        m.round,
        m.position + 1,
        m.team1?.name || '',
        m.team2?.name || '',
        time,
        m.play_area || '',
        status,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',');
    });

  return [`Date: ${tournamentDate}`, '', header, ...rows].join('\n');
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function BracketExport({
  seasonName,
  tournamentDate,
  sportName,
  brackets,
  masterScheduleMatches,
  timeSlots,
}: BracketExportProps) {
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handleDownloadCsv = () => {
    const csv = matchesToCsv(brackets, tournamentDate);
    const filename = `${seasonName}-bracket.csv`.replace(/\s+/g, '-').toLowerCase();
    downloadFile(csv, filename, 'text/csv');
  };

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      await generateBracketPdf({
        seasonName,
        tournamentDate,
        sportName,
        brackets,
        masterSchedule: {
          matches: masterScheduleMatches,
          timeSlots,
        },
      });
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className={styles.exportActions}>
      <Button variant="outline" size="sm" onClick={handleDownloadCsv}>
        Download CSV
      </Button>
      <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={generatingPdf}>
        {generatingPdf ? 'Generating...' : 'Download PDF'}
      </Button>
    </div>
  );
}
