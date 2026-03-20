import { Document } from '@react-pdf/renderer';
import type { BracketMatch } from '../../../../../../hooks/useBracketMatches';
import type { MatchWithGameId } from '../../../utils/divisionLettering';
import { BracketPdfPage } from './BracketPdfPage';
import { SchedulePdfPage } from './SchedulePdfPage';

export interface BracketPdfDocumentProps {
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
  masterSchedule: {
    matches: MatchWithGameId[];
    timeSlots: string[];
  };
}

export function BracketPdfDocument({
  seasonName,
  tournamentDate,
  sportName,
  brackets,
  masterSchedule,
}: BracketPdfDocumentProps) {
  return (
    <Document title={`${seasonName} - Brackets`} author="Hotmess Sports">
      {/* One page per division bracket */}
      {brackets.map((bracket) => (
        <BracketPdfPage
          key={bracket.bracketId}
          divisionName={bracket.divisionName}
          divisionLetter={bracket.divisionLetter}
          matches={bracket.matches}
          teamSeedMap={bracket.teamSeedMap}
          timeSlots={masterSchedule.timeSlots}
          sportName={sportName}
          tournamentDate={tournamentDate}
        />
      ))}

      {/* Final page(s): master schedule */}
      {masterSchedule.matches.length > 0 && (
        <SchedulePdfPage
          matches={masterSchedule.matches}
          timeSlots={masterSchedule.timeSlots}
          seasonName={seasonName}
          tournamentDate={tournamentDate}
        />
      )}
    </Document>
  );
}
