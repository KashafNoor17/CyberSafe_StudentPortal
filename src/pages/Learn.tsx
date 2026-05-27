import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, Clock, BarChart3, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { T } from '@/components/T';

interface Module {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  estimated_minutes: number;
  completed: boolean;
}

export default function Learn() {
  const { user } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

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

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          module.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || module.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground"><T>Loading modules...</T></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <T>Back to Home</T>
            </Link>
          </Button>

          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <BookOpen className="h-4 w-4" />
              <span><T>Learning Modules</T></span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="cyber-gradient-text"><T>Master Cybersecurity</T></span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              <T>Interactive modules designed to teach you essential security skills.</T>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant={difficultyFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setDifficultyFilter('all')}>
                <T>All</T>
              </Button>
              <Button variant={difficultyFilter === 'beginner' ? 'default' : 'outline'} size="sm" onClick={() => setDifficultyFilter('beginner')} className={difficultyFilter === 'beginner' ? '' : 'text-success'}>
                <T>Beginner</T>
              </Button>
              <Button variant={difficultyFilter === 'intermediate' ? 'default' : 'outline'} size="sm" onClick={() => setDifficultyFilter('intermediate')} className={difficultyFilter === 'intermediate' ? '' : 'text-warning'}>
                <T>Intermediate</T>
              </Button>
              <Button variant={difficultyFilter === 'advanced' ? 'default' : 'outline'} size="sm" onClick={() => setDifficultyFilter('advanced')} className={difficultyFilter === 'advanced' ? '' : 'text-destructive'}>
                <T>Advanced</T>
              </Button>
            </div>
          </div>

          {filteredModules.length === 0 ? (
            <Card className="card-glow animate-fade-in">
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2"><T>No Modules Found</T></h3>
                <p className="text-muted-foreground">
                  {searchQuery || difficultyFilter !== 'all' 
                    ? <T>Try adjusting your search or filters.</T>
                    : <T>Modules are coming soon! Check back later.</T>}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModules.map((module, index) => (
                <Card 
                  key={module.id}
                  className={`card-glow animate-fade-in hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                    module.completed ? 'border-success/30' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge className={getDifficultyColor(module.difficulty)}>
                        {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
                      </Badge>
                      {module.completed && (
                        <Badge className="bg-success/10 text-success border-success/20">
                          <T>Completed</T>
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{module.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{module.estimated_minutes} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-4 w-4" />
                        <span>{module.difficulty}</span>
                      </div>
                    </div>
                    <Button asChild className="w-full">
                      <Link to={user ? `/modules/${module.slug}` : '/auth?mode=login'}>
                        {module.completed ? <T>Review Module</T> : <T>Start Learning</T>}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!user && filteredModules.length > 0 && (
            <Card className="mt-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 animate-fade-in">
              <CardContent className="py-8 text-center">
                <h3 className="text-xl font-semibold mb-2"><T>Ready to Start Learning?</T></h3>
                <p className="text-muted-foreground mb-4">
                  <T>Sign up for free to track your progress and earn certificates.</T>
                </p>
                <Button asChild size="lg">
                  <Link to="/auth?mode=signup"><T>Get Started Free</T></Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
