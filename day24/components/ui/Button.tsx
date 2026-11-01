import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radius, spacing, typography } from '@/lib/theme';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  fullWidth,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();

  const variants: Record<string, { bg: string; text: string; border?: string }> = {
    primary: { bg: colors.primary, text: '#FFFFFF' },
    secondary: { bg: colors.surfaceSecondary, text: colors.text },
    outline: { bg: 'transparent', text: colors.primary, border: colors.primary },
    ghost: { bg: 'transparent', text: colors.textSecondary },
    danger: { bg: colors.error, text: '#FFFFFF' },
  };

  const sizes: Record<string, { paddingV: number; paddingH: number; fontSize: number }> = {
    sm: { paddingV: spacing.sm, paddingH: spacing.md, fontSize: 14 },
    md: { paddingV: spacing.md, paddingH: spacing.lg, fontSize: 16 },
    lg: { paddingV: spacing.lg, paddingH: spacing.xl, fontSize: 17 },
  };

  const v = variants[variant];
  const s = sizes[size];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: v.bg,
          paddingVertical: s.paddingV,
          paddingHorizontal: s.paddingH,
          borderColor: v.border ?? 'transparent',
          borderWidth: v.border ? 1.5 : 0,
          opacity: pressed || disabled ? 0.7 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        style as ViewStyle,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.text, { color: v.text, fontSize: s.fontSize }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: {
    fontWeight: '600',
  },
});
