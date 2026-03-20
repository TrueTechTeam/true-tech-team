import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function SectionCard({ title, children, style }: SectionCardProps) {
  return (
    <View style={[styles.card, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  title: {
    fontSize: typography.fontSizes.sm,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
});
