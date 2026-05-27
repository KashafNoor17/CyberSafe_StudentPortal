import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Palette, Award, Crown } from 'lucide-react';
import { T } from '@/components/T';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getLevelName } from '@/lib/gamification';

const AVATAR_FRAMES = [
  { id: 'default', name: 'Default', minLevel: 0, color: 'border-muted-foreground' },
  { id: 'bronze', name: 'Bronze', minLevel: 200, color: 'border-amber-600' },
  { id: 'silver', name: 'Silver', minLevel: 500, color: 'border-gray-400' },
  { id: 'gold', name: 'Gold', minLevel: 1000, color: 'border-yellow-400' },
  { id: 'platinum', name: 'Platinum', minLevel: 2000, color: 'border-cyan-400' },
  { id: 'diamond', name: 'Diamond', minLevel: 3500, color: 'border-blue-400' },
  { id: 'legendary', name: 'Legendary', minLevel: 5500, color: 'border-purple-500' },
];

const PROFILE_THEMES = [
  { id: 'default', name: 'Default', emoji: '🌙' },
  { id: 'cyber', name: 'Cyber', emoji: '🌐' },
  { id: 'hacker', name: 'Hacker', emoji: '💻' },
  { id: 'shield', name: 'Shield', emoji: '🛡️' },
  { id: 'fire', name: 'Fire', emoji: '🔥' },
];

interface ProfileCustomizationProps {
  userId: string;
  totalPoints: number;
  onSaved?: () => void;
}

export function ProfileCustomization({ userId, totalPoints, onSaved }: ProfileCustomizationProps) {
  const { toast } = useToast();
  const [selectedFrame, setSelectedFrame] = useState('default');
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [displayBadges, setDisplayBadges] = useState<string[]>([]);
  const [userBadges, setUserBadges] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCustomization(); }, [userId]);

  const fetchCustomization = async () => {
    const [profileRes, badgesRes] = await Promise.all([
      supabase.from('profiles').select('preferences').eq('user_id', userId).maybeSingle(),
      supabase.from('user_badges').select('badge:badges(id, name)').eq('user_id', userId),
    ]);
    if (profileRes.data) {
      const prefs = (profileRes.data as any).preferences || {};
      setSelectedFrame(prefs.avatar_frame || 'default');
      setSelectedTheme(prefs.profile_theme || 'default');
      setSelectedTitle(prefs.custom_title || '');
      setDisplayBadges(prefs.display_badges || []);
    }
    if (badgesRes.data) {
      setUserBadges(badgesRes.data.map((b: any) => ({ id: b.badge.id, name: b.badge.name })));
    }
  };

  const toggleDisplayBadge = (badgeId: string) => {
    setDisplayBadges(prev => {
      if (prev.includes(badgeId)) return prev.filter(id => id !== badgeId);
      if (prev.length >= 3) return prev;
      return [...prev, badgeId];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: current } = await supabase.from('profiles').select('preferences').eq('user_id', userId).maybeSingle();
      const existingPrefs = (current as any)?.preferences || {};
      const { error } = await supabase.from('profiles').update({
        preferences: { ...existingPrefs, avatar_frame: selectedFrame, profile_theme: selectedTheme, custom_title: selectedTitle, display_badges: displayBadges },
      } as any).eq('user_id', userId);
      if (error) throw error;
      toast({ title: 'Profile customized', description: 'Your profile has been updated.' });
      onSaved?.();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const currentLevel = getLevelName(totalPoints);
  const titles = [currentLevel, 'Cyber Learner', 'Security Enthusiast', 'Digital Defender'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="h-5 w-5 text-primary" />
          <T>Profile Customization</T>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="mb-3 block"><T>Avatar Frame</T></Label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
            {AVATAR_FRAMES.map(frame => {
              const unlocked = totalPoints >= frame.minLevel;
              const isSelected = selectedFrame === frame.id;
              return (
                <button key={frame.id} onClick={() => unlocked && setSelectedFrame(frame.id)} disabled={!unlocked}
                  className={`relative rounded-lg p-2 text-center transition-all ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'} ${!unlocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <div className={`w-10 h-10 mx-auto rounded-full border-3 ${frame.color} bg-muted flex items-center justify-center mb-1`}>
                    <span className="text-xs">👤</span>
                  </div>
                  <span className="text-xs block">{frame.name}</span>
                  {!unlocked && <span className="text-[10px] text-muted-foreground">{frame.minLevel} pts</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="mb-3 block"><T>Profile Theme</T></Label>
          <div className="grid grid-cols-5 gap-3">
            {PROFILE_THEMES.map(theme => (
              <button key={theme.id} onClick={() => setSelectedTheme(theme.id)}
                className={`rounded-lg p-3 text-center transition-all ${selectedTheme === theme.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50 border border-border'}`}>
                <span className="text-2xl block mb-1">{theme.emoji}</span>
                <span className="text-xs">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-2 block"><T>Display Title</T></Label>
          <Select value={selectedTitle || currentLevel} onValueChange={setSelectedTitle}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {titles.map(title => (
                <SelectItem key={title} value={title}>
                  <div className="flex items-center gap-2"><Crown className="h-3 w-3" />{title}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 block"><T>Featured Badges (select up to 3)</T></Label>
          {userBadges.length === 0 ? (
            <p className="text-sm text-muted-foreground"><T>Earn badges to display them on your profile!</T></p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {userBadges.map(badge => (
                <Badge key={badge.id} variant={displayBadges.includes(badge.id) ? 'default' : 'outline'} className="cursor-pointer transition-all" onClick={() => toggleDisplayBadge(badge.id)}>
                  <Award className="h-3 w-3 mr-1" />{badge.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? <T>Saving...</T> : <T>Save Customization</T>}
        </Button>
      </CardContent>
    </Card>
  );
}
