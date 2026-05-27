import { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PostModuleSurveyProps {
  moduleId: string;
  moduleTitle: string;
  onClose: () => void;
}

export function PostModuleSurvey({ moduleId, moduleTitle, onClose }: PostModuleSurveyProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [clarity, setClarity] = useState('');
  const [mostHelpful, setMostHelpful] = useState('');
  const [improvement, setImprovement] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState('');

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('module_surveys' as any).insert([{
        user_id: user.id,
        module_id: moduleId,
        rating,
        clarity: clarity || null,
        most_helpful: mostHelpful || null,
        improvement: improvement || null,
        would_recommend: wouldRecommend === 'yes' ? true : wouldRecommend === 'no' ? false : null,
      }]);
      if (error) throw error;
      toast({ title: 'Thank you!', description: 'Your feedback helps us improve.' });
      onClose();
    } catch {
      toast({ variant: 'destructive', title: 'Error submitting survey' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">How was "{moduleTitle}"?</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Dismiss survey">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Q1: Rating */}
        <div className="space-y-1.5">
          <Label>How would you rate this module? *</Label>
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
                <Star className={`h-7 w-7 transition-colors ${s <= (hoverRating || rating) ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Q2: Clarity */}
        <div className="space-y-1.5">
          <Label>Was the content easy to understand?</Label>
          <RadioGroup value={clarity} onValueChange={setClarity} className="flex gap-4">
            {['Yes', 'Somewhat', 'No'].map((opt) => (
              <div key={opt} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.toLowerCase()} id={`clarity-${opt}`} />
                <Label htmlFor={`clarity-${opt}`} className="cursor-pointer">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Q3: Most helpful */}
        <div className="space-y-1.5">
          <Label>What was most helpful?</Label>
          <Textarea
            placeholder="e.g. The real-world examples..."
            value={mostHelpful}
            onChange={(e) => setMostHelpful(e.target.value)}
            rows={2}
          />
        </div>

        {/* Q4: Improvement */}
        <div className="space-y-1.5">
          <Label>What could be improved?</Label>
          <Textarea
            placeholder="Any suggestions..."
            value={improvement}
            onChange={(e) => setImprovement(e.target.value)}
            rows={2}
          />
        </div>

        {/* Q5: Recommend */}
        <div className="space-y-1.5">
          <Label>Would you recommend this module?</Label>
          <RadioGroup value={wouldRecommend} onValueChange={setWouldRecommend} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="rec-yes" />
              <Label htmlFor="rec-yes" className="cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="rec-no" />
              <Label htmlFor="rec-no" className="cursor-pointer">No</Label>
            </div>
          </RadioGroup>
        </div>

        <Button onClick={handleSubmit} disabled={submitting || rating === 0} className="w-full">
          <Send className="h-4 w-4 mr-2" />
          {submitting ? 'Submitting...' : 'Submit Survey'}
        </Button>
      </CardContent>
    </Card>
  );
}
