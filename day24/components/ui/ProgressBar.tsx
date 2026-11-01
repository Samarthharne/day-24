import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/lib/theme';

interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  height?: number;
}

export function ProgressBar({
  progress,
  label,
  showPercentage,
  color,
  height = 8,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const barColor = color ?? colors.primary;

  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.header}>
          {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
          {showPercentage && (
            <Text style={[styles.percentage, { color: colors.text }]}>
              {Math.round(clampedProgress)}%
            </Text>
          )}
        </View>
      )}
      <View style={[styles.track, { backgroundColor: colors.surfaceSecondary, height }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              width: `${clampedProgress}%`,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...typography.caption,
  },
  percentage: {
    ...typography.caption,
    fontWeight: '600',
  },
  track: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 999,
  },
});
