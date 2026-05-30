import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import * as Sentry from '@sentry/react';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST.
    // Handling events explicitly keeps frontend state in sync with the
    // server — critical when signOut({ scope: 'global' }) is used.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          // Immediately clear all auth state so no stale data lingers
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          Sentry.setUser(null);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (session?.user) {
            // Sync Sentry user context (no PII — only ID)
            Sentry.setUser({ id: session.user.id });
            // Use setTimeout(0) to avoid Supabase deadlock on state change
            setTimeout(() => {
              fetchProfile(session.user.id);
              checkAdminRole(session.user.id);
            }, 0);
          }
        }
      }
    );

    // THEN check for existing session to hydrate state on page load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        Sentry.setUser({ id: session.user.id });
        fetchProfile(session.user.id);
        checkAdminRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!error && data) {
      setProfile(data);
    }
  };

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    const admin = !error && !!data;
    setIsAdmin(admin);

    // Tag Sentry with role info (not PII)
    Sentry.setTag('user.role', admin ? 'admin' : 'user');
  };

  const signUp = async (email: string, password: string, name: string) => {
    // Check rate limit on signup
    try {
      const { data: limitData, error: limitError } = await supabase.functions.invoke('rate-limiter', {
        body: { action: 'signup' }
      });

      const isRateLimited = (limitError && (limitError as any).status === 429) || (limitData && !limitData.allowed);
      if (isRateLimited) {
        const retryAfter = limitData?.retryAfter || 3600;
        return { 
          error: new Error(`Too many registration attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`) 
        };
      }
    } catch (e) {
      console.error("Rate check failed, proceeding to prevent lock-out:", e);
    }

    // Use the current origin so verification links work on any deployment
    // (local dev, staging, production) without hardcoding a URL.
    const redirectUrl = `${window.location.origin}/auth?mode=login`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name }
      }
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Check rate limit on login
    try {
      const { data: limitData, error: limitError } = await supabase.functions.invoke('rate-limiter', {
        body: { action: 'login' }
      });

      const isRateLimited = (limitError && (limitError as any).status === 429) || (limitData && !limitData.allowed);
      if (isRateLimited) {
        const retryAfter = limitData?.retryAfter || 900;
        return { 
          error: new Error(`Too many login attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`) 
        };
      }
    } catch (e) {
      console.error("Rate check failed, proceeding to prevent lock-out:", e);
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const signOut = async () => {
    // 'global' scope invalidates ALL sessions across all devices/tabs,
    // preventing stale refresh tokens from being used after logout.
    await supabase.auth.signOut({ scope: 'global' });
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isAdmin,
      loading,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
