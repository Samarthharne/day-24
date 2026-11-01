import { StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/lib/theme';

interface WeeklyBarChartProps {
  labels: string[];
  data: { label: string; value: number; color: string }[];
}

export function WeeklyBarChart({ labels, data }: WeeklyBarChartProps) {
  const { colors } = useTheme();

  if (data.every((d) => d.value === 0)) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No data for this period</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarChart
        data={data}
        barWidth={28}
        spacing={16}
        roundedTop
        hideRules
        xAxisThickness={0}
        yAxisThickness={0}
        yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
        noOfSections={4}
        maxValue={Math.max(...data.map((d) => d.value), 4)}
        isAnimated
      />
      <View style={styles.labels}>
        {labels.map((label) => (
          <Text key={label} style={[styles.label, { color: colors.textMuted }]}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  empty: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.caption,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.sm,
  },
  label: {
    ...typography.small,
  },
});
