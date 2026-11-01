import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { makeRedirectUri } from 'expo-auth-session';

import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

WebBrowser.maybeCompleteAuthSession();

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;

  // If email confirmation is on, session may be null — sign in immediately for normal login
  if (!data.session) {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) throw signInError;
    return signInData;
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function signInWithGoogle() {
  const redirectTo = makeRedirectUri({ scheme: 'day24' });
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;

  if (data.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === 'success' && result.url) {
      const url = new URL(result.url);
      const params = new URLSearchParams(url.hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }
    }
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function completeOnboarding(
  userId: string,
  name: string,
  goals: string[],
  selectedCategories: string[],
) {
  await updateProfile(userId, {
    name,
    onboarding_goals: goals,
    onboarding_completed: true,
  });

  if (selectedCategories.length > 0) {
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', userId);

    const toDelete = (categories ?? [])
      .filter((c) => !selectedCategories.includes(c.name))
      .map((c) => c.id);

    if (toDelete.length > 0) {
      await supabase.from('categories').delete().in('id', toDelete);
    }
  }
}
