import { StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/lib/theme';
import type { CategoryBreakdown } from '@/types';

interface DonutChartProps {
  data: CategoryBreakdown[];
  size?: number;
}

export function DonutChart({ data, size = 180 }: DonutChartProps) {
  const { colors } = useTheme();

  if (data.length === 0) {
    return (
      <View style={[styles.empty, { width: size, height: size }]}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No data</Text>
      </View>
    );
  }

  const chartData = data.map((item) => ({
    value: item.minutes,
    color: item.color,
    text: `${item.percentage}%`,
  }));

  return (
    <View style={styles.container}>
      <PieChart
        data={chartData}
        donut
        radius={size / 2}
        innerRadius={size / 2 - 30}
        innerCircleColor={colors.surface}
        centerLabelComponent={() => (
          <View style={styles.center}>
            <Text style={[styles.centerText, { color: colors.textMuted }]}>Total</Text>
            <Text style={[styles.centerValue, { color: colors.text }]}>
              {Math.round(data.reduce((s, d) => s + d.minutes, 0) / 60)}h
            </Text>
          </View>
        )}
      />
      <View style={styles.legend}>
        {data.slice(0, 5).map((item) => (
          <View key={item.categoryId} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              {item.icon} {item.categoryName} ({item.percentage}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.caption,
  },
  center: {
    alignItems: 'center',
  },
  centerText: {
    ...typography.small,
  },
  centerValue: {
    ...typography.h3,
  },
  legend: {
    width: '100%',
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...typography.caption,
  },
});
