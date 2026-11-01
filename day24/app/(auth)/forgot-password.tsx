import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/hooks/useTheme';
import { resetPassword } from '@/services/auth';
import { spacing, typography } from '@/lib/theme';
import { getFriendlyError, validateEmail } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async () => {
    const validation = validateEmail(email);
    if (!validation.valid) return setError(validation.error!);

    setLoading(true);
    setError('');
    try {
      await resetPassword(email);
      setMessage('Check your email for a password reset link.');
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 20 }]}>
      <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Enter your email and we'll send you a reset link.
      </Text>

      <View style={styles.form}>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="you@example.com"
        />
        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
        {message ? <Text style={[styles.success, { color: colors.success }]}>{message}</Text> : null}
        <Button title="Send Reset Link" onPress={handleReset} loading={loading} fullWidth />
        <Button title="Back to Login" variant="ghost" onPress={() => router.back()} fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xxl },
  title: { ...typography.h1, marginBottom: spacing.sm },
  subtitle: { ...typography.body, marginBottom: spacing.xxxl },
  form: { gap: spacing.lg },
  error: { ...typography.caption, textAlign: 'center' },
  success: { ...typography.caption, textAlign: 'center' },
});
