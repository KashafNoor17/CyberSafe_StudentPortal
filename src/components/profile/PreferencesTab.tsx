import { useState } from 'react';
import { Sun, Moon, Monitor, Globe, Check } from 'lucide-react';
import { T } from '@/components/T';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, getLanguageConfig } from '@/i18n/config';

interface Preferences {
  theme: string;
  language: string;
  content_language: string;
  auto_detect_language: boolean;
  translation_quality: string;
  auto_play_videos: boolean;
  show_reminders: boolean;
  public_profile: boolean;
  high_contrast: boolean;
  reduce_motion: boolean;
  large_text: boolean;
}

interface PreferencesTabProps {
  userId: string;
  initialPreferences: Partial<Preferences>;
  onSaved: () => void;
}

export function PreferencesTab({ userId, initialPreferences, onSaved }: PreferencesTabProps) {
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const { i18n } = useTranslation();

  const defaults: Preferences = {
    theme: 'system', language: i18n.language || 'en', content_language: 'same',
    auto_detect_language: true, translation_quality: 'human_reviewed',
    auto_play_videos: false, show_reminders: true, public_profile: false,
    high_contrast: false, reduce_motion: false, large_text: false,
    ...initialPreferences,
  };

  const [prefs, setPrefs] = useState<Preferences>(defaults);
  const [loading, setLoading] = useState(false);

  const updatePref = (key: keyof Preferences, value: any) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      i18n.changeLanguage(prefs.language);
      const { error } = await supabase.from('profiles').update({ preferences: prefs } as any).eq('user_id', userId);
      if (error) throw error;
      setTheme(prefs.theme);
      toast({ title: 'Preferences Saved', description: 'Your preferences have been updated.' });
      onSaved();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle><T>Theme</T></CardTitle>
          <CardDescription><T>Choose your preferred appearance</T></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'light', icon: Sun, label: 'Light' },
              { value: 'dark', icon: Moon, label: 'Dark' },
              { value: 'system', icon: Monitor, label: 'System' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => updatePref('theme', opt.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  prefs.theme === opt.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                }`}
              >
                <opt.icon className="h-5 w-5" />
                <span className="text-sm font-medium"><T>{opt.label}</T></span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <T>Language Settings</T>
          </CardTitle>
          <CardDescription><T>Configure your interface and content language preferences</T></CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="interface-language" className="text-sm font-medium"><T>Interface Language</T></Label>
            <Select value={prefs.language} onValueChange={v => updatePref('language', v)}>
              <SelectTrigger id="interface-language" className="w-full"><SelectValue placeholder="Select language" /></SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.name}</span>
                      {lang.nativeName !== lang.name && <span className="text-muted-foreground">({lang.nativeName})</span>}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getLanguageConfig(prefs.language).isRtl && (
              <p className="text-xs text-muted-foreground"><T>This language uses right-to-left (RTL) layout.</T></p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content-language" className="text-sm font-medium"><T>Content Language (for modules)</T></Label>
            <Select value={prefs.content_language} onValueChange={v => updatePref('content_language', v)}>
              <SelectTrigger id="content-language" className="w-full"><SelectValue placeholder="Select content language" /></SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="same"><T>Same as interface</T></SelectItem>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-detect" className="text-sm font-medium"><T>Auto-detect language from browser</T></Label>
              <p className="text-xs text-muted-foreground"><T>Use your browser's language preference on first visit</T></p>
            </div>
            <Switch id="auto-detect" checked={prefs.auto_detect_language} onCheckedChange={v => updatePref('auto_detect_language', v)} />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium"><T>Translation Quality</T></Label>
            <RadioGroup value={prefs.translation_quality} onValueChange={v => updatePref('translation_quality', v)} className="space-y-2">
              {[
                { value: 'machine', label: 'Machine translated', desc: 'Faster updates, may have inaccuracies' },
                { value: 'human_reviewed', label: 'Human reviewed', desc: 'More accurate, recommended' },
                { value: 'community', label: 'Community contributed', desc: 'Translations by the community' },
              ].map(opt => (
                <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${prefs.translation_quality === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                  <RadioGroupItem value={opt.value} className="mt-0.5" />
                  <div>
                    <span className="text-sm font-medium"><T>{opt.label}</T></span>
                    <p className="text-xs text-muted-foreground"><T>{opt.desc}</T></p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle><T>Content Preferences</T></CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'auto_play_videos' as const, label: 'Auto-play videos' },
            { key: 'show_reminders' as const, label: 'Show progress reminders' },
            { key: 'public_profile' as const, label: 'Public profile (visible in community)' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <Label htmlFor={item.key}><T>{item.label}</T></Label>
              <Switch id={item.key} checked={prefs[item.key]} onCheckedChange={v => updatePref(item.key, v)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle><T>Accessibility</T></CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'high_contrast' as const, label: 'High contrast mode' },
            { key: 'reduce_motion' as const, label: 'Reduce motion' },
            { key: 'large_text' as const, label: 'Large text' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <Label htmlFor={item.key}><T>{item.label}</T></Label>
              <Switch id={item.key} checked={prefs[item.key]} onCheckedChange={v => updatePref(item.key, v)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => setPrefs(defaults)}><T>Cancel</T></Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <T>Saving...</T> : <T>Save Preferences</T>}
        </Button>
      </div>
    </div>
  );
}
