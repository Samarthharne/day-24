import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CategoryPicker } from '@/components/categories/CategoryPicker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/lib/theme';
import { useAuthStore } from '@/store/authStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useGoalStore } from '@/store/goalStore';
import { getFriendlyError } from '@/utils/validation';
import type { GoalPeriod } from '@/types';

export default function AddGoalScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { categories, fetch: fetchCategories } = useCategoryStore();
  const { create } = useGoalStore();

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [targetHours, setTargetHours] = useState('20');
  const [period, setPeriod] = useState<GoalPeriod>('weekly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) fetchCategories(user.id);
  }, [user, fetchCategories]);

  const periods: GoalPeriod[] = ['daily', 'weekly', 'monthly'];

  const handleSave = async () => {
    if (!user || !title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    try {
      await create(user.id, {
        title,
        category_id: categoryId ?? undefined,
        target_minutes: parseInt(targetHours, 10) * 60,
        period_type: period,
        start_date: new Date().toISOString().split('T')[0],
      });
      router.back();
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scroll}>
      <Input label="Goal Title" value={title} onChangeText={setTitle} placeholder="e.g. Study 20 hours per week" />
      <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
      <CategoryPicker categories={categories} selectedId={categoryId} onSelect={setCategoryId} />

      <Input label="Target Hours" value={targetHours} onChangeText={setTargetHours} keyboardType="numeric" />

      <Text style={[styles.label, { color: colors.textSecondary }]}>Period</Text>
      <View style={styles.periodRow}>
        {periods.map((p) => (
          <Pressable
            key={p}
            style={[styles.periodBtn, { backgroundColor: period === p ? colors.primary : colors.surfaceSecondary }]}
            onPress={() => setPeriod(p)}
          >
            <Text style={{ color: period === p ? '#FFF' : colors.text, fontWeight: '600', textTransform: 'capitalize' }}>
              {p}
            </Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
      <Button title="Create Goal" onPress={handleSave} loading={loading} fullWidth />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  label: { ...typography.caption, fontWeight: '500' },
  periodRow: { flexDirection: 'row', gap: spacing.sm },
  periodBtn: { flex: 1, padding: spacing.md, borderRadius: 8, alignItems: 'center' },
  error: { ...typography.caption, textAlign: 'center' },
});
