import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Shield, Target, Lightbulb, Clock, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ModuleQuiz } from '@/components/ModuleQuiz';
import { PasswordStrengthExercise } from '@/components/PasswordStrengthExercise';
import { PhishingExercise } from '@/components/PhishingExercise';
import { PrivacySimulatorExercise } from '@/components/PrivacySimulatorExercise';
import { BadgeNotification } from '@/components/BadgeNotification';

import { ModuleSummary } from '@/components/module/ModuleSummary';
import { ExplainConcept } from '@/components/module/ExplainConcept';
import { ExerciseGenerator } from '@/components/module/ExerciseGenerator';
import { ModuleFeedback } from '@/components/module/ModuleFeedback';
import { ModulePdfSummary } from '@/components/module/ModulePdfSummary';
import { ModuleVideoPlayer } from '@/components/module/ModuleVideoPlayer';
import { ModuleCertificate } from '@/components/module/ModuleCertificate';
import { RelatedModules } from '@/components/module/RelatedModules';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { T } from '@/components/T';

interface ModuleSection {
  title: string;
  content: string;
}

interface DbModuleSection {
  id: string;
  title: string;
  content: string;
  content_type: string;
  order_index: number;
}

interface ModuleContent {
  definition?: string;
  methodology?: string;
  example?: string;
  prevention?: string[];
  sections?: ModuleSection[];
}

interface Module {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  estimated_minutes: number;
  content: ModuleContent;
  order_index: number;
  pdf_summary?: Record<string, unknown> | null;
  related_modules?: string[] | null;
  video_url?: string | null;
}

