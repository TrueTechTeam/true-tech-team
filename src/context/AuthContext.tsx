'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Session } from '@supabase/supabase-js';
import { createClient } from '../lib/supabase/client';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  appAccess: string[];
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  appAccess: [],
  signOut: async () => {},
});

async function checkIsAdmin(userId: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  return data !== null;
}

async function checkAppAccess(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase.from('app_permissions').select('app_slug').eq('user_id', userId);
  return (data ?? []).map((row) => row.app_slug as string);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [appAccess, setAppAccess] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        checkIsAdmin(session.user.id).then(setIsAdmin);
        checkAppAccess(session.user.id).then(setAppAccess);
      } else {
        setIsAdmin(false);
        setAppAccess([]);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        checkIsAdmin(session.user.id).then(setIsAdmin);
        checkAppAccess(session.user.id).then(setAppAccess);
      } else {
        setIsAdmin(false);
        setAppAccess([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, appAccess, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
