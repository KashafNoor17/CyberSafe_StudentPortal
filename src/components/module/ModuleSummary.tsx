import { useState } from 'react';
import { BookOpen, Download, Lightbulb, HelpCircle, RefreshCw, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SummaryData {
  summary: string;
  keyTakeaways: string[];
  studyQuestions: { question: string; hint: string }[];
  estimatedReadMinutes: number;
}

interface ModuleSummaryProps {
  moduleId: string;
  moduleTitle: string;
}

export function ModuleSummary({ moduleId, moduleTitle }: ModuleSummaryProps) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-content', {
        body: { action: 'summarize-module', moduleId },
      });
      if (error) throw error;
      setData(result.summary);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  if (!data && !loading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-6 text-center">
          <BookOpen className="h-10 w-10 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-2">AI Summary</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get an AI-generated summary with key takeaways and study questions.
          </p>
          <Button onClick={fetchSummary} size="sm">
            <Lightbulb className="h-4 w-4 mr-1" />
            Generate Summary
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            AI Summary: {moduleTitle}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs gap-1">
              <Clock className="h-3 w-3" />
              {data?.estimatedReadMinutes || 3} min read
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fetchSummary} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="prose prose-sm max-w-none">
          {data?.summary.split('\n').map((p, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed">{p}</p>
          ))}
        </div>

        {/* Key Takeaways */}
        {data?.keyTakeaways && data.keyTakeaways.length > 0 && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Key Takeaways
            </h4>
            <ul className="space-y-2">
              {data.keyTakeaways.map((t, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Study Questions */}
        {data?.studyQuestions && data.studyQuestions.length > 0 && (
          <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
            <h4 className="text-sm font-semibold text-accent-foreground mb-3 flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Study Questions
            </h4>
            <div className="space-y-3">
              {data.studyQuestions.map((q, i) => (
                <div key={i} className="text-sm">
                  <p className="font-medium text-foreground mb-1">{i + 1}. {q.question}</p>
                  {showAnswers[i] ? (
                    <p className="text-muted-foreground pl-4 italic">💡 {q.hint}</p>
                  ) : (
                    <button
                      className="text-primary text-xs hover:underline pl-4"
                      onClick={() => setShowAnswers(prev => ({ ...prev, [i]: true }))}
                    >
                      Show hint
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
