import { useState } from 'react';
import { MessageSquarePlus, Bug, Lightbulb, MessageCircle, Star, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { T } from '@/components/T';

const CATEGORIES = [
  { value: 'bug', label: 'Bug Report', icon: Bug },
  { value: 'feature', label: 'Feature Request', icon: Lightbulb },
  { value: 'content', label: 'Content Issue', icon: MessageCircle },
  { value: 'usability', label: 'Usability Problem', icon: MessageSquarePlus },
  { value: 'general', label: 'General Feedback', icon: MessageCircle },
];

export function FeedbackWidget() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [form, setForm] = useState({
    category: 'general',
    feedback_type: 'general',
    message: '',
    email: '',
  });

  const handleSubmit = async () => {
    if (!form.message.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('feedback' as any).insert([{
        user_id: user?.id || null,
        category: form.category,
        feedback_type: form.feedback_type,
        message: form.message.trim(),
        rating: rating || null,
        email: form.email || null,
      }]);
      if (error) throw error;
      toast({ title: 'Thank you!', description: 'Your feedback has been submitted.' });
      setOpen(false);
      setForm({ category: 'general', feedback_type: 'general', message: '', email: '' });
      setRating(0);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit feedback.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating trigger button — hidden on mobile to reduce clutter */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-primary text-primary-foreground px-2 py-4 rounded-l-lg shadow-lg hover:px-3 transition-all hidden md:block"
        aria-label="Give feedback"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        <span className="text-xs font-semibold tracking-wider flex items-center gap-1">
          <MessageSquarePlus className="h-4 w-4 rotate-90" />
          <T>Feedback</T>
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 w-80 max-h-[80vh] bg-card border border-border rounded-l-xl shadow-2xl overflow-y-auto animate-fade-in">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg"><T>Send Feedback</T></h3>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close feedback">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label><T>Category</T></Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
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

            {/* Email */}
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

            <Button onClick={handleSubmit} disabled={submitting || !form.message.trim()} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {submitting ? <T>Sending...</T> : <T>Submit Feedback</T>}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}