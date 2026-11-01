import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !supabaseUrl.includes('your-project') &&
  supabaseUrl.startsWith('http');

const storage = Platform.OS === 'web'
  ? {
      getItem: (key: string) => {
        if (typeof localStorage === 'undefined') return null;
        return localStorage.getItem(key);
      },
      setItem: (key: string, value: string) => {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      },
      removeItem: (key: string) => {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      },
    }
  : AsyncStorage;

// Use a safe placeholder during SSR / missing env so createClient never throws
const url = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const key = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key';

export const supabase: SupabaseClient = createClient(url, key, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
