import { View, Text, StyleSheet, ScrollView, SafeAreaView, Switch } from 'react-native';
import { useState } from 'react';
import { colors, spacing, typography } from '../../theme';

interface NotificationSetting {
  key: string;
  label: string;
  description: string;
}

const NOTIFICATION_SETTINGS: Array<{ category: string; settings: NotificationSetting[] }> = [
  {
    category: 'Game Notifications',
    settings: [
      { key: 'game_reminders', label: 'Game Reminders', description: 'Reminder before your games' },
      { key: 'score_updates', label: 'Score Updates', description: 'When game scores are posted' },
      {
        key: 'schedule_changes',
        label: 'Schedule Changes',
        description: 'When games are rescheduled or cancelled',
      },
    ],
  },
  {
    category: 'Team Notifications',
    settings: [
      { key: 'team_messages', label: 'Team Messages', description: 'New messages in team chat' },
      {
        key: 'captain_messages',
        label: 'Captain Messages',
        description: 'Messages in captain chat',
      },
      { key: 'roster_updates', label: 'Roster Updates', description: 'When players join or leave' },
    ],
  },
  {
    category: 'League Notifications',
    settings: [
      {
        key: 'announcements',
        label: 'Announcements',
        description: 'League-wide announcements',
      },
      {
        key: 'registration_deadlines',
        label: 'Registration Deadlines',
        description: 'Reminders about registration windows',
      },
      {
        key: 'superlative_voting',
        label: 'Superlative Voting',
        description: 'When voting opens for superlatives',
      },
    ],
  },
  {
    category: 'Direct Messages',
    settings: [
      {
        key: 'direct_messages',
        label: 'Direct Messages',
        description: 'Personal messages from other players',
      },
    ],
  },
];

export function NotificationPreferencesScreen() {
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [preferences, setPreferences] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {};
    for (const category of NOTIFICATION_SETTINGS) {
      for (const setting of category.settings) {
        defaults[setting.key] = true;
      }
    }
    return defaults;
  });

  const togglePreference = (key: string) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Global Toggle */}
        <View style={styles.globalToggle}>
          <View style={styles.toggleInfo}>
            <Text style={styles.globalLabel}>Push Notifications</Text>
            <Text style={styles.globalDescription}>
              {globalEnabled ? 'Notifications are enabled' : 'All notifications are off'}
            </Text>
          </View>
          <Switch
            value={globalEnabled}
            onValueChange={setGlobalEnabled}
            trackColor={{ false: colors.bgTertiary, true: colors.primary }}
            thumbColor={colors.textPrimary}
          />
        </View>

        {/* Category Sections */}
        {globalEnabled &&
          NOTIFICATION_SETTINGS.map((category) => (
            <View key={category.category} style={styles.section}>
              <Text style={styles.sectionTitle}>{category.category}</Text>
              {category.settings.map((setting) => (
                <View key={setting.key} style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>{setting.label}</Text>
                    <Text style={styles.settingDescription}>{setting.description}</Text>
                  </View>
                  <Switch
                    value={preferences[setting.key]}
                    onValueChange={() => togglePreference(setting.key)}
                    trackColor={{ false: colors.bgTertiary, true: colors.primary }}
                    thumbColor={colors.textPrimary}
                  />
                </View>
              ))}
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  scrollView: {
    flex: 1,
  },
  globalToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  toggleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  globalLabel: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  globalDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    paddingTop: spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: typography.fontSizes.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.medium,
  },
  settingDescription: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
