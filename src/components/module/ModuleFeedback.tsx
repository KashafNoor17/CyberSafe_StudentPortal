import { useState, useEffect } from 'react';
import { Star, Send, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ModuleFeedbackProps {
  moduleId: string;
  moduleTitle: string;
}

export function ModuleFeedback({ moduleId, moduleTitle }: ModuleFeedbackProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [easyToUnderstand, setEasyToUnderstand] = useState<string | null>(null);
  const [mostHelpful, setMostHelpful] = useState('');
  const [improvement, setImprovement] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [totalRatings, setTotalRatings] = useState(0);

  useEffect(() => {
    if (user && moduleId) {
      checkExistingFeedback();
      fetchAggregateRatings();
    }
  }, [user, moduleId]);

  const checkExistingFeedback = async () => {
    const { data } = await supabase
      .from('module_feedback')
      .select('*')
      .eq('user_id', user!.id)
      .eq('module_id', moduleId)
      .maybeSingle();
    if (data) setSubmitted(true);
  };

  const fetchAggregateRatings = async () => {
    const { data } = await supabase.rpc('get_module_feedback_stats', { p_module_id: moduleId });
    const row = Array.isArray(data) ? data[0] : data;
    if (row && row.total_ratings > 0) {
      setAvgRating(Number(row.avg_rating));
      setTotalRatings(row.total_ratings);
    }
  };

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('module_feedback').upsert({
        user_id: user.id,
        module_id: moduleId,
        rating,
        easy_to_understand: easyToUnderstand,
        most_helpful: mostHelpful || null,
        improvement_suggestions: improvement || null,
        would_recommend: wouldRecommend,
      }, { onConflict: 'user_id,module_id' });
      if (error) throw error;
      setSubmitted(true);
      toast({ title: 'Thank you!', description: 'Your feedback helps us improve.' });
      fetchAggregateRatings();
    } catch (err) {
      console.error('ModuleFeedback submit error:', err);
      toast({
        variant: 'destructive',
        title: 'Could not submit feedback',
        description: 'Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  if (submitted) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="py-6 text-center">
          <ThumbsUp className="h-8 w-8 text-success mx-auto mb-2" />
          <p className="font-medium text-success">Thanks for your feedback!</p>
          {avgRating && (
            <p className="text-sm text-muted-foreground mt-1">
              Average rating: {avgRating}/5 ({totalRatings} ratings)
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-warning" />
          How was this module?
        </CardTitle>
        {avgRating && (
          <p className="text-sm text-muted-foreground">
            Average: {avgRating}/5 ({totalRatings} ratings)
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Star Rating */}
        <div>
          <p className="text-sm font-medium mb-2">Rate your experience:</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoverRating || rating)
                      ? 'text-warning fill-warning'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Easy to understand */}
        <div>
          <p className="text-sm font-medium mb-2">Was the content easy to understand?</p>
          <div className="flex gap-2">
            {['Yes', 'Somewhat', 'No'].map((option) => (
              <Button
                key={option}
                size="sm"
                variant={easyToUnderstand === option ? 'default' : 'outline'}
                onClick={() => setEasyToUnderstand(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>

        {/* Most helpful */}
        <div>
          <p className="text-sm font-medium mb-2">What was most helpful?</p>
          <Textarea
            placeholder="E.g., the real-world examples, the quiz questions..."
            value={mostHelpful}
            onChange={(e) => setMostHelpful(e.target.value)}
            rows={2}
          />
        </div>

        {/* Improvement */}
        <div>
          <p className="text-sm font-medium mb-2">What could be improved?</p>
          <Textarea
            placeholder="Your suggestions help us make this module better..."
            value={improvement}
            onChange={(e) => setImprovement(e.target.value)}
            rows={2}
          />
        </div>

        {/* Recommend */}
        <div>
          <p className="text-sm font-medium mb-2">Would you recommend this module?</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={wouldRecommend === true ? 'default' : 'outline'}
              onClick={() => setWouldRecommend(true)}
            >
              Yes
            </Button>
            <Button
              size="sm"
              variant={wouldRecommend === false ? 'default' : 'outline'}
              onClick={() => setWouldRecommend(false)}
            >
              No
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </CardContent>
    </Card>
  );
}
