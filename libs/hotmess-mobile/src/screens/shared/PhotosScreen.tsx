import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, tabColors, spacing, typography } from '../../theme';

export function PhotosScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="camera" size={24} color={tabColors.Photos} style={styles.headerIcon} />
          <Text style={styles.title}>Photos</Text>
        </View>
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>+ Upload</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📷</Text>
          <Text style={styles.emptyTitle}>No Photos Yet</Text>
          <Text style={styles.emptyText}>
            Capture the action! Upload photos from your games and events.
          </Text>
          <TouchableOpacity style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Upload Your First Photo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
    paddingTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  uploadButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.semibold,
    fontSize: typography.fontSizes.sm,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    marginTop: spacing['3xl'],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  emptyButtonText: {
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },
});
