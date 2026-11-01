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
import { fetchSuggestions } from '@/services/activities';
import { spacing, typography } from '@/lib/theme';
import { useActivityStore } from '@/store/activityStore';
import { useAuthStore } from '@/store/authStore';
import { useCategoryStore } from '@/store/categoryStore';
import { findOverlaps } from '@/utils/time';
import { getFriendlyError, validateActivity } from '@/utils/validation';
import type { ActivitySuggestion } from '@/types';

export default function AddActivityScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ start?: string; end?: string }>();
  const { user } = useAuthStore();
  const { categories, fetch: fetchCategories } = useCategoryStore();
  const { create, activities } = useActivityStore();

  const defaultStart = params.start ? new Date(params.start) : new Date();
  const defaultEnd = params.end ? new Date(params.end) : new Date(defaultStart.getTime() + 60 * 60 * 1000);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [productivity, setProductivity] = useState<number | undefined>();
  const [isPlanned, setIsPlanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);

  useEffect(() => {
    if (user) {
      fetchCategories(user.id);
      fetchSuggestions(user.id).then(setSuggestions);
    }
  }, [user, fetchCategories]);

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const adjustTime = (type: 'start' | 'end', delta: number) => {
    if (type === 'start') {
      const newStart = new Date(startTime.getTime() + delta * 60000);
      setStartTime(newStart);
    } else {
      const newEnd = new Date(endTime.getTime() + delta * 60000);
      setEndTime(newEnd);
    }
  };

  const handleSave = async () => {
    if (!user || !categoryId) return;

    const validation = validateActivity({
      title,
      category_id: categoryId,
      start_time: startTime,
      end_time: endTime,
      productivity_rating: productivity,
      is_planned: isPlanned,
      description,
    });

    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    const overlaps = findOverlaps(startTime, endTime, activities);
    if (overlaps.length > 0) {
      Alert.alert(
        'Overlapping Activity',
        `This overlaps with "${overlaps[0].title}". Do you want to save anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save Anyway', onPress: () => saveActivity() },
        ],
      );
      return;
    }

    await saveActivity();
  };

  const saveActivity = async () => {
    if (!user || !categoryId) return;
    setLoading(true);
    setError('');
    try {
      await create(user.id, {
        title,
        description,
        category_id: categoryId,
        start_time: startTime,
        end_time: endTime,
        productivity_rating: productivity,
        is_planned: isPlanned,
      });
      router.back();
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = (suggestion: ActivitySuggestion) => {
    setTitle(suggestion.title);
    if (suggestion.category_id) setCategoryId(suggestion.category_id);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.heading, { color: colors.text }]}>What did you do?</Text>

        {suggestions.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestions}>
            {suggestions.map((s) => (
              <Pressable
                key={s.id}
                style={[styles.suggestion, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => applySuggestion(s)}
              >
                <Text style={[styles.suggestionText, { color: colors.text }]}>
                  Continue {s.title}?
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <Input label="Activity" value={title} onChangeText={setTitle} placeholder="e.g. Coding" />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
        <CategoryPicker
          categories={categories}
          selectedId={categoryId}
          onSelect={setCategoryId}
        />

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

        <Input
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Add notes..."
          multiline
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Productivity (1-5)</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((r) => (
            <Pressable
              key={r}
              style={[
                styles.ratingBtn,
                {
                  backgroundColor: productivity === r ? colors.primary : colors.surfaceSecondary,
                },
              ]}
              onPress={() => setProductivity(r)}
            >
              <Text style={{ color: productivity === r ? '#FFF' : colors.text }}>{r}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.plannedRow}
          onPress={() => setIsPlanned(!isPlanned)}
        >
          <View style={[styles.checkbox, { borderColor: colors.primary, backgroundColor: isPlanned ? colors.primary : 'transparent' }]}>
            {isPlanned && <Text style={styles.check}>✓</Text>}
          </View>
          <Text style={[styles.plannedText, { color: colors.text }]}>Planned activity</Text>
        </Pressable>

        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        <Button title="Save Activity" onPress={handleSave} loading={loading} fullWidth />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  heading: { ...typography.h2 },
  suggestions: { marginBottom: spacing.sm },
  suggestion: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 8, marginRight: spacing.sm },
  suggestionText: { ...typography.caption, fontWeight: '600' },
  label: { ...typography.caption, fontWeight: '500', marginBottom: spacing.xs },
  timeRow: { flexDirection: 'row', gap: spacing.md },
  timeBlock: { flex: 1 },
  timeDisplay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderRadius: 12 },
  timeBtn: { fontSize: 24, fontWeight: '600', paddingHorizontal: spacing.sm },
  timeText: { ...typography.bodyBold },
  ratingRow: { flexDirection: 'row', gap: spacing.sm },
  ratingBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  plannedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  check: { color: '#FFF', fontWeight: '700' },
  plannedText: { ...typography.body },
  error: { ...typography.caption, textAlign: 'center' },
});
