import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CategoryPicker } from '@/components/categories/CategoryPicker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/lib/theme';
import { useAuthStore } from '@/store/authStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useTaskStore } from '@/store/taskStore';
import { getFriendlyError } from '@/utils/validation';
import type { Priority } from '@/types';

export default function AddTaskScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { categories, fetch: fetchCategories } = useCategoryStore();
  const { create } = useTaskStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>('medium');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) fetchCategories(user.id);
  }, [user, fetchCategories]);

  const handleSave = async () => {
    if (!user || !title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    try {
      await create(user.id, {
        title,
        description,
        category_id: categoryId ?? undefined,
        priority,
        estimated_duration_minutes: estimatedHours ? parseInt(estimatedHours, 10) * 60 : undefined,
      });
      router.back();
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const priorities: Priority[] = ['high', 'medium', 'low'];
  const priorityColors = { high: colors.error, medium: colors.warning, low: colors.success };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Input label="Task Title" value={title} onChangeText={setTitle} placeholder="What needs to be done?" />
        <Input label="Description" value={description} onChangeText={setDescription} multiline placeholder="Notes..." />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
        <CategoryPicker categories={categories} selectedId={categoryId} onSelect={setCategoryId} />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Priority</Text>
        <View style={styles.priorityRow}>
          {priorities.map((p) => (
            <Pressable
              key={p}
              style={[
                styles.priorityBtn,
                {
                  backgroundColor: priority === p ? priorityColors[p] + '25' : colors.surfaceSecondary,
                  borderColor: priority === p ? priorityColors[p] : colors.border,
                },
              ]}
              onPress={() => setPriority(p)}
            >
              <Text style={[styles.priorityText, { color: priority === p ? priorityColors[p] : colors.text }]}>
                {p.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        <Input
          label="Estimated Duration (hours)"
          value={estimatedHours}
          onChangeText={setEstimatedHours}
          keyboardType="numeric"
          placeholder="e.g. 2"
        />

        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
        <Button title="Create Task" onPress={handleSave} loading={loading} fullWidth />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  label: { ...typography.caption, fontWeight: '500' },
  priorityRow: { flexDirection: 'row', gap: spacing.sm },
  priorityBtn: { flex: 1, padding: spacing.md, borderRadius: 8, borderWidth: 1.5, alignItems: 'center' },
  priorityText: { ...typography.caption, fontWeight: '700' },
  error: { ...typography.caption, textAlign: 'center' },
});
