import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/lib/theme';
import { useTimerStore } from '@/store/timerStore';

export function TimerWidget() {
  const { colors } = useTheme();
  const { isRunning, isPaused, title, startedAt, pause, resume, stop } = useTimerStore();
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    if (!isRunning || isPaused) return;
    const interval = setInterval(() => {
      const ms = useTimerStore.getState().getElapsedMs();
      const hours = Math.floor(ms / 3600000);
      const minutes = Math.floor((ms % 3600000) / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      setElapsed(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  if (!isRunning) return null;

  return (
    <Card style={StyleSheet.flatten([styles.card, { borderColor: colors.error + '40' }])}>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: colors.error }]} />
        <Text style={[styles.label, { color: colors.error }]}>Currently Tracking</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {startedAt && (
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          Started: {startedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      )}
      <Text style={[styles.duration, { color: colors.text }]}>{elapsed}</Text>
      <View style={styles.actions}>
        <Button
          title={isPaused ? 'Resume' : 'Pause'}
          variant="secondary"
          size="sm"
          onPress={isPaused ? resume : pause}
          style={styles.actionBtn}
        />
        <Button title="Stop" variant="danger" size="sm" onPress={stop} style={styles.actionBtn} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  meta: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  duration: {
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
});
