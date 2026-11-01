import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/lib/theme';
import type { Task } from '@/types';
import { formatShortDate } from '@/utils/time';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
  onComplete: () => void;
}

const priorityColors = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

export function TaskItem({ task, onPress, onComplete }: TaskItemProps) {
  const { colors } = useTheme();
  const isCompleted = task.status === 'completed';

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <Pressable
          style={[
            styles.checkbox,
            {
              borderColor: isCompleted ? colors.success : colors.border,
              backgroundColor: isCompleted ? colors.success : 'transparent',
            },
          ]}
          onPress={onComplete}
        >
          {isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </Pressable>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.priority, { backgroundColor: priorityColors[task.priority] + '20' }]}>
              <Text style={[styles.priorityText, { color: priorityColors[task.priority] }]}>
                {task.priority.toUpperCase()}
              </Text>
            </View>
            {task.category && (
              <Text style={styles.category}>
                {task.category.icon} {task.category.name}
              </Text>
            )}
          </View>
          <Text
            style={[
              styles.title,
              { color: colors.text },
              isCompleted && styles.completed,
            ]}
          >
            {task.title}
          </Text>
          {task.due_date && (
            <Text style={[styles.due, { color: colors.textSecondary }]}>
              Due {formatShortDate(task.due_date)}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priority: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    ...typography.small,
    fontWeight: '700',
  },
  category: {
    ...typography.small,
  },
  title: {
    ...typography.bodyBold,
  },
  completed: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  due: {
    ...typography.caption,
  },
});
