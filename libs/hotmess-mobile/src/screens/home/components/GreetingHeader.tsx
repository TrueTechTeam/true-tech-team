import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

interface GreetingHeaderProps {
  displayName: string;
}

export function GreetingHeader({ displayName }: GreetingHeaderProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../../assets/hotmess-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.greetingRow}>
        <Text style={styles.greeting}>Hey, {displayName}!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgSecondary,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 32,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
  },
  icon: {
    marginRight: spacing.sm,
  },
  greeting: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
});
