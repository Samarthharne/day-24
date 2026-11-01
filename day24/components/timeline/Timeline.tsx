import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing, typography } from '@/lib/theme';
import type { Activity } from '@/types';
import {
  formatDuration,
  formatTime,
  getActivitiesForDay,
  getHourLabel,
  getTimelinePosition,
  HOUR_HEIGHT,
  isCurrentHour,
} from '@/utils/time';

interface TimelineProps {
  activities: Activity[];
  date: Date;
  onHourPress: (hour: number) => void;
  onActivityPress: (activity: Activity) => void;
}

export function Timeline({ activities, date, onHourPress, onActivityPress }: TimelineProps) {
  const { colors } = useTheme();
  const dayActivities = getActivitiesForDay(activities, date);
  const timelineHeight = HOUR_HEIGHT * 24;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.timeline, { height: timelineHeight }]}>
        {Array.from({ length: 24 }).map((_, hour) => (
          <Pressable
            key={hour}
            style={[
              styles.hourRow,
              { height: HOUR_HEIGHT, borderBottomColor: colors.border },
              isCurrentHour(hour) && { backgroundColor: colors.primaryLight + '40' },
            ]}
            onPress={() => onHourPress(hour)}
          >
            <Text style={[styles.hourLabel, { color: colors.textMuted }]}>
              {getHourLabel(hour)}
            </Text>
            <View style={styles.hourContent}>
              {!dayActivities.some((a) => {
                const pos = getTimelinePosition(new Date(a.start_time), new Date(a.end_time), date);
                const hourTop = hour * HOUR_HEIGHT;
                const hourBottom = (hour + 1) * HOUR_HEIGHT;
                return pos.top < hourBottom && pos.top + pos.height > hourTop;
              }) && (
                <Text style={[styles.addHint, { color: colors.textMuted }]}>+ Add activity</Text>
              )}
            </View>
          </Pressable>
        ))}

        {dayActivities.map((activity) => {
          const start = new Date(activity.start_time);
          const end = new Date(activity.end_time);
          const pos = getTimelinePosition(start, end, date);
          const categoryColor = activity.category?.color ?? colors.primary;

          return (
            <Pressable
              key={activity.id}
              style={[
                styles.activityBlock,
                {
                  top: pos.top,
                  height: pos.height,
                  left: 72,
                  right: spacing.lg,
                  backgroundColor: categoryColor + '20',
                  borderLeftColor: categoryColor,
                },
              ]}
              onPress={() => onActivityPress(activity)}
            >
              <Text style={[styles.activityTitle, { color: colors.text }]} numberOfLines={1}>
                {activity.category?.icon} {activity.title}
              </Text>
              {activity.description && (
                <Text style={[styles.activityDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                  {activity.description}
                </Text>
              )}
              <Text style={[styles.activityMeta, { color: colors.textMuted }]}>
                {formatTime(start)} – {formatTime(end)} · {formatDuration(activity.duration_minutes)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  timeline: {
    position: 'relative',
    marginHorizontal: spacing.lg,
  },
  hourRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'flex-start',
    paddingTop: spacing.xs,
  },
  hourLabel: {
    ...typography.small,
    width: 56,
    textAlign: 'right',
    paddingRight: spacing.sm,
  },
  hourContent: {
    flex: 1,
    paddingLeft: spacing.md,
    paddingTop: spacing.xs,
  },
  addHint: {
    ...typography.caption,
    fontStyle: 'italic',
  },
  activityBlock: {
    position: 'absolute',
    borderLeftWidth: 3,
    borderRadius: radius.md,
    padding: spacing.sm,
    justifyContent: 'center',
    zIndex: 10,
  },
  activityTitle: {
    ...typography.bodyBold,
    fontSize: 14,
  },
  activityDesc: {
    ...typography.caption,
    marginTop: 2,
  },
  activityMeta: {
    ...typography.small,
    marginTop: 2,
  },
});
