import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { type MatchWithGameId, buildFeederLookup } from '../../../utils/divisionLettering';
import { findTimeSlotIndex } from '../../../utils/rainbowColors';
import { PDF_COLORS, PAGE, getSlotColor } from './pdfTheme';

const COL_TIME = 60;
const COL_GAME = 36;
const COL_VS = 20;
const COL_TEAM = 130;

const styles = StyleSheet.create({
  page: {
    width: PAGE.width,
    height: PAGE.height,
    padding: PAGE.margin,
    backgroundColor: PDF_COLORS.background,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  date: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: PDF_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  fieldSection: {
    marginBottom: 14,
  },
  fieldHeader: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.text,
    borderBottomWidth: 1.5,
    borderBottomColor: PDF_COLORS.line,
    paddingBottom: 3,
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_COLORS.border,
    paddingBottom: 2,
    marginBottom: 2,
  },
  headerCell: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.textMuted,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2.5,
    borderBottomWidth: 0.25,
    borderBottomColor: '#eeeeee',
  },
  cellTime: {
    width: COL_TIME,
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
  },
  cellGame: {
    width: COL_GAME,
    fontSize: 7.5,
    fontFamily: 'Courier',
    fontWeight: 700,
    color: PDF_COLORS.text,
  },
  cellTeam: {
    width: COL_TEAM,
    fontSize: 7.5,
    fontFamily: 'Helvetica',
    color: PDF_COLORS.text,
  },
  cellVs: {
    width: COL_VS,
    fontSize: 6.5,
    fontFamily: 'Helvetica',
    color: PDF_COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  feeder: {
    fontFamily: 'Courier',
    color: PDF_COLORS.primary,
    fontSize: 7,
  },
  tbd: {
    color: PDF_COLORS.textMuted,
    fontSize: 7,
  },
});

function formatTime(scheduledAt: string | undefined): string {
  if (!scheduledAt) {
    return '\u2014';
  }
  const d = new Date(scheduledAt);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m} ${ampm}`;
}

interface SchedulePdfPageProps {
  matches: MatchWithGameId[];
  timeSlots: string[];
  seasonName: string;
  tournamentDate: string;
}

export function SchedulePdfPage({
  matches,
  timeSlots,
  seasonName,
  tournamentDate,
}: SchedulePdfPageProps) {
  const feederLookup = buildFeederLookup(matches);

  // Group by play area
  const matchesByField = new Map<string, MatchWithGameId[]>();
  for (const match of matches) {
    const field = match.play_area || 'Unassigned';
    if (!matchesByField.has(field)) {
      matchesByField.set(field, []);
    }
    const fieldArr = matchesByField.get(field);
    if (fieldArr) {
      fieldArr.push(match);
    }
  }
  for (const [, fieldMatches] of matchesByField) {
    fieldMatches.sort((a, b) => {
      const aTime = a.scheduled_at ? new Date(a.scheduled_at).getTime() : Infinity;
      const bTime = b.scheduled_at ? new Date(b.scheduled_at).getTime() : Infinity;
      return aTime - bTime;
    });
  }

  return (
    <Page size="LETTER" style={styles.page} wrap>
      <Text style={styles.title}>{seasonName} — Master Schedule</Text>
      <Text style={styles.date}>{tournamentDate}</Text>

      {Array.from(matchesByField.entries()).map(([field, fieldMatches]) => (
        <View key={field} style={styles.fieldSection} wrap={false}>
          <Text style={styles.fieldHeader}>{field}</Text>

          {/* Table header */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, { width: COL_TIME }]}>Time</Text>
            <Text style={[styles.headerCell, { width: COL_GAME }]}>Game</Text>
            <Text style={[styles.headerCell, { width: COL_TEAM }]}>Home</Text>
            <Text style={[styles.headerCell, { width: COL_VS }]} />
            <Text style={[styles.headerCell, { width: COL_TEAM }]}>Away</Text>
          </View>

          {/* Table rows */}
          {fieldMatches.map((match) => {
            const slotIdx = findTimeSlotIndex(match.scheduled_at, timeSlots);
            const color = getSlotColor(slotIdx);
            const feeders = feederLookup.get(match.id);

            const homeName = match.team1?.name;
            const awayName = match.team2?.name;
            const homeFeeder = feeders?.homeFeeder;
            const awayFeeder = feeders?.awayFeeder;

            return (
              <View key={match.id} style={styles.row}>
                <Text style={[styles.cellTime, { color }]}>{formatTime(match.scheduled_at)}</Text>
                <Text style={styles.cellGame}>{match.gameId}</Text>
                <Text
                  style={
                    homeName
                      ? styles.cellTeam
                      : homeFeeder
                        ? [styles.cellTeam, styles.feeder]
                        : [styles.cellTeam, styles.tbd]
                  }
                >
                  {homeName || homeFeeder || '\u2014'}
                </Text>
                <Text style={styles.cellVs}>vs</Text>
                <Text
                  style={
                    awayName
                      ? styles.cellTeam
                      : awayFeeder
                        ? [styles.cellTeam, styles.feeder]
                        : [styles.cellTeam, styles.tbd]
                  }
                >
                  {awayName || awayFeeder || '\u2014'}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </Page>
  );
}
