import { useRouter } from 'expo-router';
import {
  addDays,
  addWeeks,
  format,
  isSameDay,
  isToday,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryBreakdownList } from '@/components/analytics/CategoryBreakdownList';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Timeline } from '@/components/timeline/Timeline';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing, typography } from '@/lib/theme';
import { useActivityStore } from '@/store/activityStore';
import { useAuthStore } from '@/store/authStore';
import { useCategoryStore } from '@/store/categoryStore';
import { calculateDailyStats } from '@/utils/analytics';
import { formatDuration, formatTime, getActivitiesForDay, getUniqueLoggedMinutes } from '@/utils/time';
import type { Activity } from '@/types';

type ViewMode = 'month' | 'week' | 'day';

export default function CalendarScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  const { categories, fetch: fetchCategories } = useCategoryStore();
  const { activities, fetchRange } = useActivityStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const loadData = useCallback(async () => {
    if (user) await fetchCategories(user.id);
    const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    start.setDate(start.getDate() - 7);
    const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 7, 23, 59, 59);
    await fetchRange(start, end);
  }, [user, selectedDate, fetchCategories, fetchRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = calculateDailyStats(activities, categories, selectedDate);
  const selectedDayActivities = useMemo(
    () => getActivitiesForDay(activities, selectedDate),
    [activities, selectedDate],
  );

  const markedDates = useMemo(() => {
    const marks: Record<
      string,
      { marked: boolean; dotColor: string; selected?: boolean; selectedColor?: string }
    > = {};
    activities.forEach((activity) => {
      const day = format(new Date(activity.start_time), 'yyyy-MM-dd');
      marks[day] = {
        marked: true,
        dotColor: activity.category?.color ?? colors.primary,
      };
    });
    marks[dateStr] = {
      ...marks[dateStr],
      selected: true,
      selectedColor: colors.primary,
      marked: marks[dateStr]?.marked ?? false,
      dotColor: marks[dateStr]?.dotColor ?? colors.primary,
    };
    return marks;
  }, [activities, dateStr, colors.primary]);

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

  const shiftDay = (delta: number) => {
    setSelectedDate((prev) => addDays(prev, delta));
  };

  const shiftWeek = (delta: number) => {
    setSelectedDate((prev) => (delta > 0 ? addWeeks(prev, 1) : subWeeks(prev, 1)));
  };

  const openDayView = (day: Date) => {
    setSelectedDate(day);
    setViewMode('day');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: 100 }}
      >
        <Text style={[styles.title, { color: colors.text, paddingHorizontal: spacing.lg }]}>
          Calendar
        </Text>

        <View style={[styles.viewToggle, { marginHorizontal: spacing.lg }]}>
          {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
            <Pressable
              key={mode}
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: viewMode === mode ? colors.primary : colors.surfaceSecondary,
                },
              ]}
              onPress={() => setViewMode(mode)}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: viewMode === mode ? '#FFF' : colors.textSecondary },
                ]}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* MONTH VIEW */}
        {viewMode === 'month' && (
          <>
            <Calendar
              current={dateStr}
              onDayPress={(day) => {
                setSelectedDate(new Date(day.dateString));
              }}
              markedDates={markedDates}
              theme={{
                backgroundColor: colors.background,
                calendarBackground: colors.background,
                textSectionTitleColor: colors.textSecondary,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: colors.primary,
                dayTextColor: colors.text,
                textDisabledColor: colors.textMuted,
                monthTextColor: colors.text,
                arrowColor: colors.primary,
              }}
              style={styles.calendar}
            />

            <Card style={styles.summaryCard}>
              <View style={styles.monthDayHeader}>
                <View>
                  <Text style={[styles.dayTitle, { color: colors.text, marginBottom: 0 }]}>
                    {format(selectedDate, 'EEEE, MMM d')}
                  </Text>
                  <Text style={[styles.loggedText, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                    {formatDuration(stats.uniqueLoggedMinutes)} logged ·{' '}
                    {formatDuration(stats.unloggedMinutes)} unlogged
                  </Text>
                </View>
                <Pressable
                  onPress={() => setViewMode('day')}
                  style={[styles.viewDayBtn, { backgroundColor: colors.primaryLight }]}
                >
                  <Text style={[styles.viewDayBtnText, { color: colors.primary }]}>Timeline</Text>
                </Pressable>
              </View>

              {stats.categoryBreakdown.length > 0 && (
                <View style={{ marginTop: spacing.lg }}>
                  <CategoryBreakdownList
                    breakdown={stats.categoryBreakdown}
                    showUnlogged={stats.unloggedMinutes}
                  />
                </View>
              )}
            </Card>

            <Text
              style={[
                styles.activitiesHeading,
                { color: colors.text, paddingHorizontal: spacing.lg },
              ]}
            >
              Activities ({selectedDayActivities.length})
            </Text>

            <View style={styles.activityList}>
              {selectedDayActivities.length === 0 ? (
                <Card style={styles.emptyActivityCard}>
                  <Text style={[styles.emptyActivityText, { color: colors.textMuted }]}>
                    No activities logged on this day.
                  </Text>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: '/activity/add',
                        params: {
                          start: new Date(
                            selectedDate.getFullYear(),
                            selectedDate.getMonth(),
                            selectedDate.getDate(),
                            9,
                            0,
                          ).toISOString(),
                          end: new Date(
                            selectedDate.getFullYear(),
                            selectedDate.getMonth(),
                            selectedDate.getDate(),
                            10,
                            0,
                          ).toISOString(),
                        },
                      })
                    }
                    style={[styles.singleLogBtn, { backgroundColor: colors.primary }]}
                  >
                    <Text style={styles.singleLogBtnText}>+ Log Time</Text>
                  </Pressable>
                </Card>
              ) : (
                selectedDayActivities.map((activity) => (
                  <Pressable
                    key={activity.id}
                    onPress={() => router.push(`/activity/edit/${activity.id}`)}
                    style={[
                      styles.activityCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderLeftColor: activity.category?.color ?? colors.primary,
                      },
                    ]}
                  >
                    <Text style={[styles.activityTitle, { color: colors.text }]}>
                      {activity.category?.icon ?? '📌'} {activity.title}
                    </Text>
                    <Text style={[styles.activityMeta, { color: colors.textSecondary }]}>
                      {formatTime(activity.start_time)} – {formatTime(activity.end_time)} ·{' '}
                      {formatDuration(activity.duration_minutes)}
                    </Text>
                    {activity.category && (
                      <Text style={[styles.activityCategory, { color: colors.textMuted }]}>
                        {activity.category.name}
                      </Text>
                    )}
                  </Pressable>
                ))
              )}
            </View>
          </>
        )}

        {/* WEEK VIEW — 7 days */}
        {viewMode === 'week' && (
          <>
            <View style={styles.navRow}>
              <Pressable
                onPress={() => shiftWeek(-1)}
                style={[styles.navBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <Text style={[styles.navBtnText, { color: colors.text }]}>‹</Text>
              </Pressable>
              <Text style={[styles.weekRange, { color: colors.text }]}>
                {format(weekDays[0], 'MMM d')} – {format(weekDays[6], 'MMM d, yyyy')}
              </Text>
              <Pressable
                onPress={() => shiftWeek(1)}
                style={[styles.navBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <Text style={[styles.navBtnText, { color: colors.text }]}>›</Text>
              </Pressable>
            </View>

            <View style={styles.weekList}>
              {weekDays.map((day) => {
                const dayStats = calculateDailyStats(activities, categories, day);
                const logged = getUniqueLoggedMinutes(activities, day);
                const progress = (logged / (24 * 60)) * 100;
                const selected = isSameDay(day, selectedDate);
                const today = isToday(day);
                const topCategories = dayStats.categoryBreakdown.slice(0, 4);

                return (
                  <Pressable
                    key={day.toISOString()}
                    onPress={() => openDayView(day)}
                    style={[
                      styles.weekDayCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: selected ? colors.primary : colors.border,
                        borderWidth: selected ? 2 : 1,
                      },
                    ]}
                  >
                    <View style={styles.weekDayHeader}>
                      <View>
                        <Text
                          style={[
                            styles.weekDayName,
                            { color: today ? colors.primary : colors.textSecondary },
                          ]}
                        >
                          {format(day, 'EEE')}
                          {today ? ' · Today' : ''}
                        </Text>
                        <Text style={[styles.weekDayDate, { color: colors.text }]}>
                          {format(day, 'MMM d')}
                        </Text>
                      </View>
                      <Text style={[styles.weekDayHours, { color: colors.text }]}>
                        {formatDuration(logged)}
                      </Text>
                    </View>

                    <ProgressBar progress={progress} height={6} color={colors.primary} />

                    {topCategories.length > 0 ? (
                      <View style={styles.categoryDots}>
                        {topCategories.map((cat) => (
                          <View key={cat.categoryId} style={styles.categoryChip}>
                            <View style={[styles.dot, { backgroundColor: cat.color }]} />
                            <Text style={[styles.chipText, { color: colors.textSecondary }]}>
                              {cat.icon} {formatDuration(cat.minutes)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={[styles.emptyDay, { color: colors.textMuted }]}>
                        No activities logged
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* DAY VIEW — full 24h timeline */}
        {viewMode === 'day' && (
          <>
            <View style={styles.navRow}>
              <Pressable
                onPress={() => shiftDay(-1)}
                style={[styles.navBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <Text style={[styles.navBtnText, { color: colors.text }]}>‹</Text>
              </Pressable>
              <View style={styles.dayNavCenter}>
                <Text style={[styles.dayNavTitle, { color: colors.text }]}>
                  {format(selectedDate, 'EEEE')}
                </Text>
                <Text style={[styles.dayNavSub, { color: colors.textSecondary }]}>
                  {format(selectedDate, 'MMMM d, yyyy')}
                  {isToday(selectedDate) ? ' · Today' : ''}
                </Text>
              </View>
              <Pressable
                onPress={() => shiftDay(1)}
                style={[styles.navBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <Text style={[styles.navBtnText, { color: colors.text }]}>›</Text>
              </Pressable>
            </View>

            <Card style={styles.summaryCard}>
              <Text style={[styles.loggedText, { color: colors.textSecondary, marginBottom: spacing.md }]}>
                {formatDuration(stats.uniqueLoggedMinutes)} / 24h logged ·{' '}
                {formatDuration(stats.unloggedMinutes)} remaining
              </Text>
              <ProgressBar
                progress={(stats.uniqueLoggedMinutes / (24 * 60)) * 100}
                color={colors.primary}
              />
              {stats.categoryBreakdown.length > 0 && (
                <View style={{ marginTop: spacing.lg }}>
                  <CategoryBreakdownList
                    breakdown={stats.categoryBreakdown}
                    showUnlogged={stats.unloggedMinutes}
                  />
                </View>
              )}
            </Card>

            <Text
              style={[
                styles.timelineHeading,
                { color: colors.text, paddingHorizontal: spacing.lg },
              ]}
            >
              24-Hour Timeline
            </Text>
            <Timeline
              activities={getActivitiesForDay(activities, selectedDate)}
              date={selectedDate}
              onHourPress={handleHourPress}
              onActivityPress={(a: Activity) => router.push(`/activity/edit/${a.id}`)}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { ...typography.h1, marginBottom: spacing.lg },
  viewToggle: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleText: { ...typography.caption, fontWeight: '600' },
  calendar: { marginBottom: spacing.lg },
  summaryCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  dayTitle: { ...typography.h3, marginBottom: spacing.xs },
  loggedText: { ...typography.caption },
  monthDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  viewDayBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  viewDayBtnText: { ...typography.caption, fontWeight: '700' },
  activitiesHeading: { ...typography.h3, marginBottom: spacing.md },
  activityList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  activityCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: spacing.lg,
  },
  activityTitle: { ...typography.bodyBold, marginBottom: spacing.xs },
  activityMeta: { ...typography.caption },
  activityCategory: { ...typography.small, marginTop: spacing.xs },
  emptyActivityCard: { alignItems: 'center', gap: spacing.md },
  emptyActivityText: { ...typography.body, textAlign: 'center' },
  singleLogBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  singleLogBtnText: { color: '#FFF', ...typography.bodyBold },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: { fontSize: 24, fontWeight: '600', lineHeight: 28 },
  weekRange: { ...typography.bodyBold },
  dayNavCenter: { alignItems: 'center' },
  dayNavTitle: { ...typography.h3 },
  dayNavSub: { ...typography.caption, marginTop: 2 },
  weekList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  weekDayCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  weekDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  weekDayName: { ...typography.caption, fontWeight: '600', textTransform: 'uppercase' },
  weekDayDate: { ...typography.h3, marginTop: 2 },
  weekDayHours: { ...typography.bodyBold },
  categoryDots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: { ...typography.small },
  emptyDay: { ...typography.caption, fontStyle: 'italic' },
  timelineHeading: { ...typography.h3, marginBottom: spacing.md },
});
