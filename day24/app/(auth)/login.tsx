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
import { signIn, signInWithGoogle } from '@/services/auth';
import { spacing, typography } from '@/lib/theme';
import { getFriendlyError, validateEmail, validatePassword } from '@/utils/validation';

export default function LoginScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    if (!emailValidation.valid) return setError(emailValidation.error!);
    if (!passwordValidation.valid) return setError(passwordValidation.error!);

    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      router.replace('/(tabs)/today');
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      router.replace('/(tabs)/today');
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
        <View style={styles.header}>
          <Text style={styles.logo}>⏰</Text>
          <Text style={[styles.title, { color: colors.text }]}>Day24</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track every hour. Master your day.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Your password"
          />
          {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

          <Link href="/(auth)/forgot-password" asChild>
            <Pressable>
              <Text style={[styles.forgot, { color: colors.primary }]}>Forgot password?</Text>
            </Pressable>
          </Link>

          <Button title="Sign In" onPress={handleLogin} loading={loading} fullWidth />
          <Button title="Continue with Google" variant="outline" onPress={handleGoogle} fullWidth />

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <Link href="/(auth)/signup" asChild>
              <Pressable>
                <Text style={[styles.link, { color: colors.primary }]}>Sign Up</Text>
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
  header: { alignItems: 'center', marginBottom: spacing.xxxl },
  logo: { fontSize: 56, marginBottom: spacing.md },
  title: { ...typography.h1, marginBottom: spacing.sm },
  subtitle: { ...typography.body, textAlign: 'center' },
  form: { gap: spacing.lg },
  error: { ...typography.caption, textAlign: 'center' },
  forgot: { ...typography.caption, textAlign: 'right', fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText: { ...typography.body },
  link: { ...typography.bodyBold },
});
