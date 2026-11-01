import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/hooks/useTheme';
import { completeOnboarding } from '@/services/auth';
import { updateNotificationSettings } from '@/services/notifications';
import { spacing, typography } from '@/lib/theme';
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore } from '@/store/onboardingStore';

const GOAL_OPTIONS = [
  'Productivity',
  'Study',
  'Fitness',
  'Better Time Management',
  'Reduce Social Media',
  'Build Habits',
];

const CATEGORY_OPTIONS = [
  'Work', 'Study', 'Sleep', 'Exercise', 'Health', 'Personal',
  'Family', 'Friends', 'Entertainment', 'Social Media', 'Travel',
  'Food', 'Meditation', 'Reading', 'Gaming', 'Other',
];

const STEPS = ['name', 'goals', 'categories', 'reminders'] as const;

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, refreshProfile } = useAuthStore();
  const {
    step, name, goals, selectedCategories, wantsReminders,
    setStep, setName, toggleGoal, toggleCategory, setWantsReminders,
  } = useOnboardingStore();
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    if (!user) return;
    setLoading(true);
    try {
      const cats = selectedCategories.length > 0 ? selectedCategories : CATEGORY_OPTIONS;
      await completeOnboarding(user.id, name, goals, cats);
      await updateNotificationSettings(user.id, {
        morning_reminder: wantsReminders,
        afternoon_reminder: wantsReminders,
        evening_reminder: wantsReminders,
      });
      await refreshProfile();
      router.replace('/(tabs)/today');
    } catch {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 2) return selectedCategories.length > 0;
    return true;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.progress}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i <= step ? colors.primary : colors.border },
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <>
            <Text style={[styles.title, { color: colors.text }]}>What should we call you?</Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              autoFocus
            />
          </>
        )}

        {step === 1 && (
          <>
            <Text style={[styles.title, { color: colors.text }]}>What are your main goals?</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Select all that apply
            </Text>
            <View style={styles.options}>
              {GOAL_OPTIONS.map((goal) => (
                <Pressable
                  key={goal}
                  style={[
                    styles.option,
                    {
                      backgroundColor: goals.includes(goal) ? colors.primaryLight : colors.surfaceSecondary,
                      borderColor: goals.includes(goal) ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => toggleGoal(goal)}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>{goal}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={[styles.title, { color: colors.text }]}>Which categories do you want to track?</Text>
            <View style={styles.options}>
              {CATEGORY_OPTIONS.map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.option,
                    {
                      backgroundColor: selectedCategories.includes(cat) ? colors.primaryLight : colors.surfaceSecondary,
                      borderColor: selectedCategories.includes(cat) ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => toggleCategory(cat)}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>{cat}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={[styles.title, { color: colors.text }]}>Daily reminders?</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              We'll remind you to plan your day and log your time.
            </Text>
            <View style={[styles.reminderRow, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.reminderText, { color: colors.text }]}>Enable daily reminders</Text>
              <Switch
                value={wantsReminders}
                onValueChange={setWantsReminders}
                trackColor={{ true: colors.primary }}
              />
            </View>
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        {step > 0 && (
          <Button title="Back" variant="ghost" onPress={() => setStep(step - 1)} />
        )}
        <Button
          title={step === STEPS.length - 1 ? 'Get Started' : 'Continue'}
          onPress={handleNext}
          loading={loading}
          disabled={!canProceed()}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  dot: { width: 32, height: 4, borderRadius: 2 },
  content: { padding: spacing.xxl, flexGrow: 1 },
  title: { ...typography.h1, marginBottom: spacing.md },
  subtitle: { ...typography.body, marginBottom: spacing.xl },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  optionText: { ...typography.body, fontWeight: '500' },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: 12,
    marginTop: spacing.lg,
  },
  reminderText: { ...typography.bodyBold },
  footer: { padding: spacing.xxl, gap: spacing.sm },
});
