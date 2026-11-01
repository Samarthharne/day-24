import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import { radius, spacing, typography } from '@/lib/theme';

interface FloatingLogButtonProps {
  onPress: () => void;
}

export function FloatingLogButton({ onPress }: FloatingLogButtonProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: colors.primary,
          bottom: insets.bottom + 80,
          opacity: pressed ? 0.9 : 1,
          shadowColor: colors.primary,
        },
      ]}
      onPress={onPress}
    >
      <Text style={styles.icon}>+</Text>
      <Text style={styles.label}>Log Time</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 100,
  },
  icon: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  label: {
    color: '#FFFFFF',
    ...typography.bodyBold,
  },
});
