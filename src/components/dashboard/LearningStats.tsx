import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, Flame, BarChart3, Clock, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { T } from '@/components/T';

interface GamificationStats {
  totalPoints: number;
  level: string;
  streak: number;
  avgQuizScore: number;
  totalLearningMinutes: number;
  modulesCompleted: number;
  totalModules: number;
  nextBadge?: { name: string; progress: number };
}

interface LearningStatsProps {
  stats: GamificationStats;
}

export function LearningStats({ stats }: LearningStatsProps) {
  const statItems = [
    { icon: Trophy, label: 'Total Points', value: stats.totalPoints.toLocaleString(), color: 'text-primary', bgColor: 'bg-primary/10' },
    { icon: Star, label: 'Current Level', value: stats.level, color: 'text-secondary', bgColor: 'bg-secondary/10' },
    { icon: Flame, label: 'Day Streak', value: `${stats.streak} days`, color: 'text-warning', bgColor: 'bg-warning/10' },
    { icon: BarChart3, label: 'Avg Quiz Score', value: `${stats.avgQuizScore}%`, color: 'text-success', bgColor: 'bg-success/10' },
    { icon: Clock, label: 'Learning Time', value: stats.totalLearningMinutes > 60 ? `${Math.floor(stats.totalLearningMinutes / 60)}h ${stats.totalLearningMinutes % 60}m` : `${stats.totalLearningMinutes}m`, color: 'text-accent', bgColor: 'bg-accent/10' },
    { icon: Target, label: 'Modules Done', value: `${stats.modulesCompleted}/${stats.totalModules}`, color: 'text-primary', bgColor: 'bg-primary/10' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          <T>Learning Stats</T>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center mb-2`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-muted-foreground text-center"><T>{item.label}</T></p>
            </motion.div>
          ))}
        </div>

        {stats.nextBadge && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 p-3 rounded-lg bg-warning/5 border border-warning/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium"><T>Next Badge</T>: {stats.nextBadge.name}</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-warning rounded-full transition-all" style={{ width: `${stats.nextBadge.progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.nextBadge.progress}% <T>complete</T>
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
