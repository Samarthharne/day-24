import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/lib/theme';
import type { CategoryBreakdown } from '@/types';
import { formatDuration } from '@/utils/time';

interface CategoryBreakdownListProps {
  breakdown: CategoryBreakdown[];
  showUnlogged?: number;
}

export function CategoryBreakdownList({ breakdown, showUnlogged }: CategoryBreakdownListProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {breakdown.map((item) => (
        <View key={item.categoryId} style={styles.row}>
          <View style={styles.left}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={[styles.name, { color: colors.text }]}>{item.categoryName}</Text>
          </View>
          <View style={styles.right}>
            <View style={[styles.bar, { backgroundColor: colors.surfaceSecondary }]}>
              <View
                style={[
                  styles.barFill,
                  { backgroundColor: item.color, width: `${item.percentage}%` },
                ]}
              />
            </View>
            <Text style={[styles.duration, { color: colors.textSecondary }]}>
              {formatDuration(item.minutes)}
            </Text>
          </View>
        </View>
      ))}
      {showUnlogged !== undefined && showUnlogged > 0 && (
        <View style={styles.row}>
          <View style={styles.left}>
            <Text style={styles.icon}>⏳</Text>
            <Text style={[styles.name, { color: colors.textMuted }]}>Unlogged</Text>
          </View>
          <Text style={[styles.duration, { color: colors.textMuted }]}>
            {formatDuration(showUnlogged)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  icon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  name: {
    ...typography.body,
    fontWeight: '500',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    justifyContent: 'flex-end',
  },
  bar: {
    height: 6,
    width: 60,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  duration: {
    ...typography.caption,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'right',
  },
});
