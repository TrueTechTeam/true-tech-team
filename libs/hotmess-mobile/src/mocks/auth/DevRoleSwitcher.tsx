import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, SafeAreaView } from 'react-native';
import { useMockAuth } from './MockAuthProvider';
import { UserRole } from './mock-users';
import { colors } from '../../theme';

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Admin]: 'Admin',
  [UserRole.Commissioner]: 'Commissioner',
  [UserRole.Manager]: 'Manager',
  [UserRole.Referee]: 'Referee',
  [UserRole.TeamCaptain]: 'Captain',
  [UserRole.Player]: 'Player',
};

const ROLE_ORDER: UserRole[] = [
  UserRole.Admin,
  UserRole.Commissioner,
  UserRole.Manager,
  UserRole.Referee,
  UserRole.TeamCaptain,
  UserRole.Player,
];

export function DevRoleSwitcher() {
  const { role, setRole } = useMockAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsExpanded(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabBadge}>DEV</Text>
        <Text style={styles.fabRole}>{ROLE_LABELS[role]}</Text>
      </TouchableOpacity>

      <Modal
        visible={isExpanded}
        transparent
        animationType="fade"
        onRequestClose={() => setIsExpanded(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsExpanded(false)}
        >
          <SafeAreaView>
            <View style={styles.panel}>
              <Text style={styles.header}>Switch Role</Text>
              {ROLE_ORDER.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleButton, r === role && styles.activeRole]}
                  onPress={() => {
                    setRole(r);
                    setIsExpanded(false);
                  }}
                >
                  <Text style={[styles.roleText, r === role && styles.activeRoleText]}>
                    {ROLE_LABELS[r]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    backgroundColor: colors.accent,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  fabBadge: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fabRole: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  panel: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 1,
  },
  roleButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 4,
  },
  activeRole: {
    backgroundColor: `${colors.accent  }33`,
  },
  roleText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  activeRoleText: {
    color: colors.accent,
    fontWeight: '700',
  },
});
