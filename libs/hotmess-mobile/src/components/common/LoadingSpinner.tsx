import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
}

export function LoadingSpinner({ size = 'large' }: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
