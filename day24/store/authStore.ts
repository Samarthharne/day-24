import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { getProfile } from '@/services/auth';
import type { Profile } from '@/types';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  setProfile: (profile: Profile | null) => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    if (!isSupabaseConfigured) {
      set({ loading: false, initialized: true });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      let profile: Profile | null = null;

      if (session?.user) {
        try {
          profile = await getProfile(session.user.id);
        } catch {
          profile = null;
        }
      }

      set({
        session,
        user: session?.user ?? null,
        profile,
        loading: false,
        initialized: true,
      });

      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        let newProfile: Profile | null = null;
        if (newSession?.user) {
          try {
            newProfile = await getProfile(newSession.user.id);
          } catch {
            newProfile = null;
          }
        }
        set({
          session: newSession,
          user: newSession?.user ?? null,
          profile: newProfile,
        });
      });
    } catch {
      set({ loading: false, initialized: true });
    }
  },

  setProfile: (profile) => set({ profile }),

  refreshProfile: async () => {
    const user = get().user;
    if (!user) return;
    const profile = await getProfile(user.id);
    set({ profile });
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) {
        // Still clear local state even if remote sign-out fails
        console.warn('Sign out warning:', error.message);
      }
    } catch (error) {
      console.warn('Sign out error:', error);
    } finally {
      set({ session: null, user: null, profile: null, loading: false });
    }
  },
}));
