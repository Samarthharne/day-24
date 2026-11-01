import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

import 'react-native-reanimated';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { colors, isDark } = useTheme();
  const { initialize, initialized, session, profile } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!loaded || !initialized) return;

    SplashScreen.hideAsync().catch(() => {});

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';

    if (!isSupabaseConfigured) {
      if (!inAuthGroup && segments[0] !== '(tabs)') {
        router.replace('/(tabs)/today');
      }
      return;
    }

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && profile && !profile.onboarding_completed && !inOnboarding) {
      router.replace('/(onboarding)');
    } else if (session && profile?.onboarding_completed && (inAuthGroup || inOnboarding)) {
      router.replace('/(tabs)/today');
    }
  }, [loaded, initialized, session, profile, segments, router]);

  if (!loaded || !initialized) {
    return (
      <View style={[styles.container, styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="activity/add" options={{ presentation: 'modal', headerShown: true, title: 'Log Activity' }} />
        <Stack.Screen name="activity/edit/[id]" options={{ presentation: 'modal', headerShown: true, title: 'Edit Activity' }} />
        <Stack.Screen name="task/add" options={{ presentation: 'modal', headerShown: true, title: 'Add Task' }} />
        <Stack.Screen name="task/[id]" options={{ headerShown: true, title: 'Task Details' }} />
        <Stack.Screen name="goal/index" options={{ headerShown: true, title: 'Goals' }} />
        <Stack.Screen name="goal/add" options={{ presentation: 'modal', headerShown: true, title: 'Add Goal' }} />
        <Stack.Screen name="search" options={{ headerShown: true, title: 'Search' }} />
        <Stack.Screen name="settings/categories" options={{ headerShown: true, title: 'Categories' }} />
        <Stack.Screen name="settings/notifications" options={{ headerShown: true, title: 'Notifications' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
