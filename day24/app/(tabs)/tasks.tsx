import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TaskItem } from '@/components/tasks/TaskItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/lib/theme';
import { useTaskStore } from '@/store/taskStore';

export default function TasksScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tasks, loading, fetch, complete } = useTaskStore();

  const loadTasks = useCallback(async () => {
    await fetch();
  }, [fetch]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: 100 }}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Tasks</Text>
          <Pressable
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/task/add')}
          >
            <Text style={styles.addText}>+ Add</Text>
          </Pressable>
        </View>

        {pendingTasks.length === 0 && completedTasks.length === 0 ? (
          <EmptyState
            icon="✅"
            title="No tasks yet"
            description="Create tasks and schedule them into your day."
            actionLabel="Add Task"
            onAction={() => router.push('/task/add')}
          />
        ) : (
          <>
            {pendingTasks.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  TO DO ({pendingTasks.length})
                </Text>
                {pendingTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onPress={() => router.push(`/task/${task.id}`)}
                    onComplete={() => complete(task.id)}
                  />
                ))}
              </View>
            )}
            {completedTasks.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  COMPLETED ({completedTasks.length})
                </Text>
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onPress={() => router.push(`/task/${task.id}`)}
                    onComplete={() => {}}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: { ...typography.h1 },
  addBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  addText: { color: '#FFF', ...typography.bodyBold },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  sectionTitle: { ...typography.small, fontWeight: '700', marginBottom: spacing.md, letterSpacing: 1 },
});
