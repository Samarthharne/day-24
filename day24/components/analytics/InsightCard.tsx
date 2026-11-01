import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/lib/theme';
import type { Insight } from '@/types';

interface InsightCardProps {
  insight: Insight;
}

export function InsightCard({ insight }: InsightCardProps) {
  const { colors } = useTheme();

  const typeColors = {
    positive: colors.success,
    neutral: colors.primary,
    warning: colors.warning,
  };

  return (
    <Card style={StyleSheet.flatten([styles.card, { borderLeftColor: typeColors[insight.type], borderLeftWidth: 3 }])}>
      <View style={styles.header}>
        <Text style={styles.icon}>{insight.icon}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{insight.title}</Text>
      </View>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {insight.description}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    ...typography.bodyBold,
  },
  description: {
    ...typography.body,
    lineHeight: 22,
  },
});
