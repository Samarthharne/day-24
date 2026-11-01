import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/lib/theme';
import { useAuthStore } from '@/store/authStore';
import { useTaskStore } from '@/store/taskStore';
import { formatDuration } from '@/utils/time';

export default function TaskDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { tasks, complete, remove } = useTaskStore();
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
          Task not found
        </Text>
      </View>
    );
  }

  const handleComplete = async () => {
    await complete(id);
    router.back();
  };

  const handleSchedule = () => {
    const now = new Date();
    const end = new Date(now.getTime() + (task.estimated_duration_minutes ?? 60) * 60000);
    router.push({
      pathname: '/activity/add',
      params: { start: now.toISOString(), end: end.toISOString() },
    });
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await remove(id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scroll}>
      <Card>
        <Text style={[styles.priority, { color: colors.warning }]}>{task.priority.toUpperCase()}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{task.title}</Text>
        {task.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]}>{task.description}</Text>
        )}
        {task.category && (
          <Text style={[styles.category, { color: colors.textSecondary }]}>
            {task.category.icon} {task.category.name}
          </Text>
        )}
        {task.estimated_duration_minutes && (
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            Estimated: {formatDuration(task.estimated_duration_minutes)}
          </Text>
        )}
        {task.actual_duration_minutes > 0 && (
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            Actual: {formatDuration(task.actual_duration_minutes)}
          </Text>
        )}
      </Card>

      {task.status === 'pending' && (
        <>
          <Button title="Mark Complete" onPress={handleComplete} fullWidth />
          <Button title="Schedule into Calendar" variant="secondary" onPress={handleSchedule} fullWidth />
        </>
      )}
      <Button title="Delete Task" variant="danger" onPress={handleDelete} fullWidth />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  priority: { ...typography.small, fontWeight: '700', marginBottom: spacing.sm },
  title: { ...typography.h2, marginBottom: spacing.md },
  description: { ...typography.body, marginBottom: spacing.md },
  category: { ...typography.body, marginBottom: spacing.sm },
  meta: { ...typography.caption },
});
