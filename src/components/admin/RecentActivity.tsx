import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, BookOpen, Award, MessageSquare, Star, Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'signup' | 'completion' | 'certificate' | 'forum_post' | 'review';
  message: string;
  timestamp: string;
  user?: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const activityIcons = {
  signup: { icon: UserPlus, color: 'text-primary', bg: 'bg-primary/10' },
  completion: { icon: BookOpen, color: 'text-success', bg: 'bg-success/10' },
  certificate: { icon: Award, color: 'text-warning', bg: 'bg-warning/10' },
  forum_post: { icon: MessageSquare, color: 'text-secondary', bg: 'bg-secondary/10' },
  review: { icon: Star, color: 'text-accent', bg: 'bg-accent/10' },
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <Badge variant="secondary" className="font-normal">
          <Clock className="h-3 w-3 mr-1" />
          Live
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[300px] overflow-y-auto">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No recent activity</p>
          ) : (
            activities.map((activity) => {
              const config = activityIcons[activity.type];
              const IconComponent = config.icon;
              
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
                    <IconComponent className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
