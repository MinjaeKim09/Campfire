import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { supabase } from '@/src/lib/supabase';

type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  school: string | null;
  is_admin: boolean;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setSchool: (school: string | null) => Promise<{ error: string | null }>;
  setDisplayName: (name: string) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      return;
    }
    let active = true;
    supabase
      .from('profiles')
      .select('id, email, display_name, school, is_admin')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setProfile((data as Profile) ?? null);
      });
    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
      setSchool: async (school) => {
        if (!session?.user) return { error: 'Not signed in' };
        const { data, error } = await supabase
          .from('profiles')
          .update({ school })
          .eq('id', session.user.id)
          .select('id, email, display_name, school, is_admin')
          .maybeSingle();
        if (error) return { error: error.message };
        if (data) setProfile(data as Profile);
        return { error: null };
      },
      setDisplayName: async (name) => {
        if (!session?.user) return { error: 'Not signed in' };
        const trimmed = name.trim();
        if (!trimmed) return { error: 'Name cannot be empty' };
        const { data, error } = await supabase
          .from('profiles')
          .update({ display_name: trimmed })
          .eq('id', session.user.id)
          .select('id, email, display_name, school, is_admin')
          .maybeSingle();
        if (error) return { error: error.message };
        if (data) setProfile(data as Profile);
        return { error: null };
      },
    }),
    [session, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
