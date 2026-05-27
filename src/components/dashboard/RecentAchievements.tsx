import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, ArrowRight, Calendar, ShieldCheck, Trophy, Target, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { T } from '@/components/T';

const ICON_MAP: Record<string, React.ElementType> = {
  'shield-check': ShieldCheck, 'shield': ShieldCheck, 'trophy': Trophy,
  'award': Award, 'check-circle': Award, 'book-open': BookOpen, 'target': Target,
};

const EMOJI_MAP: Record<string, string> = {
  'shield-check': '🛡️', 'shield': '🛡️', 'trophy': '🏆', 'award': '🏅', 'target': '🎯', 'book-open': '📖',
};

interface UserBadge {
  id: string;
  badge: { id: string; name: string; description: string; icon: string; category: string };
  earned_at: string;
}

interface RecentAchievementsProps {
  badges: UserBadge[];
}

function renderBadgeIcon(icon: string) {
  if (/^[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{2300}-\u{23FF}\u{2B50}\u{FE0F}✅❌]/u.test(icon)) {
    return <span className="text-xl">{icon}</span>;
  }
  const LucideIcon = ICON_MAP[icon.toLowerCase()];
  if (LucideIcon) return <LucideIcon className="h-5 w-5 text-warning" />;
  const emoji = EMOJI_MAP[icon.toLowerCase()];
  if (emoji) return <span className="text-xl">{emoji}</span>;
  return <Award className="h-5 w-5 text-warning" />;
}

export function RecentAchievements({ badges }: RecentAchievementsProps) {
  const recentBadges = badges.slice(0, 3);

  if (recentBadges.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-warning" />
            <T>Recent Achievements</T>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Award className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground mb-4"><T>Complete modules and quizzes to earn badges!</T></p>
          <Button variant="outline" asChild>
            <Link to="/badges">
              <T>View All Badges</T>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="h-5 w-5 text-warning" />
          <T>Recent Achievements</T>
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/badges">
            <T>View All</T>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentBadges.map((ub, index) => (
          <motion.div
            key={ub.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
              {renderBadgeIcon(ub.badge.icon)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{ub.badge.name}</p>
              <p className="text-xs text-muted-foreground truncate">{ub.badge.description}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Calendar className="h-3 w-3" />
                <span title={format(new Date(ub.earned_at), 'PPP')}>
                  {formatDistanceToNow(new Date(ub.earned_at), { addSuffix: true })}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="shrink-0 h-7 text-xs px-2" asChild>
              <Link to="/badges"><T>View</T></Link>
            </Button>
          </motion.div>
        ))}

        {badges.length > 3 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            +{badges.length - 3} <T>more badges earned</T>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
