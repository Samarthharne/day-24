import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { FloatingLogButton } from '@/components/ui/FloatingLogButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TimelineSkeleton } from '@/components/ui/LoadingSkeleton';
import { Timeline } from '@/components/timeline/Timeline';
import { TimerWidget } from '@/components/timer/TimerWidget';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/lib/theme';
import { useActivityStore } from '@/store/activityStore';
import { useAuthStore } from '@/store/authStore';
import { useCategoryStore } from '@/store/categoryStore';
import { calculateDailyStats } from '@/utils/analytics';
import { formatDate, formatDuration } from '@/utils/time';
import type { Activity } from '@/types';

export default function TodayScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  const { categories, fetch: fetchCategories } = useCategoryStore();
  const { activities, loading, fetchForDay, selectedDate } = useActivityStore();

  const loadData = useCallback(async () => {
    if (user) await fetchCategories(user.id);
    await fetchForDay(selectedDate);
  }, [user, selectedDate, fetchCategories, fetchForDay]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = calculateDailyStats(activities, categories, selectedDate);
  const loggedHours = Math.floor(stats.uniqueLoggedMinutes / 60);
  const loggedMins = stats.uniqueLoggedMinutes % 60;
  const progress = (stats.uniqueLoggedMinutes / (24 * 60)) * 100;

  const handleHourPress = (hour: number) => {
    const start = new Date(selectedDate);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(hour + 1, 0, 0, 0);
    router.push({
      pathname: '/activity/add',
      params: { start: start.toISOString(), end: end.toISOString() },
    });
  };

  const handleActivityPress = (activity: Activity) => {
    router.push(`/activity/edit/${activity.id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.lg }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
      >
        <View style={styles.header}>
          <Text style={[styles.date, { color: colors.text }]}>{formatDate(selectedDate)}</Text>
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <Card style={styles.progressCard}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            You have logged {loggedHours}h {loggedMins > 0 ? `${loggedMins}m` : ''} of 24 hours
          </Text>
          <ProgressBar progress={progress} showPercentage color={colors.primary} />
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatDuration(stats.uniqueLoggedMinutes)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Logged</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatDuration(stats.unloggedMinutes)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Remaining</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {stats.productivityScore}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Productivity</Text>
            </View>
          </View>
        </Card>

        <TimerWidget />

        {loading && activities.length === 0 ? (
          <TimelineSkeleton />
        ) : activities.length === 0 ? (
          <EmptyState
            icon="⏰"
            title="Your day is waiting to be tracked"
            description="Start logging your first activity to see your 24-hour timeline."
          />
        ) : (
          <Timeline
            activities={activities}
            date={selectedDate}
            onHourPress={handleHourPress}
            onActivityPress={handleActivityPress}
          />
        )}
      </ScrollView>

      <FloatingLogButton onPress={() => router.push('/activity/add')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 120 },
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  date: { ...typography.h2 },
  time: { ...typography.body, marginTop: spacing.xs },
  progressCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  progressLabel: { ...typography.caption, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', marginTop: spacing.lg },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { ...typography.h3 },
  statLabel: { ...typography.small, marginTop: 2 },
});
