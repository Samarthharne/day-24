import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/lib/theme';
import type { Goal } from '@/types';
import { formatDuration } from '@/utils/time';

interface GoalProgressCardProps {
  goal: Goal;
  currentMinutes: number;
  percentage: number;
}

export function GoalProgressCard({ goal, currentMinutes, percentage }: GoalProgressCardProps) {
  const { colors } = useTheme();
  const categoryColor = goal.category?.color ?? colors.primary;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>{goal.category?.icon ?? '🎯'}</Text>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]}>{goal.title}</Text>
          <Text style={[styles.period, { color: colors.textSecondary }]}>
            {goal.period_type} goal
          </Text>
        </View>
      </View>
      <ProgressBar progress={percentage} color={categoryColor} />
      <Text style={[styles.stats, { color: colors.textSecondary }]}>
        {formatDuration(currentMinutes)} / {formatDuration(goal.target_minutes)}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 28,
  },
  info: {
    flex: 1,
  },
  title: {
    ...typography.bodyBold,
  },
  period: {
    ...typography.caption,
    textTransform: 'capitalize',
  },
  stats: {
    ...typography.caption,
    fontWeight: '600',
    marginTop: spacing.sm,
    textAlign: 'right',
  },
});
