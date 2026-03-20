import { View, Text, StyleSheet, ScrollView, SafeAreaView, Switch } from 'react-native';
import { useState } from 'react';
import { colors, spacing, typography } from '../../theme';

interface PrivacySetting {
  key: string;
  label: string;
  description: string;
}

const PRIVACY_SETTINGS: Array<{ category: string; settings: PrivacySetting[] }> = [
  {
    category: 'Profile Visibility',
    settings: [
      {
        key: 'show_profile',
        label: 'Public Profile',
        description: 'Allow other players to view your profile',
      },
      {
        key: 'show_email',
        label: 'Show Email',
        description: 'Display your email address on your profile',
      },
      {
        key: 'show_teams',
        label: 'Show Teams',
        description: 'Display your current and past teams on your profile',
      },
    ],
  },
  {
    category: 'Communication',
    settings: [
      {
        key: 'allow_direct_messages',
        label: 'Direct Messages',
        description: 'Allow other players to send you direct messages',
      },
      {
        key: 'allow_team_invites',
        label: 'Team Invites',
        description: 'Allow captains to send you team invitations',
      },
    ],
  },
  {
    category: 'Activity',
    settings: [
      {
        key: 'show_stats',
        label: 'Show Stats',
        description: 'Display your game statistics publicly',
      },
      {
        key: 'show_superlatives',
        label: 'Show Superlatives',
        description: 'Display superlative awards on your profile',
      },
    ],
  },
];

export function PrivacyScreen() {
  const [preferences, setPreferences] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {};
    for (const category of PRIVACY_SETTINGS) {
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
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Control what other players can see and how they can interact with you.
          </Text>
        </View>

        {PRIVACY_SETTINGS.map((category) => (
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
  infoBox: {
    backgroundColor: colors.bgSecondary,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  infoText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
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
