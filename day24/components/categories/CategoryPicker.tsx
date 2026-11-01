import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radius, spacing, typography } from '@/lib/theme';
import type { Category } from '@/types';

interface CategoryPickerProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CategoryPicker({ categories, selectedId, onSelect }: CategoryPickerProps) {
  const { colors } = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {categories.map((category) => {
        const selected = category.id === selectedId;
        return (
          <Pressable
            key={category.id}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? category.color + '25' : colors.surfaceSecondary,
                borderColor: selected ? category.color : colors.border,
              },
            ]}
            onPress={() => onSelect(category.id)}
          >
            <Text style={styles.icon}>{category.icon}</Text>
            <Text
              style={[
                styles.name,
                { color: selected ? category.color : colors.text },
              ]}
            >
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  icon: {
    fontSize: 16,
  },
  name: {
    ...typography.caption,
    fontWeight: '600',
  },
});
