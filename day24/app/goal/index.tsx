import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GoalProgressCard } from '@/components/goals/GoalProgressCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/lib/theme';
import { useActivityStore } from '@/store/activityStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useGoalStore } from '@/store/goalStore';
import { calculateGoalProgress } from '@/utils/analytics';
import { getDateRange } from '@/utils/time';

export default function GoalsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { goals, fetch: fetchGoals } = useGoalStore();
  const { activities, fetchRange } = useActivityStore();
  const { categories } = useCategoryStore();

  const loadData = useCallback(async () => {
    await fetchGoals();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    await fetchRange(start, new Date());
  }, [fetchGoals, fetchRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Goals</Text>
          <Pressable
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/goal/add')}
          >
            <Text style={styles.addText}>+ Add</Text>
          </Pressable>
        </View>

        {goals.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="No goals yet"
            description="Set time-based goals and track your progress automatically."
            actionLabel="Add Goal"
            onAction={() => router.push('/goal/add')}
          />
        ) : (
          goals.map((goal) => {
            const range = getDateRange(
              goal.period_type === 'daily' ? 'daily' : goal.period_type === 'weekly' ? 'weekly' : 'monthly',
              new Date(),
            );
            const progress = calculateGoalProgress(
              goal.target_minutes,
              activities,
              goal.category_id,
              range.start,
              range.end,
            );
            return (
              <GoalProgressCard
                key={goal.id}
                goal={goal}
                currentMinutes={progress.currentMinutes}
                percentage={progress.percentage}
              />
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: { ...typography.h1 },
  addBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 8 },
  addText: { color: '#FFF', ...typography.bodyBold },
});
