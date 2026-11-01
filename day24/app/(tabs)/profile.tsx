import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/lib/theme';
import { useActivityStore } from '@/store/activityStore';
import { useAuthStore } from '@/store/authStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useGoalStore } from '@/store/goalStore';
import { useTaskStore } from '@/store/taskStore';
import { calculateStreak } from '@/utils/insights';

const MENU_ITEMS = [
  { icon: '🎯', label: 'Goals', route: '/goal' },
  { icon: '🏷️', label: 'Categories', route: '/settings/categories' },
  { icon: '🔔', label: 'Notifications', route: '/settings/notifications' },
  { icon: '🔍', label: 'Search Activities', route: '/search' },
];

export default function ProfileScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile, signOut } = useAuthStore();
  const { goals, fetch: fetchGoals } = useGoalStore();
  const { activities, fetchRange } = useActivityStore();

  const loadData = useCallback(async () => {
    await fetchGoals();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    await fetchRange(start, new Date());
  }, [fetchGoals, fetchRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loggingStreak = calculateStreak(activities, null);

  const performSignOut = async () => {
    try {
      useActivityStore.setState({ activities: [] });
      useCategoryStore.setState({ categories: [] });
      useTaskStore.setState({ tasks: [] });
      useGoalStore.setState({ goals: [] });
      await signOut();
      router.replace('/(auth)/login');
    } catch {
      router.replace('/(auth)/login');
    }
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined'
          ? window.confirm('Are you sure you want to sign out?')
          : true;
      if (confirmed) {
        void performSignOut();
      }
      return;
    }

    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          void performSignOut();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: 100 }}
    >
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
          <Text style={styles.avatarText}>
            {(profile?.name ?? user?.email ?? 'U')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>
          {profile?.name ?? 'User'}
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {user?.email ?? profile?.email}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{loggingStreak}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Day Streak</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statIcon}>🎯</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{goals.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Goals</Text>
        </Card>
      </View>

      <View style={styles.menu}>
        {MENU_ITEMS.map((item) => (
          <Pressable
            key={item.route}
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push(item.route as never)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
            <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={[styles.signOut, { borderColor: colors.error }]} onPress={handleSignOut}>
        <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#6366F1' },
  name: { ...typography.h2 },
  email: { ...typography.body, marginTop: spacing.xs },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statIcon: { fontSize: 24, marginBottom: spacing.xs },
  statValue: { ...typography.h2 },
  statLabel: { ...typography.caption },
  menu: { paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.xl },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
  },
  menuIcon: { fontSize: 20, marginRight: spacing.md },
  menuLabel: { ...typography.bodyBold, flex: 1 },
  chevron: { fontSize: 20 },
  signOut: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  signOutText: { ...typography.bodyBold },
});
