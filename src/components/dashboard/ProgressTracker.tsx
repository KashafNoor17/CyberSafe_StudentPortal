import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { T } from '@/components/T';

interface Module {
  id: string;
  title: string;
  slug: string;
  completed: boolean;
  quizScore?: { correct: number; total: number } | null;
}

interface ProgressTrackerProps {
  modules: Module[];
  completedCount: number;
}

export function ProgressTracker({ modules, completedCount }: ProgressTrackerProps) {
  const totalModules = modules.length;
  const progress = totalModules > 0 ? (completedCount / totalModules) * 100 : 0;

  const getModuleStatus = (module: Module) => {
    if (module.completed) return 'completed';
    if (module.quizScore) return 'in_progress';
    return 'not_started';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'in_progress': return 'bg-primary';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-primary" />;
      default: return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          <T>Your Progress</T>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
              <motion.circle
                cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                className="text-primary"
                strokeDasharray={`${progress * 2.51} 251`}
                initial={{ strokeDasharray: "0 251" }}
                animate={{ strokeDasharray: `${progress * 2.51} 251` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{Math.round(progress)}%</span>
              <span className="text-xs text-muted-foreground"><T>Complete</T></span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {modules.slice(0, 5).map((module, index) => {
            const status = getModuleStatus(module);
            const quizProgress = module.quizScore
              ? (module.quizScore.correct / module.quizScore.total) * 100
              : (status === 'completed' ? 100 : 0);

            return (
              <Link key={module.id} to={`/modules/${module.slug}`} className="block group">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span className="text-sm font-medium group-hover:text-primary transition-colors truncate max-w-[180px]">
                        {module.title}
                      </span>
                    </div>
                    {module.quizScore && (
                      <span className="text-xs text-muted-foreground">
                        {module.quizScore.correct}/{module.quizScore.total}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Progress value={status === 'completed' ? 100 : quizProgress} className="h-2" />
                    <div
                      className={`absolute left-0 top-0 h-2 rounded-full transition-all ${getStatusColor(status)}`}
                      style={{ width: `${status === 'completed' ? 100 : quizProgress}%` }}
                    />
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {modules.length > 5 && (
          <p className="text-xs text-muted-foreground text-center">
            +{modules.length - 5} <T>more modules</T>
          </p>
        )}

        <div className="flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground"><T>Completed</T></span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground"><T>In Progress</T></span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span className="text-muted-foreground"><T>Not Started</T></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
