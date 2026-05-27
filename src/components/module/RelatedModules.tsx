import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RelatedModule {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  estimated_minutes: number;
  completed: boolean;
}

interface RelatedModulesProps {
  currentModuleId: string;
  relatedModuleIds: string[];
}

export function RelatedModules({ currentModuleId, relatedModuleIds }: RelatedModulesProps) {
  const { user } = useAuth();
  const [modules, setModules] = useState<RelatedModule[]>([]);

  useEffect(() => {
    if (relatedModuleIds?.length > 0) fetchRelated();
  }, [relatedModuleIds]);

  const fetchRelated = async () => {
    const { data } = await supabase
      .from('learning_modules')
      .select('id, title, slug, difficulty, estimated_minutes')
      .in('id', relatedModuleIds);

    if (!data) return;

    let completedIds = new Set<string>();
    if (user) {
      const { data: completions } = await supabase
        .from('module_completions')
        .select('module_id')
        .eq('user_id', user.id);
      completedIds = new Set(completions?.map((c) => c.module_id) || []);
    }

    setModules(
      data.map((m) => ({
        ...m,
        difficulty: m.difficulty || 'beginner',
        estimated_minutes: m.estimated_minutes || 10,
        completed: completedIds.has(m.id),
      }))
    );
  };

  if (modules.length === 0) return null;

  const getDifficultyColor = (d: string) => {
    if (d === 'beginner') return 'bg-success/10 text-success border-success/20';
    if (d === 'intermediate') return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-destructive/10 text-destructive border-destructive/20';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Continue Your Learning
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">Based on this module, you might like:</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {modules.map((mod) => (
            <Card key={mod.id} className={`hover:shadow-md transition-shadow ${mod.completed ? 'border-success/30' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge className={getDifficultyColor(mod.difficulty)} variant="outline">
                    {mod.difficulty}
                  </Badge>
                  {mod.completed && (
                    <Badge className="bg-success/10 text-success border-success/20" variant="outline">
                      Done
                    </Badge>
                  )}
                </div>
                <h4 className="font-semibold mb-2">{mod.title}</h4>
                <p className="text-xs text-muted-foreground mb-3">{mod.estimated_minutes} min</p>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link to={`/modules/${mod.slug}`}>
                    {mod.completed ? 'Review' : 'Start'}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
