import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Github, Twitter, Linkedin, MessageSquarePlus, Send, Star, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { T } from '@/components/T';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const FEEDBACK_CATEGORIES = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'content', label: 'Content Issue' },
  { value: 'usability', label: 'Usability Problem' },
  { value: 'general', label: 'General Feedback' },
];

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:contact@cybersafe.edu', label: 'Email' },
];

function WebsiteFeedbackDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [form, setForm] = useState({
    category: 'general',
    message: '',
    email: '',
  });

  const reset = () => {
    setForm({ category: 'general', message: '', email: '' });
    setRating(0);
    setHoverRating(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.message.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('feedback' as any).insert([{
        user_id: user?.id || null,
        category: form.category,
        feedback_type: form.category,
        message: form.message.trim(),
        rating: rating || null,
        email: form.email || null,
      }]);
      if (error) throw error;
      toast({ title: 'Thank you!', description: 'Your feedback has been submitted.' });
      handleClose();
    } catch (err) {
      console.error('Website feedback submit error:', err);
      toast({ variant: 'destructive', title: 'Could not submit feedback', description: 'Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-primary" />
            Website Feedback
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Category */}
          <div className="space-y-1.5">
            <Label><T>Category</T></Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FEEDBACK_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}><T>{c.label}</T></SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rating */}
          <div className="space-y-1.5">
            <Label><T>Rating (optional)</T></Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5"
                  aria-label={`Rate ${s} stars`}
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      s <= (hoverRating || rating)
                        ? 'fill-warning text-warning'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label><T>Your feedback</T> *</Label>
            <Textarea
              placeholder="Tell us what's on your mind..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={4}
            />
          </div>

          {/* Email for guests */}
          {!user && (
            <div className="space-y-1.5">
              <Label><T>Email (optional, for follow-up)</T></Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleSubmit}
              disabled={submitting || !form.message.trim()}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? <T>Sending...</T> : <T>Submit Feedback</T>}
            </Button>
            <Button variant="outline" onClick={handleClose} disabled={submitting}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Footer() {
  const { t } = useTranslation();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const learnLinks = [
    { label: 'Modules', href: '/modules' },
    { label: 'Quiz', href: '/quiz' },
    { label: 'Password Checker', href: '/password-checker' },
    { label: 'Weekly Tips', href: '/tips' },
    { label: 'Leaderboard', href: '/leaderboard' },
  ];

  const communityLinks = [
    { label: 'Community', href: '/community' },
    { label: 'Blog', href: '/blog' },
    { label: 'Reviews', href: '/reviews' },
    { label: 'AI Detector', href: '/ai-detector' },
    { label: 'Verify Certificate', href: '/verify' },
  ];

  const platformLinks = [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Accessibility', href: '/accessibility' },
    { label: 'FAQ', href: '/faq' },
    { label: 'User Guide', href: '/guide' },
  ];

  return (
    <>
      <WebsiteFeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />

      <footer className="bg-card border-t border-border relative overflow-hidden" role="contentinfo">
        <div className="absolute inset-0 grid-pattern opacity-5" aria-hidden="true" />
        
        <div className="container mx-auto px-4 py-12 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl mb-4 group" aria-label="CyberSafe Home">
                <div className="w-10 h-10 rounded-lg cyber-gradient flex items-center justify-center" aria-hidden="true">
                  <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="cyber-gradient-text">{t('footer.brand')}</span>
              </Link>
              <p className="text-muted-foreground max-w-md mb-6">
                {t('footer.brandDesc')}
              </p>
              <div className="flex items-center gap-3" role="list" aria-label="Social media links">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all min-h-[44px] min-w-[44px]"
                    aria-label={`Follow us on ${social.label}`}
                    role="listitem"
                  >
                    <social.icon className="h-5 w-5" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>

            {/* Learn */}
            <nav aria-label="Learn">
              <h3 className="font-semibold mb-4 font-display text-foreground"><T>Learn</T></h3>
              <ul className="space-y-2">
                {learnLinks.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      <T>{link.label}</T>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Community */}
            <nav aria-label="Community">
              <h3 className="font-semibold mb-4 font-display text-foreground"><T>Community</T></h3>
              <ul className="space-y-2">
                {communityLinks.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      <T>{link.label}</T>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Platform */}
            <nav aria-label="Platform">
              <h3 className="font-semibold mb-4 font-display text-foreground"><T>Platform</T></h3>
              <ul className="space-y-2">
                {platformLinks.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      <T>{link.label}</T>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center">
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>
            <button
              onClick={() => setFeedbackOpen(true)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 underline-offset-4 hover:underline"
              aria-label="Open website feedback form"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden="true" />
              <T>Website Feedback</T>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
