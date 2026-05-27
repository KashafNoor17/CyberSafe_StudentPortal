import { useState } from 'react';
import { Lightbulb, X, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ExplanationData {
  explanation: string;
  examples: { title: string; description: string }[];
  analogy: string;
  followUpQuestions: { question: string; answer: string }[];
}

interface ExplainConceptProps {
  concept: string;
  level?: string;
  context?: string;
}

export function ExplainConcept({ concept, level = 'beginner', context }: ExplainConceptProps) {
  const { user } = useAuth();
  const [data, setData] = useState<ExplanationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);

  const fetchExplanation = async (action?: 'simplify' | 'example') => {
    if (data && !action) { setOpen(!open); return; }
    setOpen(true);
    setLoading(true);
    setFeedbackGiven(null);
    setInteractionId(null);

    const startTime = Date.now();
    try {
      const promptConcept = action === 'simplify'
        ? `Simplify further: ${concept}`
        : action === 'example'
        ? `Give another practical example for: ${concept}`
        : concept;

      const { data: result, error } = await supabase.functions.invoke('ai-content', {
        body: { action: 'explain-concept', concept: promptConcept, level: action === 'simplify' ? 'beginner' : level, context },
      });
      if (error) throw error;
      setData(result.explanation);

      // Log interaction
      if (user) {
        const latency = Date.now() - startTime;
        const { data: logged } = await supabase.from('ai_interactions').insert({
          user_id: user.id,
          interaction_type: action ? `explanation_${action}` : 'explanation',
          prompt: promptConcept.slice(0, 500),
          response: JSON.stringify(result.explanation).slice(0, 2000),
          latency_ms: latency,
          model_version: 'gemini-3-flash-preview',
        }).select('id').single();
        if (logged) setInteractionId(logged.id);
      }
    } catch {
      setOpen(false);
      toast.error('Failed to generate explanation');
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (helpful: boolean) => {
    if (!user || !interactionId || feedbackGiven !== null) return;
    setFeedbackGiven(helpful);
    await supabase.from('ai_feedback').insert({
      interaction_id: interactionId,
      user_id: user.id,
      helpful,
      user_rating: helpful ? 5 : 2,
    });
    toast.success(helpful ? 'Thanks for the feedback!' : 'We\'ll improve this explanation');
  };

  return (
    <div className="my-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-xs h-7 px-2 gap-1 text-primary hover:text-primary"
        onClick={() => fetchExplanation()}
      >
        <Lightbulb className="h-3 w-3" />
        {open ? 'Hide explanation' : 'Explain this'}
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </Button>

      {open && (
        <Card className="mt-2 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-primary" />
                AI Explanation
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(false)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : data ? (
              <>
                <p className="text-sm text-muted-foreground leading-relaxed">{data.explanation}</p>

                {data.analogy && (
                  <div className="p-3 rounded bg-background border text-sm">
                    <span className="font-medium">🔗 Analogy:</span>{' '}
                    <span className="text-muted-foreground">{data.analogy}</span>
                  </div>
                )}

                {data.examples?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">Practical Examples:</p>
                    {data.examples.map((ex, i) => (
                      <div key={i} className="p-2 rounded bg-background border text-xs">
                        <p className="font-medium">{ex.title}</p>
                        <p className="text-muted-foreground">{ex.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {data.followUpQuestions?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">Check Your Understanding:</p>
                    {data.followUpQuestions.map((q, i) => (
                      <div key={i} className="text-xs">
                        <p className="font-medium">{q.question}</p>
                        {revealedAnswers[i] ? (
                          <p className="text-muted-foreground mt-1 italic">→ {q.answer}</p>
                        ) : (
                          <button
                            className="text-primary hover:underline mt-0.5"
                            onClick={() => setRevealedAnswers(p => ({ ...p, [i]: true }))}
                          >
                            Show answer
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Action buttons: Simplify, Give Example, Feedback */}
                <div className="flex items-center gap-2 pt-2 border-t border-border flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 gap-1"
                    onClick={() => fetchExplanation('simplify')}
                    disabled={loading}
                  >
                    <Sparkles className="h-3 w-3" />
                    Simplify further
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 gap-1"
                    onClick={() => fetchExplanation('example')}
                    disabled={loading}
                  >
                    <BookOpen className="h-3 w-3" />
                    Give example
                  </Button>
                  <div className="ml-auto flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Helpful?</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 ${feedbackGiven === true ? 'text-green-500' : ''}`}
                      onClick={() => submitFeedback(true)}
                      disabled={feedbackGiven !== null}
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 ${feedbackGiven === false ? 'text-destructive' : ''}`}
                      onClick={() => submitFeedback(false)}
                      disabled={feedbackGiven !== null}
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
