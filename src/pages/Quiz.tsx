import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Clock, CheckCircle, Trophy, BookOpen, Search } from 'lucide-react';
import { T } from '@/components/T';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { QUIZZES } from '@/data/quizData';

interface QuizProgress {
  quizId: string;
  bestScore: number;
  attempts: number;
  passed: boolean;
  lastAttempt: string;
}

const STORAGE_KEY = 'quiz_progress';

function loadProgress(): Record<string, QuizProgress> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export default function Quiz() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [progress, setProgress] = useState<Record<string, QuizProgress>>({});

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const filteredQuizzes = QUIZZES.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    q.description.toLowerCase().includes(search.toLowerCase())
  );

  const completedCount = Object.values(progress).filter(p => p.passed).length;
  const totalQuizzes = QUIZZES.length;
  const overallProgress = Math.round((completedCount / totalQuizzes) * 100);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-accent/10 text-accent border-accent/20';
      case 'Intermediate': return 'bg-warning/10 text-warning border-warning/20';
      case 'Advanced': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleQuizClick = (quizId: string) => {
    if (!user) {
      navigate('/auth?mode=login');
      return;
    }
    navigate(`/quiz/${quizId}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground"><T>Loading quizzes...</T></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-xs text-primary font-mono uppercase"><T>Knowledge Tests</T></span>
          </div>
          <h1 className="text-3xl font-bold font-orbitron"><T>Security Quizzes</T></h1>
          <p className="text-muted-foreground mt-1">
            <T>Test your cybersecurity knowledge with our quizzes</T>
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold"><T>Your Progress</T></p>
                  <p className="text-sm text-muted-foreground">
                    {completedCount}/{totalQuizzes} <T>quizzes passed</T>
                  </p>
                </div>
              </div>
              <span className="text-3xl font-bold text-primary font-mono">
                {overallProgress}%
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={t('quiz.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search quizzes"
          />
        </div>

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredQuizzes.map(quiz => {
            const quizProgress = progress[quiz.id];
            const isPassed = quizProgress?.passed;
            const hasAttempted = !!quizProgress;

            return (
              <Card
                key={quiz.id}
                className={`group hover:border-primary/30 transition-all ${isPassed ? 'border-accent/30 bg-accent/5' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {quiz.icon}
                    </div>
                    {isPassed && (
                      <CheckCircle className="w-5 h-5 text-accent shrink-0" />
                    )}
                  </div>
                  <CardTitle className="text-base mt-3">{quiz.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">
                    {quiz.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${getDifficultyColor(quiz.difficulty)}`}>
                      <T>{quiz.difficulty}</T>
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {quiz.questions.length} <T>questions</T>
                    </span>
                  </div>

                  {/* Score / Status */}
                  {hasAttempted ? (
                    <div className="text-sm">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span><T>Best Score</T>:</span>
                        <span className={`font-semibold ${isPassed ? 'text-accent' : 'text-warning'}`}>
                          {quizProgress.bestScore}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground text-xs mt-1">
                        <span><T>Attempts</T>:</span>
                        <span>{quizProgress.attempts}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic"><T>Not taken yet</T></p>
                  )}

                  {/* CTA */}
                  <Button
                    size="sm"
                    variant={isPassed ? 'outline' : 'default'}
                    className="w-full"
                    onClick={() => handleQuizClick(quiz.id)}
                  >
                    {hasAttempted ? (isPassed ? <T>Review</T> : <T>Retry</T>) : <T>Start Quiz</T>}
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredQuizzes.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-1"><T>No quizzes found</T></p>
            <p className="text-sm text-muted-foreground">
              <T>Try adjusting your search terms</T>
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setSearch('')}
            >
              <T>Clear Search</T>
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
