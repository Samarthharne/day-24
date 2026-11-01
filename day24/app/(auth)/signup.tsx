import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/hooks/useTheme';
import { signUp } from '@/services/auth';
import { spacing, typography } from '@/lib/theme';
import { getFriendlyError, validateEmail, validatePassword } from '@/utils/validation';

export default function SignUpScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!name.trim()) return setError('Name is required');
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    if (!emailValidation.valid) return setError(emailValidation.error!);
    if (!passwordValidation.valid) return setError(passwordValidation.error!);

    setLoading(true);
    setError('');
    try {
      await signUp(email, password, name);
      router.replace('/(onboarding)');
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Start tracking your 24 hours today
        </Text>

        <View style={styles.form}>
          <Input label="Name" value={name} onChangeText={setName} placeholder="Your name" />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="At least 6 characters"
          />
          {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
          <Button title="Create Account" onPress={handleSignUp} loading={loading} fullWidth />

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={[styles.link, { color: colors.primary }]}>Sign In</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: spacing.xxl, justifyContent: 'center' },
  title: { ...typography.h1, marginBottom: spacing.sm },
  subtitle: { ...typography.body, marginBottom: spacing.xxxl },
  form: { gap: spacing.lg },
  error: { ...typography.caption, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText: { ...typography.body },
  link: { ...typography.bodyBold },
});
