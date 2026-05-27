import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock as LockIcon } from 'lucide-react';
import { 
  Trophy, Zap, BookOpen, ShieldCheck, Award, Lock, Medal, 
  Star, Crown, MessageCircle, LucideIcon 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { T } from '@/components/T';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points_required: number | null;
  earned_at?: string;
}

const iconMap: Record<string, LucideIcon> = {
  'trophy': Trophy,
  'zap': Zap,
  'book-open': BookOpen,
  'shield-check': ShieldCheck,
  'award': Award,
  'lock': Lock,
  'medal': Medal,
  'star': Star,
  'crown': Crown,
  'message-circle': MessageCircle,
};

const categoryColors: Record<string, string> = {
  learning: 'from-primary to-primary/70',
  quiz: 'from-secondary to-secondary/70',
  tools: 'from-accent to-accent/70',
  achievement: 'from-warning to-warning/70',
  milestone: 'from-success to-success/70',
  community: 'from-pink-500 to-pink-500/70',
};

const categoryLabels: Record<string, string> = {
  learning: 'Learning',
  quiz: 'Quiz Mastery',
  tools: 'Tools',
  achievement: 'Achievements',
  milestone: 'Milestones',
  community: 'Community',
};

export default function Badges() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<Set<string>>(new Set());
  const [earnedDates, setEarnedDates] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchBadges();
    }
  }, [user, authLoading, navigate]);

  const fetchBadges = async () => {
    try {
      const { data: badges, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .order('category', { ascending: true });

      if (badgesError) throw badgesError;

      const { data: userBadges, error: userBadgesError } = await supabase
        .from('user_badges')
        .select('badge_id, earned_at')
        .eq('user_id', user!.id);

      if (userBadgesError) throw userBadgesError;

      setAllBadges(badges || []);
      
      const earnedIds = new Set(userBadges?.map(ub => ub.badge_id) || []);
      setEarnedBadgeIds(earnedIds);
      
      const dates: Record<string, string> = {};
      userBadges?.forEach(ub => {
        dates[ub.badge_id] = ub.earned_at;
      });
      setEarnedDates(dates);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const earnedCount = earnedBadgeIds.size;
  const totalCount = allBadges.length;
  const progressPercent = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  const badgesByCategory = allBadges.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <T>Back to Dashboard</T>
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2"><T>Your Achievements</T></h1>
          <p className="text-muted-foreground">
            <T>Complete modules, quizzes, and activities to earn badges</T>
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground"><T>Badge Progress</T></h3>
                  <p className="text-sm text-muted-foreground">
                    {earnedCount} / {totalCount} <T>badges earned</T>
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-primary">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </CardContent>
        </Card>

        {Object.entries(badgesByCategory).map(([category, badges]) => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              {categoryLabels[category] || category}
              <span className="text-sm font-normal text-muted-foreground">
                ({badges.filter(b => earnedBadgeIds.has(b.id)).length}/{badges.length})
              </span>
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {badges.map((badge) => {
                const isEarned = earnedBadgeIds.has(badge.id);
                const Icon = iconMap[badge.icon] || Trophy;
                const colorClass = categoryColors[badge.category] || categoryColors.achievement;
                const earnedDate = earnedDates[badge.id];

                return (
                  <Tooltip key={badge.id}>
                    <TooltipTrigger asChild>
                      <Card 
                        className={`relative overflow-hidden transition-all duration-300 cursor-pointer ${
                          isEarned 
                            ? 'hover:shadow-lg hover:-translate-y-1' 
                            : 'opacity-50 grayscale'
                        }`}
                      >
                        {!isEarned && (
                          <div className="absolute inset-0 bg-background/60 z-10 flex items-center justify-center">
                            <div className="bg-muted rounded-full p-2">
                              <LockIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                        )}
                        <CardContent className="pt-6 pb-4 text-center">
                          <div 
                            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                              isEarned 
                                ? `bg-gradient-to-br ${colorClass} shadow-lg badge-glow` 
                                : 'bg-muted'
                            }`}
                          >
                            <Icon className={`h-8 w-8 ${isEarned ? 'text-white' : 'text-muted-foreground'}`} />
                          </div>
                          <h3 className="font-semibold text-foreground text-sm mb-1">{badge.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">{badge.description}</p>
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px]">
                      <p className="font-semibold">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                      {isEarned && earnedDate && (
                        <p className="text-xs text-success mt-1">
                          <T>Earned</T> {new Date(earnedDate).toLocaleDateString()}
                        </p>
                      )}
                      {!isEarned && (
                        <p className="text-xs text-warning mt-1"><T>Not yet earned</T></p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        ))}
      </main>

      <Footer />
    </div>
  );
}