export default function ModuleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackActivity } = useActivityTracker();
  const [module, setModule] = useState<Module | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [nextModule, setNextModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState<{ score: number; total: number } | null>(null);
  const [dbSections, setDbSections] = useState<DbModuleSection[]>([]);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);

  const [earnedBadge, setEarnedBadge] = useState<{
    name: string;
    description: string;
    icon: string;
    category: string;
  } | null>(null);
  const [previousBadgeIds, setPreviousBadgeIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && slug) {
      fetchModule();
    }
  }, [user, slug]);

  useEffect(() => {
    if (module && user) {
      trackActivity('module_start', module.id, {
        module_title: module.title,
        module_slug: module.slug,
      });
    }
  }, [module?.id, user?.id]);

  const fetchModule = async () => {
    try {
      const { data: moduleData, error } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error || !moduleData) {
        navigate('/modules');
        return;
      }

      setModule({
        ...moduleData,
        difficulty: moduleData.difficulty || 'beginner',
        estimated_minutes: moduleData.estimated_minutes || 10,
        content: moduleData.content as unknown as ModuleContent,
        pdf_summary: moduleData.pdf_summary as Record<string, unknown> | null,
        related_modules: (moduleData.related_modules as string[]) || [],
        video_url: (moduleData as any).video_url || null,
      } as Module);

      const { data: completion } = await supabase
        .from('module_completions')
        .select('id')
        .eq('user_id', user!.id)
        .eq('module_id', moduleData.id)
        .maybeSingle();

      setIsCompleted(!!completion);

      const { data: nextModuleData } = await supabase
        .from('learning_modules')
        .select('slug')
        .gt('order_index', moduleData.order_index)
        .order('order_index')
        .limit(1)
        .maybeSingle();

      setNextModule(nextModuleData?.slug || null);

      const { data: sectionsData } = await supabase
        .from('module_sections')
        .select('*')
        .eq('module_id', moduleData.id)
        .order('order_index');

      setDbSections(sectionsData || []);

      const { data: currentBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', user!.id);

      setPreviousBadgeIds(new Set(currentBadges?.map(b => b.badge_id) || []));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching module:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkForNewBadges = useCallback(async () => {
    if (!user) return;

    try {
      const { data } = await supabase.rpc('check_and_award_badges');
      
      const { data: currentBadges } = await supabase
        .from('user_badges')
        .select('badge_id, badge:badges(id, name, description, icon, category)')
        .eq('user_id', user.id);

      const newBadges = currentBadges?.filter(
        b => !previousBadgeIds.has(b.badge_id)
      );

      if (newBadges && newBadges.length > 0) {
        const firstBadge = newBadges[0].badge as unknown as {
          id: string;
          name: string;
          description: string;
          icon: string;
          category: string;
        };
        
        setEarnedBadge(firstBadge);
        setPreviousBadgeIds(new Set(currentBadges?.map(b => b.badge_id) || []));
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error checking badges:', error);
      }
    }
  }, [user, previousBadgeIds]);

  const handleMarkComplete = async () => {
    if (!module || !user || isCompleted) return;
    
    setMarking(true);
    try {
      const { data, error } = await supabase.rpc('complete_module', {
        p_module_id: module.id
      });

      if (error) throw error;
      
      const result = data as { success: boolean; message?: string; error?: string; points_awarded?: number };
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to complete module');
      }

      setIsCompleted(true);

      trackActivity('module_complete', module.id, {
        module_title: module.title,
        points_awarded: result.points_awarded,
      });
      
      await checkForNewBadges();
      
      toast({
        title: 'Module Completed!',
        description: result.points_awarded 
          ? `Great job! You earned ${result.points_awarded} points.`
          : 'Great job! Keep up the excellent work.',
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error marking complete:', error);
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark module as complete.',
      });
    } finally {
      setMarking(false);
    }
  };

  const handleExerciseComplete = useCallback(() => {
    setExerciseCompleted(true);
    checkForNewBadges();
  }, [checkForNewBadges]);

  const handleQuizComplete = useCallback((score: number, total: number) => {
    setQuizCompleted(true);
    setQuizScore({ score, total });
    checkForNewBadges();
    if (module) {
      trackActivity('quiz_attempt', module.id, {
        score,
        total,
        percentage: Math.round((score / total) * 100),
        perfect: score === total,
        passed: score / total >= 0.7,
      });
    }
  }, [checkForNewBadges, module, trackActivity]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground"><T>Loading module...</T></p>
        </div>
      </div>
    );
  }

  if (!module) {
    return null;
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-success/10 text-success border-success/20';
      case 'intermediate':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'advanced':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const content = module.content;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <BadgeNotification 
        badge={earnedBadge} 
        onClose={() => setEarnedBadge(null)} 
      />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Link 
          to="/modules"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <T>Back to Modules</T>
        </Link>

        <div className="mb-8 animate-fade-in">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className={getDifficultyColor(module.difficulty)}>
                  {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{module.estimated_minutes} min</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2"><T>{module.title}</T></h1>
              <p className="text-muted-foreground text-lg"><T>{module.description}</T></p>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium"><T>Completed</T></span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {content.sections && content.sections.length > 0 && (
            content.sections.map((section, index) => (
              <Card key={index} className="animate-fade-in" style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <T>{section.title}</T>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed"><T>{section.content}</T></p>
                </CardContent>
              </Card>
            ))
          )}

          {content.definition && (
            <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <T>{`What is ${module.title}?`}</T>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed"><T>{content.definition}</T></p>
              </CardContent>
            </Card>
          )}

          {content.methodology && (
            <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-secondary" />
                  <T>How Does It Work?</T>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed"><T>{content.methodology}</T></p>
              </CardContent>
            </Card>
          )}

          {content.example && (
            <Card className="animate-fade-in border-warning/30 bg-warning/5" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <T>Real-World Example</T>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed"><T>{content.example}</T></p>
              </CardContent>
            </Card>
          )}

          {content.prevention && content.prevention.length > 0 && (
            <Card className="animate-fade-in border-success/30 bg-success/5" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-success" />
                  <T>How to Protect Yourself</T>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {content.prevention.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground"><T>{tip}</T></span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {dbSections.filter(s => s.content_type === 'exercise').map((section) => (
          <div key={section.id} className="mt-8 animate-fade-in" style={{ animationDelay: '0.45s' }}>
            {section.content === 'password_checker' && (
              <PasswordStrengthExercise onComplete={handleExerciseComplete} />
            )}
            {section.content === 'phishing_exercise' && (
              <PhishingExercise onComplete={handleExerciseComplete} />
            )}
            {section.content === 'privacy_simulator' && (
              <PrivacySimulatorExercise onComplete={handleExerciseComplete} />
            )}
          </div>
        ))}

        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.47s' }}>
          <ModuleSummary moduleId={module.id} moduleTitle={module.title} />
        </div>

        {content.sections && content.sections.length > 0 && (
          <div className="mt-4">
            {content.sections.map((section, i) => (
              <ExplainConcept
                key={i}
                concept={section.title}
                context={`Module: ${module.title}. Section content: ${section.content.slice(0, 200)}`}
                level={module.difficulty}
              />
            ))}
          </div>
        )}

        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.48s' }}>
          <ExerciseGenerator topic={module.title} difficulty={module.difficulty} />
        </div>

        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.49s' }}>
          <ModuleVideoPlayer videoUrl={module.video_url} moduleTitle={module.title} />
        </div>

        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <ModuleQuiz 
            moduleId={module.id} 
            onQuizComplete={handleQuizComplete}
          />
        </div>

        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.55s' }}>
          <ModulePdfSummary
            moduleTitle={module.title}
            difficulty={module.difficulty}
            pdfSummary={module.pdf_summary as any}
          />
        </div>

        {isCompleted && (
          <div className="mt-8 animate-fade-in">
            <ModuleFeedback moduleId={module.id} moduleTitle={module.title} />
          </div>
        )}

        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.59s' }}>
          <ModuleCertificate moduleTitle={module.title} isCompleted={isCompleted} />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between animate-fade-in" style={{ animationDelay: '0.6s' }}>
          {!isCompleted ? (
            <div className="flex flex-col gap-2">
              {!quizCompleted && (
                <p className="text-sm text-muted-foreground">
                  <T>Complete the quiz above to finish this module</T>
                </p>
              )}
              <Button 
                size="lg" 
                onClick={handleMarkComplete} 
                disabled={marking || !quizCompleted}
                className="bg-success hover:bg-success/90"
              >
                {marking ? <T>Marking...</T> : <T>Mark as Complete</T>}
                <CheckCircle className="ml-2 h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium"><T>You've completed this module!</T></span>
              </div>
              {quizScore && (
                <p className="text-sm text-muted-foreground">
                  Quiz Score: {quizScore.score}/{quizScore.total} ({Math.round((quizScore.score / quizScore.total) * 100)}%)
                </p>
              )}
            </div>
          )}
          
          {nextModule ? (
            <Button size="lg" variant="outline" asChild>
              <Link to={`/modules/${nextModule}`}>
                <T>Next Module</T>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button size="lg" variant="outline" asChild>
              <Link to="/quiz">
                <T>Take the Quiz</T>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>

        {module.related_modules && module.related_modules.length > 0 && (
          <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.65s' }}>
            <RelatedModules
              currentModuleId={module.id}
              relatedModuleIds={module.related_modules}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
