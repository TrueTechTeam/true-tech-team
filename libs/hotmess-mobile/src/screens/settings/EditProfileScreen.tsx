import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../contexts';
import { supabase } from '../../lib/supabase';

export function EditProfileScreen() {
  const navigation = useNavigation();
  const { profile, refreshProfile } = useAuth();

  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [preferredName, setPreferredName] = useState(profile?.preferred_name ?? '');
  const [location, setLocation] = useState(profile?.location ?? '');
  const [instagramUrl, setInstagramUrl] = useState(profile?.instagram_url ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!profile?.id) {
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Required', 'First name and last name are required.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          preferred_name: preferredName.trim() || null,
          location: location.trim() || null,
          instagram_url: instagramUrl.trim() || null,
        })
        .eq('id', profile.id);

      if (error) {
        throw error;
      }

      await refreshProfile();
      Alert.alert('Saved', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Preferred Name</Text>
          <Text style={styles.hint}>This is the name other players will see</Text>
          <TextInput
            style={styles.input}
            value={preferredName}
            onChangeText={setPreferredName}
            placeholder="Preferred name (optional)"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.readonlyValue}>{profile?.email ?? '—'}</Text>
          <Text style={styles.hint}>
            Email is managed through SportsEngine and cannot be changed here
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="City, State (optional)"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Instagram</Text>
          <Text style={styles.hint}>Your Instagram handle will be visible on your profile</Text>
          <TextInput
            style={styles.input}
            value={instagramUrl}
            onChangeText={setInstagramUrl}
            placeholder="@username"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
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
  section: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: typography.fontSizes.base,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  readonlyValue: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: typography.fontSizes.base,
    color: colors.textSecondary,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  saveButton: {
    margin: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.semibold,
    fontSize: typography.fontSizes.base,
  },
});
