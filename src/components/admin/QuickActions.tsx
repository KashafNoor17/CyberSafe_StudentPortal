import { useState } from 'react';
import { Plus, BookOpen, Award, Megaphone, FileText, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QuickActionsProps {
  onRefresh: () => void;
}

export function QuickActions({ onRefresh }: QuickActionsProps) {
  const { toast } = useToast();
  const [moduleOpen, setModuleOpen] = useState(false);
  const [badgeOpen, setBadgeOpen] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(false);

  const [moduleForm, setModuleForm] = useState({
    title: '',
    slug: '',
    description: '',
    difficulty: 'beginner',
  });

  const [badgeForm, setBadgeForm] = useState({
    name: '',
    description: '',
    icon: '🏆',
    category: 'achievement',
    points_required: '0',
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
  });

  const handleCreateModule = async () => {
    if (!moduleForm.title || !moduleForm.slug) {
      toast({ variant: 'destructive', title: 'Title and slug are required' });
      return;
    }

    const { error } = await supabase.from('learning_modules').insert([{
      title: moduleForm.title,
      slug: moduleForm.slug.toLowerCase().replace(/\s+/g, '-'),
      description: moduleForm.description,
      difficulty: moduleForm.difficulty,
      order_index: 99,
      content: {},
    }]);

    if (error) {
      toast({ variant: 'destructive', title: 'Failed to create module' });
      return;
    }

    toast({ title: 'Module created successfully!' });
    setModuleOpen(false);
    setModuleForm({ title: '', slug: '', description: '', difficulty: 'beginner' });
    onRefresh();
  };

  const handleCreateBadge = async () => {
    if (!badgeForm.name) {
      toast({ variant: 'destructive', title: 'Badge name is required' });
      return;
    }

    const { error } = await supabase.from('badges').insert([{
      name: badgeForm.name,
      description: badgeForm.description || `Earned the ${badgeForm.name} badge`,
      icon: badgeForm.icon,
      category: badgeForm.category,
      points_required: parseInt(badgeForm.points_required) || 0,
      badge_key: badgeForm.name.toLowerCase().replace(/\s+/g, '_'),
    }]);

    if (error) {
      toast({ variant: 'destructive', title: 'Failed to create badge' });
      return;
    }

    toast({ title: 'Badge created successfully!' });
    setBadgeOpen(false);
    setBadgeForm({ name: '', description: '', icon: '🏆', category: 'achievement', points_required: '0' });
    onRefresh();
  };

  const handleSendAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.message) {
      toast({ variant: 'destructive', title: 'Title and message are required' });
      return;
    }

    // Store announcement in weekly_tips as a banner for now
    const { error } = await supabase.from('weekly_tips').insert([{
      tip_text: `📢 ${announcementForm.title}: ${announcementForm.message}`,
      week_number: Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 604800000),
      year: new Date().getFullYear(),
      category: 'announcement',
      risk_level: 'low',
      is_banner: true,
    }]);

    if (error) {
      toast({ variant: 'destructive', title: 'Failed to send announcement' });
      return;
    }

    toast({ title: 'Announcement posted as banner!' });
    setAnnouncementOpen(false);
    setAnnouncementForm({ title: '', message: '' });
    onRefresh();
  };

  const badges = ['🏆', '🎯', '⭐', '🔥', '💎', '🛡️', '🎖️', '🏅', '🎓', '💡', '🚀', '👑'];

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6 p-4 rounded-lg bg-muted/30 border border-border/50">
        <Button size="sm" onClick={() => setModuleOpen(true)} className="gap-2">
          <BookOpen className="h-4 w-4" />
          New Module
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setBadgeOpen(true)} className="gap-2">
          <Award className="h-4 w-4" />
          New Badge
        </Button>
        <Button size="sm" variant="outline" onClick={() => setAnnouncementOpen(true)} className="gap-2">
          <Megaphone className="h-4 w-4" />
          Announcement
        </Button>
      </div>

      {/* Module Dialog */}
      <Dialog open={moduleOpen} onOpenChange={setModuleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Create Module</DialogTitle>
            <DialogDescription>Create a new learning module</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                value={moduleForm.title} 
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} 
                placeholder="e.g., Ransomware Awareness"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input 
                value={moduleForm.slug} 
                onChange={(e) => setModuleForm({ ...moduleForm, slug: e.target.value })} 
                placeholder="e.g., ransomware-awareness"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={moduleForm.description} 
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} 
                placeholder="Brief description of the module..."
              />
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={moduleForm.difficulty} onValueChange={(v) => setModuleForm({ ...moduleForm, difficulty: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateModule}>Create Module</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Badge Dialog */}
      <Dialog open={badgeOpen} onOpenChange={setBadgeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Badge</DialogTitle>
            <DialogDescription>Create a new achievement badge</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Badge Name</Label>
              <Input 
                value={badgeForm.name} 
                onChange={(e) => setBadgeForm({ ...badgeForm, name: e.target.value })} 
                placeholder="e.g., Security Champion"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={badgeForm.description} 
                onChange={(e) => setBadgeForm({ ...badgeForm, description: e.target.value })} 
                placeholder="What this badge represents..."
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {badges.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setBadgeForm({ ...badgeForm, icon: emoji })}
                    className={`w-10 h-10 rounded-lg border-2 text-xl flex items-center justify-center transition-colors ${
                      badgeForm.icon === emoji ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={badgeForm.category} onValueChange={(v) => setBadgeForm({ ...badgeForm, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="skill">Skill</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Points Required</Label>
                <Input 
                  type="number"
                  value={badgeForm.points_required} 
                  onChange={(e) => setBadgeForm({ ...badgeForm, points_required: e.target.value })} 
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBadgeOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateBadge}>Create Badge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Announcement Dialog */}
      <Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Announcement</DialogTitle>
            <DialogDescription>Post a platform-wide announcement banner</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                value={announcementForm.title} 
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} 
                placeholder="e.g., New Feature Available"
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea 
                value={announcementForm.message} 
                onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })} 
                placeholder="Your announcement message..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnnouncementOpen(false)}>Cancel</Button>
            <Button onClick={handleSendAnnouncement}>Post Announcement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
