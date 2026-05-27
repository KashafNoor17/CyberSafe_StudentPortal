import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { QuizEngine } from '@/components/quiz';
import { useAuth } from '@/contexts/AuthContext';
import { getQuizById } from '@/data/quizData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { T } from '@/components/T';

const STORAGE_KEY = 'quiz_progress';

interface QuizProgress {
  quizId: string;
  bestScore: number;
  attempts: number;
  passed: boolean;
  lastAttempt: string;
}

function loadProgress(): Record<string, QuizProgress> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveProgress(quizId: string, score: number, total: number, passed: boolean) {
  const progress = loadProgress();
  const existing = progress[quizId];
  const percentage = Math.round((score / total) * 100);

  progress[quizId] = {
    quizId,
    bestScore: existing ? Math.max(existing.bestScore, percentage) : percentage,
    attempts: existing ? existing.attempts + 1 : 1,
    passed: existing ? (existing.passed || passed) : passed,
    lastAttempt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export default function QuizDetail() {
  const { quizId } = useParams<{ quizId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const quiz = quizId ? getQuizById(quizId) : undefined;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?mode=login');
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, navigate]);

  const handleComplete = async (score: number, total: number, passed: boolean) => {
    if (!quiz) return;

    saveProgress(quiz.id, score, total, passed);

    if (user) {
      try {
        const percentage = Math.round((score / total) * 100);
        const pointsAwarded = percentage >= 100 ? 100 : percentage >= 70 ? 50 : 10;

        await supabase.from('quiz_results').insert({
          user_id: user.id,
          score,
          total_questions: total,
          answers: quiz.questions.map(q => ({ quizId: quiz.id, questionId: q.id })),
        });

        await supabase.from('points_log').insert({
          user_id: user.id,
          points: pointsAwarded,
          action: 'quiz_complete',
          description: `Completed ${quiz.title} with ${percentage}% score`,
        });

        await supabase.rpc('check_and_award_badges');

        toast({
          title: 'Quiz Completed!',
          description: `You scored ${score}/${total} (${percentage}%)${pointsAwarded ? ` and earned ${pointsAwarded} points!` : ''}`,
        });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error saving quiz result:', error);
        }
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground"><T>Loading quiz...</T></p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2"><T>Quiz Not Found</T></h1>
          <p className="text-muted-foreground mb-6">
            <T>The quiz you're looking for doesn't exist.</T>
          </p>
          <Button asChild>
            <Link to="/quiz"><T>Browse All Quizzes</T></Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <Link
          to="/quiz"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> <T>Back to Quizzes</T>
        </Link>

        <QuizEngine quiz={quiz} onComplete={handleComplete} />
      </main>
      <Footer />
    </div>
  );
}
