import { useState } from 'react';
import { Bell, Mail } from 'lucide-react';
import { T } from '@/components/T';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotificationSettings {
  email: { module_complete: boolean; badge_earned: boolean; certificate_ready: boolean; community_replies: boolean; friend_requests: boolean; weekly_report: boolean; product_updates: boolean; marketing: boolean };
  push: { learning_reminders: boolean; streak_alerts: boolean; community_posts: boolean; friend_activity: boolean };
  frequency: string;
}

interface NotificationsTabProps {
  userId: string;
  initialSettings: NotificationSettings;
  onSaved: () => void;
}

export function NotificationsTab({ userId, initialSettings, onSaved }: NotificationsTabProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);
  const [loading, setLoading] = useState(false);

  const updateEmail = (key: keyof NotificationSettings['email'], value: boolean) => {
    setSettings(prev => ({ ...prev, email: { ...prev.email, [key]: value } }));
  };

  const updatePush = (key: keyof NotificationSettings['push'], value: boolean) => {
    setSettings(prev => ({ ...prev, push: { ...prev.push, [key]: value } }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({ notification_settings: settings } as any).eq('user_id', userId);
      if (error) throw error;
      toast({ title: 'Notification Settings Saved', description: 'Your preferences have been updated.' });
      onSaved();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const emailNotifs = [
    { key: 'module_complete' as const, label: 'Module completion updates' },
    { key: 'badge_earned' as const, label: 'New badge earned' },
    { key: 'certificate_ready' as const, label: 'Certificate available' },
    { key: 'community_replies' as const, label: 'Community replies to my posts' },
    { key: 'friend_requests' as const, label: 'Friend requests' },
    { key: 'weekly_report' as const, label: 'Weekly progress report' },
    { key: 'product_updates' as const, label: 'Product updates and new features' },
    { key: 'marketing' as const, label: 'Marketing and promotions' },
  ];

  const pushNotifs = [
    { key: 'learning_reminders' as const, label: 'Learning reminders' },
    { key: 'streak_alerts' as const, label: 'Streak at risk alerts' },
    { key: 'community_posts' as const, label: 'New community posts' },
    { key: 'friend_activity' as const, label: 'Friend activity' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <T>Email Notifications</T>
          </CardTitle>
          <CardDescription><T>Choose which emails you receive</T></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailNotifs.map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <Label htmlFor={`email-${item.key}`}><T>{item.label}</T></Label>
              <Switch id={`email-${item.key}`} checked={settings.email[item.key]} onCheckedChange={v => updateEmail(item.key, v)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <T>Push Notifications</T>
          </CardTitle>
          <CardDescription><T>Browser push notification preferences</T></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pushNotifs.map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <Label htmlFor={`push-${item.key}`}><T>{item.label}</T></Label>
              <Switch id={`push-${item.key}`} checked={settings.push[item.key]} onCheckedChange={v => updatePush(item.key, v)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle><T>Notification Frequency</T></CardTitle>
          <CardDescription><T>How often to receive digest notifications</T></CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={settings.frequency} onValueChange={v => setSettings(prev => ({ ...prev, frequency: v }))}>
            {[
              { value: 'realtime', label: 'Real-time' },
              { value: 'daily', label: 'Daily digest' },
              { value: 'weekly', label: 'Weekly digest' },
              { value: 'never', label: 'Never' },
            ].map(opt => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value} id={`freq-${opt.value}`} />
                <Label htmlFor={`freq-${opt.value}`}><T>{opt.label}</T></Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => setSettings(initialSettings)}><T>Cancel</T></Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <T>Saving...</T> : <T>Save Notification Settings</T>}
        </Button>
      </div>
    </div>
  );
}
