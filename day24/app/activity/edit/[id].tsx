import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
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
import { useActivityStore } from '@/store/activityStore';
import { useAuthStore } from '@/store/authStore';
import { useCategoryStore } from '@/store/categoryStore';
import { findOverlaps, formatDuration } from '@/utils/time';
import { getFriendlyError, validateActivity } from '@/utils/validation';

export default function EditActivityScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { categories, fetch: fetchCategories } = useCategoryStore();
  const { activities, update, remove, duplicate } = useActivityStore();

  const activity = activities.find((a) => a.id === id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [productivity, setProductivity] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) fetchCategories(user.id);
  }, [user, fetchCategories]);

  useEffect(() => {
    if (activity) {
      setTitle(activity.title);
      setDescription(activity.description ?? '');
      setCategoryId(activity.category_id);
      setStartTime(new Date(activity.start_time));
      setEndTime(new Date(activity.end_time));
      setProductivity(activity.productivity_rating ?? undefined);
    }
  }, [activity]);

  if (!activity) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.textSecondary }]}>Activity not found</Text>
      </View>
    );
  }

  const handleSave = async () => {
    if (!categoryId) return;

    const validation = validateActivity({
      title,
      category_id: categoryId,
      start_time: startTime,
      end_time: endTime,
      productivity_rating: productivity,
      description,
    });

    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    const overlaps = findOverlaps(startTime, endTime, activities, id);
    if (overlaps.length > 0) {
      Alert.alert('Overlapping Activity', `Overlaps with "${overlaps[0].title}". Save anyway?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save', onPress: () => saveChanges() },
      ]);
      return;
    }

    await saveChanges();
  };

  const saveChanges = async () => {
    if (!categoryId) return;
    setLoading(true);
    try {
      await update(id, {
        title,
        description,
        category_id: categoryId,
        start_time: startTime,
        end_time: endTime,
        productivity_rating: productivity,
      });
      router.back();
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Activity', 'This cannot be undone.', [
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

  const handleDuplicate = async () => {
    if (!user) return;
    await duplicate(activity, user.id);
    router.back();
  };

  const adjustTime = (type: 'start' | 'end', delta: number) => {
    if (type === 'start') setStartTime(new Date(startTime.getTime() + delta * 60000));
    else setEndTime(new Date(endTime.getTime() + delta * 60000));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.duration, { color: colors.textSecondary }]}>
          Duration: {formatDuration(Math.round((endTime.getTime() - startTime.getTime()) / 60000))}
        </Text>

        <Input label="Activity" value={title} onChangeText={setTitle} />
        <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
        <CategoryPicker categories={categories} selectedId={categoryId} onSelect={setCategoryId} />

        <View style={styles.timeRow}>
          <View style={styles.timeBlock}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>From</Text>
            <View style={[styles.timeDisplay, { backgroundColor: colors.surfaceSecondary }]}>
              <Pressable onPress={() => adjustTime('start', -15)}>
                <Text style={[styles.timeBtn, { color: colors.primary }]}>−</Text>
              </Pressable>
              <Text style={[styles.timeText, { color: colors.text }]}>
                {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Pressable onPress={() => adjustTime('start', 15)}>
                <Text style={[styles.timeBtn, { color: colors.primary }]}>+</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.timeBlock}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>To</Text>
            <View style={[styles.timeDisplay, { backgroundColor: colors.surfaceSecondary }]}>
              <Pressable onPress={() => adjustTime('end', -15)}>
                <Text style={[styles.timeBtn, { color: colors.primary }]}>−</Text>
              </Pressable>
              <Text style={[styles.timeText, { color: colors.text }]}>
                {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Pressable onPress={() => adjustTime('end', 15)}>
                <Text style={[styles.timeBtn, { color: colors.primary }]}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Input label="Description" value={description} onChangeText={setDescription} multiline />

        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        <Button title="Save Changes" onPress={handleSave} loading={loading} fullWidth />
        <Button title="Duplicate" variant="secondary" onPress={handleDuplicate} fullWidth />
        <Button title="Delete" variant="danger" onPress={handleDelete} fullWidth />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  notFound: { ...typography.body, textAlign: 'center', marginTop: 40 },
  duration: { ...typography.bodyBold, textAlign: 'center' },
  label: { ...typography.caption, fontWeight: '500' },
  timeRow: { flexDirection: 'row', gap: spacing.md },
  timeBlock: { flex: 1 },
  timeDisplay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderRadius: 12 },
  timeBtn: { fontSize: 24, fontWeight: '600', paddingHorizontal: spacing.sm },
  timeText: { ...typography.bodyBold },
  error: { ...typography.caption, textAlign: 'center' },
});
