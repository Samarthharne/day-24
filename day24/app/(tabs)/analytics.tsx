import { format, subWeeks } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryBreakdownList } from '@/components/analytics/CategoryBreakdownList';
import { DonutChart } from '@/components/analytics/DonutChart';
import { InsightCard } from '@/components/analytics/InsightCard';
import { WeeklyBarChart } from '@/components/analytics/WeeklyBarChart';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/lib/theme';
import { useActivityStore } from '@/store/activityStore';
import { useAuthStore } from '@/store/authStore';
import { useCategoryStore } from '@/store/categoryStore';
import {
  calculateDailyStats,
  calculatePeriodCategoryTotals,
  getWeeklyComparison,
} from '@/utils/analytics';
import { generateInsights } from '@/utils/insights';
import {
  formatDuration,
  getActivitiesInRange,
  getDateRange,
  getDaysInRange,
  getUniqueLoggedMinutes,
} from '@/utils/time';
import type { AnalyticsPeriod } from '@/types';

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { categories, fetch: fetchCategories } = useCategoryStore();
  const { activities, fetchRange } = useActivityStore();
  const [period, setPeriod] = useState<AnalyticsPeriod>('daily');
  const [referenceDate] = useState(new Date());

  const loadData = useCallback(async () => {
    if (user) await fetchCategories(user.id);
    const range = getDateRange(period === 'custom' ? 'monthly' : period, referenceDate);
    await fetchRange(range.start, range.end);
  }, [user, period, referenceDate, fetchCategories, fetchRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const range = getDateRange(period === 'custom' ? 'monthly' : period, referenceDate);
  const periodActivities = getActivitiesInRange(activities, range.start, range.end);
  const breakdown = calculatePeriodCategoryTotals(periodActivities, categories, range.start, range.end);
  const insights = generateInsights(periodActivities, categories, referenceDate);

  const dailyStats = calculateDailyStats(activities, categories, referenceDate);

  const weeklyBarData = useMemo(() => {
    if (period !== 'weekly') return { labels: [], data: [] };
    const days = getDaysInRange(range.start, range.end);
    return {
      labels: days.map((d) => format(d, 'EEE')),
      data: days.map((d) => ({
        label: format(d, 'EEE'),
        value: getUniqueLoggedMinutes(periodActivities, d) / 60,
        color: colors.primary,
      })),
    };
  }, [period, range, periodActivities, colors.primary]);

  const lastWeekRange = getDateRange('weekly', subWeeks(referenceDate, 1));
  const thisWeekMinutes = breakdown.reduce((s, b) => s + b.minutes, 0);
  const lastWeekActivities = getActivitiesInRange(
    activities,
    lastWeekRange.start,
    lastWeekRange.end,
  );
  const lastWeekBreakdown = calculatePeriodCategoryTotals(
    lastWeekActivities,
    categories,
    lastWeekRange.start,
    lastWeekRange.end,
  );
  const lastWeekMinutes = lastWeekBreakdown.reduce((s, b) => s + b.minutes, 0);
  const weekComparison = getWeeklyComparison(thisWeekMinutes, lastWeekMinutes);

  const periods: AnalyticsPeriod[] = ['daily', 'weekly', 'monthly'];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: 100 }}
    >
      <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>

      <View style={styles.tabs}>
        {periods.map((p) => (
          <Pressable
            key={p}
            style={[
              styles.tab,
              { backgroundColor: period === p ? colors.primary : colors.surfaceSecondary },
            ]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.tabText, { color: period === p ? '#FFF' : colors.textSecondary }]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {period === 'daily' && (
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Today's Overview</Text>
          <Text style={[styles.bigStat, { color: colors.text }]}>
            {formatDuration(dailyStats.uniqueLoggedMinutes)} / 24h
          </Text>
          <ProgressBar
            progress={(dailyStats.uniqueLoggedMinutes / (24 * 60)) * 100}
            label="Logged"
            color={colors.primary}
          />
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Productivity Score</Text>
            <Text style={[styles.scoreValue, { color: colors.primary }]}>
              {dailyStats.productivityScore}%
            </Text>
          </View>
          <ProgressBar progress={dailyStats.productivityScore} color={colors.success} />
        </Card>
      )}

      {period === 'weekly' && (
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Weekly Trend</Text>
          <Text style={[styles.comparison, { color: colors.textSecondary }]}>
            {weekComparison.direction === 'up' ? '↑' : weekComparison.direction === 'down' ? '↓' : '→'}{' '}
            {formatDuration(Math.abs(weekComparison.diff))} vs last week
          </Text>
          <WeeklyBarChart labels={weeklyBarData.labels} data={weeklyBarData.data} />
        </Card>
      )}

      <Card style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Category Breakdown</Text>
        <DonutChart data={breakdown} />
        <CategoryBreakdownList breakdown={breakdown} />
      </Card>

      <View style={styles.insights}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Insights</Text>
        {insights.length === 0 ? (
          <Card>
            <Text style={[styles.emptyInsight, { color: colors.textSecondary }]}>
              Start tracking your time to unlock personal productivity insights.
            </Text>
          </Card>
        ) : (
          insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { ...typography.h1, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: { ...typography.caption, fontWeight: '600' },
  card: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  cardTitle: { ...typography.h3, marginBottom: spacing.md },
  bigStat: { ...typography.h1, marginBottom: spacing.md },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  scoreLabel: { ...typography.body },
  scoreValue: { ...typography.h3 },
  comparison: { ...typography.body, marginBottom: spacing.md },
  insights: { paddingHorizontal: spacing.lg },
  sectionTitle: { ...typography.h3, marginBottom: spacing.md },
  emptyInsight: { ...typography.body, textAlign: 'center' },
});
