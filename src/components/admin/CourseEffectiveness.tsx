import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { BookOpen, Clock, AlertTriangle, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ModuleMetric {
  id: string;
  title: string;
  completions: number;
  avgQuizScore: number;
  avgTimeMinutes: number;
  estimatedMinutes: number;
  difficultyIndex: number;
}

interface QuestionMetric {
  id: string;
  question: string;
  module: string;
  correctRate: number;
  attempts: number;
}

export function CourseEffectiveness() {
  const [modules, setModules] = useState<ModuleMetric[]>([]);
  const [questions, setQuestions] = useState<QuestionMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [
        { data: modulesData },
        { data: completions },
        { data: quizzes },
        { data: answers },
      ] = await Promise.all([
        supabase.from('learning_modules').select('id, title, estimated_minutes').order('order_index'),
        supabase.from('module_completions').select('module_id, user_id'),
        supabase.from('module_quizzes').select('id, module_id, question'),
        supabase.from('user_quiz_answers').select('quiz_id, module_id, is_correct'),
      ]);

      if (!modulesData) { setLoading(false); return; }

      // Module metrics
      const completionCounts: Record<string, number> = {};
      completions?.forEach(c => { completionCounts[c.module_id] = (completionCounts[c.module_id] || 0) + 1; });

      // Quiz scores per module
      const moduleCorrect: Record<string, number> = {};
      const moduleAttempts: Record<string, number> = {};
      answers?.forEach(a => {
        moduleAttempts[a.module_id] = (moduleAttempts[a.module_id] || 0) + 1;
        if (a.is_correct) moduleCorrect[a.module_id] = (moduleCorrect[a.module_id] || 0) + 1;
      });

      const moduleMetrics: ModuleMetric[] = modulesData.map(m => {
        const attempts = moduleAttempts[m.id] || 0;
        const correct = moduleCorrect[m.id] || 0;
        const avgScore = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
        const compCount = completionCounts[m.id] || 0;

        // Difficulty index: inverse of average score (higher = harder)
        const difficultyIndex = attempts > 0 ? Math.round(100 - avgScore) : 50;

        return {
          id: m.id,
          title: m.title.replace(/ Security| Awareness| Basics/g, ''),
          completions: compCount,
          avgQuizScore: avgScore,
          avgTimeMinutes: m.estimated_minutes || 10,
          estimatedMinutes: m.estimated_minutes || 10,
          difficultyIndex,
        };
      });

      setModules(moduleMetrics);

      // Question-level metrics
      const questionCorrect: Record<string, number> = {};
      const questionAttempts: Record<string, number> = {};
      answers?.forEach(a => {
        questionAttempts[a.quiz_id] = (questionAttempts[a.quiz_id] || 0) + 1;
        if (a.is_correct) questionCorrect[a.quiz_id] = (questionCorrect[a.quiz_id] || 0) + 1;
      });

      const moduleNameMap = new Map(modulesData.map(m => [m.id, m.title]));
      const questionMetrics: QuestionMetric[] = (quizzes || []).map(q => ({
        id: q.id,
        question: q.question.length > 60 ? q.question.slice(0, 60) + '…' : q.question,
        module: moduleNameMap.get(q.module_id) || 'Unknown',
        correctRate: questionAttempts[q.id]
          ? Math.round((questionCorrect[q.id] || 0) / questionAttempts[q.id] * 100)
          : 0,
        attempts: questionAttempts[q.id] || 0,
      })).sort((a, b) => a.correctRate - b.correctRate);

      setQuestions(questionMetrics);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Module difficulty index */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Module Difficulty Index
          </CardTitle>
          <CardDescription>Higher score = harder module (based on quiz performance)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modules} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="title" type="category" width={130} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="difficultyIndex" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} name="Difficulty" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Module comparison */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Avg Quiz Score by Module</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modules}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="title" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="avgQuizScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Avg Score %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Completions by Module</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modules}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="title" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="completions" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} name="Completions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hardest questions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Most Difficult Questions
          </CardTitle>
          <CardDescription>Questions with the lowest correct answer rates</CardDescription>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No quiz data yet</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {questions.slice(0, 10).map((q, i) => (
                <div key={q.id} className="flex items-center gap-4 p-3 rounded-lg border border-border/50">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    q.correctRate < 40 ? 'bg-destructive/10 text-destructive' :
                    q.correctRate < 60 ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{q.question}</p>
                    <p className="text-xs text-muted-foreground">{q.module} · {q.attempts} attempts</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${
                      q.correctRate < 40 ? 'text-destructive' :
                      q.correctRate < 60 ? 'text-warning' : 'text-primary'
                    }`}>
                      {q.correctRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">correct</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
