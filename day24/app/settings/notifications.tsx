import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { fetchNotificationSettings, updateNotificationSettings } from '@/services/notifications';
import { spacing, typography } from '@/lib/theme';
import { useAuthStore } from '@/store/authStore';
import type { NotificationSettings } from '@/types';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotificationSettings(user.id).then(setSettings);
    }
  }, [user]);

  const update = async (key: keyof NotificationSettings, value: boolean) => {
    if (!user || !settings) return;
    const updated = await updateNotificationSettings(user.id, { [key]: value });
    setSettings(updated);
  };

  if (!settings) return null;

  const items = [
    { key: 'morning_reminder' as const, label: 'Morning Reminder', desc: 'Good morning! Plan your day.' },
    { key: 'afternoon_reminder' as const, label: 'Afternoon Check-in', desc: 'You have only logged a few hours today.' },
    { key: 'evening_reminder' as const, label: 'Evening Reminder', desc: "Don't forget to complete today's time log." },
    { key: 'task_reminders' as const, label: 'Task Reminders', desc: 'Get notified about due tasks.' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scroll}>
      {items.map((item) => (
        <View key={item.key} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.info}>
            <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
            <Text style={[styles.desc, { color: colors.textSecondary }]}>{item.desc}</Text>
          </View>
          <Switch
            value={settings[item.key] as boolean}
            onValueChange={(v) => update(item.key, v)}
            trackColor={{ true: colors.primary }}
          />
        </View>
      ))}
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
  },
  info: { flex: 1, marginRight: spacing.md },
  label: { ...typography.bodyBold },
  desc: { ...typography.caption, marginTop: 2 },
});
