import { useState } from 'react';
import { Dumbbell, RefreshCw, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ExerciseData {
  title: string;
  scenario: string;
  instructions: string[];
  hints: { level: number; text: string }[];
  solution: string;
  learningPoints: string[];
  difficulty: string;
}

interface ExerciseGeneratorProps {
  topic: string;
  difficulty?: string;
}

export function ExerciseGenerator({ topic, difficulty = 'beginner' }: ExerciseGeneratorProps) {
  const [exercise, setExercise] = useState<ExerciseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [showSolution, setShowSolution] = useState(false);

  const generate = async () => {
    setLoading(true);
    setRevealedHints(0);
    setShowSolution(false);
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-content', {
        body: { action: 'generate-exercise', topic, difficulty },
      });
      if (error) throw error;
      setExercise(result.content);
    } catch {
      toast.error('Failed to generate exercise');
    } finally {
      setLoading(false);
    }
  };

  if (!exercise && !loading) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/20">
        <CardContent className="p-6 text-center">
          <Dumbbell className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Practice Exercise</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Generate a new practice exercise on "{topic}"
          </p>
          <Button onClick={generate} size="sm" variant="outline">
            <Dumbbell className="h-4 w-4 mr-1" />
            Generate Exercise
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!exercise) return null;

  return (
    <Card className="border-accent/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-accent" />
            {exercise.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{exercise.difficulty}</Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={generate} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{exercise.scenario}</p>

        {/* Instructions */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1">
            {exercise.instructions.map((inst, i) => (
              <li key={i} className="text-sm text-muted-foreground">{inst}</li>
            ))}
          </ol>
        </div>

        {/* Hints */}
        {exercise.hints?.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold">Hints:</h4>
              {revealedHints < exercise.hints.length && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => setRevealedHints(p => p + 1)}
                >
                  <ChevronRight className="h-3 w-3 mr-1" />
                  Show hint {revealedHints + 1}
                </Button>
              )}
            </div>
            {exercise.hints.slice(0, revealedHints).map((hint, i) => (
              <div key={i} className="p-2 rounded bg-warning/5 border border-warning/10 text-sm text-muted-foreground">
                <span className="font-medium text-warning">Hint {hint.level}:</span> {hint.text}
              </div>
            ))}
          </div>
        )}

        {/* Solution */}
        <div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setShowSolution(!showSolution)}
          >
            {showSolution ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
            {showSolution ? 'Hide Solution' : 'Show Solution'}
          </Button>
          {showSolution && (
            <div className="mt-2 p-3 rounded bg-success/5 border border-success/10">
              <p className="text-sm text-muted-foreground">{exercise.solution}</p>
              {exercise.learningPoints?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-success mb-1">Key Learning Points:</p>
                  <ul className="space-y-1">
                    {exercise.learningPoints.map((lp, i) => (
                      <li key={i} className="text-xs text-muted-foreground">• {lp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
