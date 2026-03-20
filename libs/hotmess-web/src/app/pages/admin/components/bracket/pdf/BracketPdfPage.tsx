import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { BracketMatch } from '../../../../../../hooks/useBracketMatches';
import { PdfBracketDiagram } from './PdfBracketDiagram';
import { PDF_COLORS, PAGE, USABLE } from './pdfTheme';

const styles = StyleSheet.create({
  page: {
    width: PAGE.width,
    height: PAGE.height,
    padding: PAGE.margin,
    backgroundColor: PDF_COLORS.background,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  divisionTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  bracketArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: PDF_COLORS.border,
  },
  sportTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateText: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: PDF_COLORS.textSecondary,
    marginTop: 3,
    textTransform: 'uppercase',
  },
});

// Reserve space for header and footer
const HEADER_HEIGHT = 50;
const FOOTER_HEIGHT = 50;
const BRACKET_AREA_HEIGHT = USABLE.height - HEADER_HEIGHT - FOOTER_HEIGHT;

interface BracketPdfPageProps {
  divisionName: string;
  divisionLetter: string;
  matches: BracketMatch[];
  teamSeedMap?: Map<string, number>;
  timeSlots: string[];
  sportName: string;
  tournamentDate: string;
}

export function BracketPdfPage({
  divisionName,
  divisionLetter,
  matches,
  teamSeedMap,
  timeSlots,
  sportName,
  tournamentDate,
}: BracketPdfPageProps) {
  const titleText = divisionLetter
    ? `${divisionName}`
    : divisionName;

  return (
    <Page size="LETTER" style={styles.page}>
      {/* Header: Division name */}
      <View style={styles.header}>
        <Text style={styles.divisionTitle}>{titleText}</Text>
      </View>

      {/* Bracket diagram */}
      <View style={styles.bracketArea}>
        <PdfBracketDiagram
          matches={matches}
          teamSeedMap={teamSeedMap}
          timeSlots={timeSlots}
          areaWidth={USABLE.width}
          areaHeight={BRACKET_AREA_HEIGHT}
        />
      </View>

      {/* Footer: Sport + date */}
      <View style={styles.footer}>
        <Text style={styles.sportTitle}>{sportName} Tournament</Text>
        <Text style={styles.dateText}>{formatTournamentDate(tournamentDate)}</Text>
      </View>
    </Page>
  );
}

function formatTournamentDate(dateStr: string): string {
  if (!dateStr) { return ''; }
  const d = new Date(`${dateStr}T12:00:00`); // avoid timezone shift
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const day = days[d.getDay()];
  const month = months[d.getMonth()];
  const date = d.getDate();
  const suffix = getOrdinalSuffix(date);
  return `${day}, ${month} ${date}${suffix}`;
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
