import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, BookOpen, BarChart, Lightbulb, FileText, MessageSquare,
  Award, TrendingUp, CheckCircle, Clock
} from 'lucide-react';

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    activeToday: number;
    totalModules: number;
    modulesCompleted: number;
    certificatesIssued: number;
    avgQuizScore: number;
    totalTips: number;
    totalBlogs: number;
    pendingReviews: number;
    forumPosts: number;
  };
}

export function AdminStats({ stats }: AdminStatsProps) {
  const statCards = [
    { 
      label: 'Total Users', 
      value: stats.totalUsers, 
      icon: Users, 
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    { 
      label: 'Active Today', 
      value: stats.activeToday, 
      icon: TrendingUp, 
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    { 
      label: 'Modules Completed', 
      value: stats.modulesCompleted, 
      icon: CheckCircle, 
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    { 
      label: 'Certificates', 
      value: stats.certificatesIssued, 
      icon: Award, 
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    { 
      label: 'Avg Quiz Score', 
      value: `${stats.avgQuizScore}%`, 
      icon: BarChart, 
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    { 
      label: 'Pending Reviews', 
      value: stats.pendingReviews, 
      icon: Clock, 
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {statCards.map((stat) => (
        <Card key={stat.label} className="border-border/50 hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
