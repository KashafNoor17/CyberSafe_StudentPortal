import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Lock, Settings, Bell, Camera, ArrowLeft, Shield, Calendar } from 'lucide-react';
import { T } from '@/components/T';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PersonalInfoTab } from '@/components/profile/PersonalInfoTab';
import { SecurityTab } from '@/components/profile/SecurityTab';
import { PreferencesTab } from '@/components/profile/PreferencesTab';
import { NotificationsTab } from '@/components/profile/NotificationsTab';
import { DangerZone } from '@/components/profile/DangerZone';
import { ProfileCustomization } from '@/components/profile/ProfileCustomization';

import { format } from 'date-fns';

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

interface FullProfile {
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

export default function Profile() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      const raw = data as any;
      setProfile({
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
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: 'destructive', title: t('profile.fileTooLarge', 'File too large'), description: t('profile.avatarSizeLimit', 'Avatar must be under 2MB.') });
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast({ variant: 'destructive', title: t('profile.invalidFormat', 'Invalid format'), description: t('profile.avatarFormatHint', 'Use JPG, PNG, or GIF.') });
      return;
    }

    setAvatarUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      const avatarUrlWithCache = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrlWithCache } as any)
        .eq('user_id', user.id);
      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrlWithCache } : prev);
      toast({ title: t('profile.avatarUpdated', 'Avatar Updated'), description: t('profile.avatarUpdatedDesc', 'Your profile picture has been changed.') });
    } catch (err: any) {
      toast({ variant: 'destructive', title: t('profile.uploadFailed', 'Upload Failed'), description: err.message });
    } finally {
      setAvatarUploading(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('profile.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main id="main-content" className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
             <ArrowLeft className="h-4 w-4 mr-2" />
            {t('profile.backToDashboard')}
          </Button>

          {/* Profile Header */}
          <Card className="mb-6 card-glow animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={profile.avatar_url} alt={profile.name} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-secondary hover:bg-secondary/80 flex items-center justify-center cursor-pointer transition-colors border-2 border-background"
                    title="Change avatar"
                  >
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleAvatarUpload}
                      disabled={avatarUploading}
                    />
                  </label>
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h1 className="text-2xl font-bold">{profile.display_name || profile.name}</h1>
                  <p className="text-muted-foreground">{profile.email}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 justify-center sm:justify-start">
                    <div className="flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="text-sm text-primary font-medium">{profile.level}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        <T>Member since</T>{' '}{profile.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : t('profile.na')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="personal" className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="personal" className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{t('profile.tabPersonal')}</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1.5">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">{t('profile.tabSecurity')}</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-1.5">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">{t('profile.tabPreferences')}</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-1.5">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">{t('profile.tabNotifications')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <PersonalInfoTab
                userId={user!.id}
                email={profile.email}
                initialData={{
                  name: profile.name,
                  display_name: profile.display_name,
                  phone: profile.phone,
                  location: profile.location,
                  bio: profile.bio,
                }}
                onSaved={fetchProfile}
              />
            </TabsContent>

            <TabsContent value="security">
              <SecurityTab />
            </TabsContent>

            <TabsContent value="preferences">
              <PreferencesTab
                userId={user!.id}
                initialPreferences={profile.preferences}
                onSaved={fetchProfile}
              />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationsTab
                userId={user!.id}
                initialSettings={profile.notification_settings}
                onSaved={fetchProfile}
              />
            </TabsContent>
          </Tabs>



          {/* Profile Customization */}
          <div className="mt-6">
            <ProfileCustomization userId={user!.id} totalPoints={profile.total_points} onSaved={fetchProfile} />
          </div>

          {/* Danger Zone */}
          <div className="mt-8">
            <DangerZone
              userId={user!.id}
              onAccountDeleted={async () => {
                await signOut();
                navigate('/');
              }}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
