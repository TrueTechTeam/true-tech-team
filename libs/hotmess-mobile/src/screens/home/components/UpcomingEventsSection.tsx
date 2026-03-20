import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../../../theme';

type EventType = 'game' | 'registration_closes' | 'calendar';

interface EventItem {
  id: string;
  type: EventType;
  title: string;
  subtitle?: string;
  date: string;
  onPress?: () => void;
}

interface UpcomingEventsSectionProps {
  games: Array<{
    id: string;
    scheduled_at: string;
    home_team?: { id?: string; name: string };
    away_team?: { id?: string; name: string };
    venue?: { name: string; address?: string };
    venues?: { name: string; address?: string };
  }> | null;
  registrationSeasons: Array<{
    id: string;
    name: string;
    registration_end_date?: string;
    leagues?: {
      name: string;
      sports?: { name: string };
      cities?: { name: string };
    };
  }> | null;
}

const EVENT_COLORS: Record<EventType, string> = {
  game: colors.primary,
  registration_closes: colors.secondary,
  calendar: colors.accent,
};

const EVENT_LABELS: Record<EventType, string> = {
  game: 'Game',
  registration_closes: 'Registration',
  calendar: 'Event',
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function UpcomingEventsSection({ games, registrationSeasons }: UpcomingEventsSectionProps) {
  const navigation = useNavigation();

  const events: EventItem[] = [];

  // Add games as events
  if (games) {
    for (const game of games) {
      events.push({
        id: `game-${game.id}`,
        type: 'game',
        title: `${game.home_team?.name} vs. ${game.away_team?.name}`,
        subtitle: game.venues?.name || game.venue?.name || 'TBD',
        date: game.scheduled_at,
        onPress: () =>
          navigation.navigate('GameDetails' as never, { gameId: game.id } as never),
      });
    }
  }

  // Add registration deadlines as events (tapping opens registration)
  if (registrationSeasons) {
    for (const season of registrationSeasons) {
      if (season.registration_end_date) {
        const cityName = season.leagues?.cities?.name || '';
        const sportName = season.leagues?.sports?.name || '';
        events.push({
          id: `reg-${season.id}`,
          type: 'registration_closes',
          title: `${cityName} ${sportName} Registration Closes`,
          subtitle: season.name,
          date: season.registration_end_date,
          onPress: () => {
            Alert.alert(
              'Register',
              `Open registration for ${season.name}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Register',
                  onPress: () =>
                    Linking.openURL('https://hotmesssports.com/register'),
                },
              ]
            );
          },
        });
      }
    }
  }

  // Sort all events by date
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (events.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Upcoming Events</Text>
      <View style={styles.eventList}>
        {events.map((event) => {
          const eventColor = EVENT_COLORS[event.type];

          return (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              activeOpacity={0.7}
              onPress={event.onPress}
            >
              <View style={[styles.datePanel, { backgroundColor: eventColor }]}>
                <Text style={styles.datePanelText}>{formatDate(event.date)}</Text>
                <Text style={styles.timePanelText}>{formatTime(event.date)}</Text>
              </View>
              <View style={styles.eventContent}>
                <Text style={[styles.eventTag, { color: eventColor }]}>
                  {EVENT_LABELS[event.type]}
                </Text>
                <Text style={styles.eventTitle} numberOfLines={1}>
                  {event.title}
                </Text>
                {event.subtitle && (
                  <Text style={styles.eventSubtitle} numberOfLines={1}>
                    {event.subtitle}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  eventList: {
    gap: spacing.sm,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  datePanel: {
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  datePanelText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.sm,
    textAlign: 'center',
  },
  timePanelText: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  eventContent: {
    flex: 1,
    padding: spacing.md,
    gap: 2,
  },
  eventTag: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  eventTitle: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  eventSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
});
