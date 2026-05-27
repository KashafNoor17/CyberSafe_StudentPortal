import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowRight, Clock, Play, CheckCircle, Sparkles } from 'lucide-react';
import { T } from '@/components/T';

interface Module {
  id: string;
  title: string;
  slug: string;
  description: string;
  completed: boolean;
  difficulty?: string;
  estimated_minutes?: number;
}

interface ContinueLearningProps {
  modules: Module[];
  completedCount: number;
}

export function ContinueLearning({ modules, completedCount }: ContinueLearningProps) {
  const nextModule = modules.find(m => !m.completed);
  const allComplete = modules.length > 0 && completedCount === modules.length;

  const getDifficultyColor = (difficulty?: string) => {
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

  if (allComplete) {
    return (
      <Card className="h-full border-success/30 bg-gradient-to-br from-success/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-success" />
            <T>All Modules Complete!</T>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-success">
            <CheckCircle className="h-8 w-8" />
            <div>
              <p className="font-medium"><T>Congratulations!</T></p>
              <p className="text-sm text-muted-foreground"><T>You've completed all available modules.</T></p>
            </div>
          </div>
          <div className="space-y-2">
            <Button variant="outline" asChild className="w-full">
              <Link to="/modules">
                <T>Review Modules</T>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/quiz">
                <T>Take Phishing Quiz</T>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!nextModule) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            <T>Continue Learning</T>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4"><T>Start your cybersecurity journey today!</T></p>
          <Button asChild>
            <Link to="/modules">
              <T>Browse Modules</T>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5 text-primary" />
          <T>Continue Learning</T>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {nextModule.difficulty && (
              <Badge className={getDifficultyColor(nextModule.difficulty)}>
                {nextModule.difficulty.charAt(0).toUpperCase() + nextModule.difficulty.slice(1)}
              </Badge>
            )}
            {nextModule.estimated_minutes && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{nextModule.estimated_minutes} <T>min</T></span>
              </div>
            )}
          </div>
          <h3 className="font-semibold text-lg">{nextModule.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{nextModule.description}</p>
        </div>
        
        <Button asChild className="w-full">
          <Link to={`/modules/${nextModule.slug}`}>
            <Play className="mr-2 h-4 w-4" />
            {completedCount > 0 ? <T>Continue</T> : <T>Start Learning</T>}
          </Link>
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          {modules.length - completedCount} <T>modules remaining</T>
        </p>
      </CardContent>
    </Card>
  );
}
