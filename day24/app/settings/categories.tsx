import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/lib/theme';
import { useAuthStore } from '@/store/authStore';
import { useCategoryStore } from '@/store/categoryStore';

const EMOJI_OPTIONS = ['💼', '📚', '😴', '🏋️', '❤️', '🏠', '👨‍👩‍👧', '🤝', '🎬', '📱', '✈️', '🍽️', '🧘', '📖', '🎮', '📌'];
const COLOR_OPTIONS = ['#6366F1', '#8B5CF6', '#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#EC4899', '#14B8A6', '#F97316', '#A855F7', '#0EA5E9', '#84CC16', '#7C3AED', '#DC2626', '#6B7280'];

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { categories, fetch, create, update, remove } = useCategoryStore();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📌');
  const [color, setColor] = useState('#6366F1');
  const [isProductive, setIsProductive] = useState(false);

  useEffect(() => {
    if (user) fetch(user.id);
  }, [user, fetch]);

  const handleAdd = async () => {
    if (!user || !name.trim()) return;
    await create(user.id, { name, icon, color, is_productive: isProductive });
    setShowAdd(false);
    setName('');
  };

  const handleDelete = (id: string, categoryName: string) => {
    Alert.alert('Delete Category', `Delete "${categoryName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(id) },
    ]);
  };

  const toggleProductive = async (id: string, current: boolean) => {
    await update(id, { is_productive: !current });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scroll}>
      {categories.map((cat) => (
        <View key={cat.id} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
          <Text style={styles.icon}>{cat.icon}</Text>
          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.text }]}>{cat.name}</Text>
            <Pressable onPress={() => toggleProductive(cat.id, cat.is_productive)}>
              <Text style={[styles.productive, { color: cat.is_productive ? colors.success : colors.textMuted }]}>
                {cat.is_productive ? '✓ Productive' : 'Not productive'}
              </Text>
            </Pressable>
          </View>
          <Pressable onPress={() => handleDelete(cat.id, cat.name)}>
            <Text style={{ color: colors.error }}>Delete</Text>
          </Pressable>
        </View>
      ))}

      {showAdd ? (
        <View style={[styles.addForm, { backgroundColor: colors.surfaceSecondary }]}>
          <Input label="Name" value={name} onChangeText={setName} placeholder="Category name" />
          <Text style={[styles.label, { color: colors.textSecondary }]}>Icon</Text>
          <View style={styles.emojiRow}>
            {EMOJI_OPTIONS.map((e) => (
              <Pressable key={e} style={[styles.emojiBtn, icon === e && { backgroundColor: colors.primaryLight }]} onPress={() => setIcon(e)}>
                <Text style={{ fontSize: 20 }}>{e}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Color</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map((c) => (
              <Pressable key={c} style={[styles.colorBtn, { backgroundColor: c }, color === c && styles.colorSelected]} onPress={() => setColor(c)} />
            ))}
          </View>
          <Button title="Add Category" onPress={handleAdd} fullWidth />
        </View>
      ) : (
        <Button title="+ Add Category" variant="outline" onPress={() => setShowAdd(true)} fullWidth />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.md,
  },
  colorDot: { width: 4, height: 32, borderRadius: 2 },
  icon: { fontSize: 24 },
  info: { flex: 1 },
  name: { ...typography.bodyBold },
  productive: { ...typography.small, marginTop: 2 },
  addForm: { padding: spacing.lg, borderRadius: 12, gap: spacing.md },
  label: { ...typography.caption, fontWeight: '500' },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  emojiBtn: { padding: spacing.sm, borderRadius: 8 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  colorBtn: { width: 32, height: 32, borderRadius: 16 },
  colorSelected: { borderWidth: 3, borderColor: '#FFF' },
});
