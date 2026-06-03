import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import * as Sentry from '@sentry/react';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_PREFERENCES = {
  theme: 'system',
  language: 'en',
  auto_play_videos: true,
  show_reminders: true,
  public_profile: false,
  high_contrast: false,
  reduce_motion: false,
  large_text: false,
};

const DEFAULT_NOTIFICATIONS = {
  email: {
    module_complete: true,
    badge_earned: true,
    certificate_ready: true,
    community_replies: false,
    friend_requests: false,
    weekly_report: false,
    product_updates: false,
    marketing: false,
  },
  push: {
    learning_reminders: true,
    streak_alerts: true,
    community_posts: false,
    friend_activity: false,
  },
  frequency: 'daily',
};

interface Profile {
  id: string;
  name: string;
  email: string;
  display_name: string;
  bio: string;
  phone: string;
  location: string;
  avatar_url: string;
  created_at: string;
  level: string;
  total_points: number;
  preferences: typeof DEFAULT_PREFERENCES;
  notification_settings: typeof DEFAULT_NOTIFICATIONS;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  profileLoading: boolean;
  fetchProfile: (userId?: string, currentUser?: User | null) => Promise<void>;
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
  const [profileLoading, setProfileLoading] = useState(true);

  const fetchProfile = async (userId?: string, currentUser?: User | null) => {
    const targetUserId = userId || user?.id || session?.user?.id;
    if (!targetUserId) {
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      const activeUser = currentUser || user;

      if (error) {
        console.error('Error fetching profile in AuthContext:', error);
        setProfile({
          id: targetUserId,
          name: activeUser?.user_metadata?.name || activeUser?.email?.split('@')[0] || 'User',
          email: activeUser?.email || '',
          display_name: activeUser?.user_metadata?.name || activeUser?.email?.split('@')[0] || 'User',
          bio: '',
          phone: '',
          location: '',
          avatar_url: '',
          created_at: new Date().toISOString(),
          level: 'Cyber Novice',
          total_points: 0,
          preferences: DEFAULT_PREFERENCES,
          notification_settings: DEFAULT_NOTIFICATIONS,
        });
      } else if (!data) {
        console.warn('Profile row missing in Supabase for user:', targetUserId);
        setProfile({
          id: targetUserId,
          name: activeUser?.user_metadata?.name || activeUser?.email?.split('@')[0] || 'User',
          email: activeUser?.email || '',
          display_name: activeUser?.user_metadata?.name || activeUser?.email?.split('@')[0] || 'User',
          bio: '',
          phone: '',
          location: '',
          avatar_url: '',
          created_at: new Date().toISOString(),
          level: 'Cyber Novice',
          total_points: 0,
          preferences: DEFAULT_PREFERENCES,
          notification_settings: DEFAULT_NOTIFICATIONS,
        });
      } else {
        const raw = data as any;
        setProfile({
          id: raw.id,
          name: raw.name || '',
          email: raw.email || '',
          display_name: raw.display_name || '',
          bio: raw.bio || '',
          phone: raw.phone || '',
          location: raw.location || '',
          avatar_url: raw.avatar_url || '',
          created_at: raw.created_at || '',
          level: raw.level || 'Cyber Novice',
          total_points: raw.total_points || 0,
          preferences: { ...DEFAULT_PREFERENCES, ...(raw.preferences || {}) },
          notification_settings: { ...DEFAULT_NOTIFICATIONS, ...(raw.notification_settings || {}) },
        });
      }
    } catch (err) {
      console.error('Unexpected error fetching profile in AuthContext:', err);
      const activeUser = currentUser || user;
      setProfile({
        id: targetUserId,
        name: activeUser?.user_metadata?.name || activeUser?.email?.split('@')[0] || 'User',
        email: activeUser?.email || '',
        display_name: activeUser?.user_metadata?.name || activeUser?.email?.split('@')[0] || 'User',
        bio: '',
        phone: '',
        location: '',
        avatar_url: '',
        created_at: new Date().toISOString(),
        level: 'Cyber Novice',
        total_points: 0,
        preferences: DEFAULT_PREFERENCES,
        notification_settings: DEFAULT_NOTIFICATIONS,
      });
    } finally {
      setProfileLoading(false);
    }
  };

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
          setProfileLoading(false);
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
              fetchProfile(session.user.id, session.user);
              checkAdminRole(session.user.id);
            }, 0);
          } else {
            setProfileLoading(false);
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
        fetchProfile(session.user.id, session.user);
        checkAdminRole(session.user.id);
      } else {
        setProfileLoading(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
      profileLoading,
      fetchProfile,
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
