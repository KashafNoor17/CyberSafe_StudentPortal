import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, CheckCircle, Circle, ArrowRight, Clock } from 'lucide-react';
import { T } from '@/components/T';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProgressBar } from '@/components/ProgressBar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Module {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  estimated_minutes: number;
  completed: boolean;
}

export default function Modules() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, [user]);

  const fetchModules = async () => {
    try {
      const { data: modulesData } = await supabase
        .from('learning_modules')
        .select('id, title, slug, description, difficulty, estimated_minutes')
        .order('order_index');

      let completedIds = new Set<string>();
      if (user) {
        const { data: completions } = await supabase
          .from('module_completions')
          .select('module_id')
          .eq('user_id', user.id);
        completedIds = new Set(completions?.map(c => c.module_id) || []);
      }
      
      setModules(
        modulesData?.map(m => ({
          ...m,
          difficulty: m.difficulty || 'beginner',
          estimated_minutes: m.estimated_minutes || 10,
          completed: completedIds.has(m.id)
        })) || []
      );
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching modules:', error);
      }
    } finally {
      setLoading(false);
    }
  };

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

  const handleModuleClick = (slug: string) => {
    if (!user) {
      navigate('/auth?mode=login');
      return;
    }
    navigate(`/modules/${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('modules.loading')}</p>
        </div>
      </div>
    );
  }

  const completedCount = modules.filter(m => m.completed).length;

  if (modules.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            <T>Modules Coming Soon</T>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            <T>Our cybersecurity modules are being prepared. Check back shortly or explore our weekly tips in the meantime.</T>
          </p>
          <Link to="/tips" className="mt-8 inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold">
            <T>Browse Weekly Tips</T>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const progress = modules.length > 0 ? (completedCount / modules.length) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('modules.title')}</h1>
              <p className="text-muted-foreground">{t('modules.subtitle')}</p>
            </div>
          </div>
          <ProgressBar value={progress} className="max-w-md" />
        </div>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <Card 
              key={module.id}
              className={`card-glow animate-fade-in ${module.completed ? 'border-success/30' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge className={getDifficultyColor(module.difficulty)}>
                    <T>{module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}</T>
                  </Badge>
                  {module.completed ? (
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                <CardTitle className="text-xl"><T>{module.title}</T></CardTitle>
                <CardDescription><T>{module.description}</T></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock className="h-4 w-4" />
                  <span>{module.estimated_minutes} {t('modules.min')}</span>
                </div>
                <Button className="w-full" onClick={() => handleModuleClick(module.slug)}>
                    {module.completed ? t('modules.reviewModule') : t('modules.startLearning')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
