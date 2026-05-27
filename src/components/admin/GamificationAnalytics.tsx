import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Users, Flame, Target, TrendingUp, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BadgeStat {
  name: string;
  earned_count: number;
}

export function GamificationAnalytics() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeStreaks: 0,
    avgPoints: 0,
    totalBadgesEarned: 0,
    totalBadgesAvailable: 0,
  });
  const [topBadges, setTopBadges] = useState<BadgeStat[]>([]);
  const [leastBadges, setLeastBadges] = useState<BadgeStat[]>([]);
  const [levelDistribution, setLevelDistribution] = useState<{ level: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [
        profilesRes,
        streaksRes,
        badgesEarnedRes,
        badgesTotalRes,
      ] = await Promise.all([
        supabase.from('profiles').select('total_points, level'),
        supabase.from('user_streaks').select('current_streak').gt('current_streak', 0),
        supabase.from('user_badges').select('badge_id, badge:badges(name)'),
        supabase.from('badges').select('id, name'),
      ]);

      const profiles = profilesRes.data || [];
      const streaks = streaksRes.data || [];
      const badgesEarned = badgesEarnedRes.data || [];
      const allBadges = badgesTotalRes.data || [];

      // Level distribution
      const levelMap: Record<string, number> = {};
      let totalPts = 0;
      profiles.forEach((p: any) => {
        const lvl = p.level || 'Cyber Novice';
        levelMap[lvl] = (levelMap[lvl] || 0) + 1;
        totalPts += p.total_points || 0;
      });
      setLevelDistribution(
        Object.entries(levelMap)
          .map(([level, count]) => ({ level, count }))
          .sort((a, b) => b.count - a.count)
      );

      // Badge popularity
      const badgeCountMap: Record<string, number> = {};
      badgesEarned.forEach((b: any) => {
        const name = b.badge?.name || 'Unknown';
        badgeCountMap[name] = (badgeCountMap[name] || 0) + 1;
      });

      const badgeStats = Object.entries(badgeCountMap)
        .map(([name, earned_count]) => ({ name, earned_count }))
        .sort((a, b) => b.earned_count - a.earned_count);

      setTopBadges(badgeStats.slice(0, 5));

      // Least earned - find badges with 0 or fewest earns
      const allBadgeNames = new Set(allBadges.map(b => b.name));
      const leastEarned = Array.from(allBadgeNames)
        .map(name => ({ name, earned_count: badgeCountMap[name] || 0 }))
        .sort((a, b) => a.earned_count - b.earned_count)
        .slice(0, 5);
      setLeastBadges(leastEarned);

      setStats({
        totalUsers: profiles.length,
        activeStreaks: streaks.length,
        avgPoints: profiles.length > 0 ? Math.round(totalPts / profiles.length) : 0,
        totalBadgesEarned: badgesEarned.length,
        totalBadgesAvailable: allBadges.length,
      });
    } catch (e) {
      if (import.meta.env.DEV) console.error('GamificationAnalytics error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers.toLocaleString(), color: 'text-primary' },
    { icon: Flame, label: 'Active Streaks', value: stats.activeStreaks.toLocaleString(), color: 'text-warning' },
    { icon: TrendingUp, label: 'Avg Points', value: stats.avgPoints.toLocaleString(), color: 'text-success' },
    { icon: Award, label: 'Badges Earned', value: `${stats.totalBadgesEarned} / ${stats.totalBadgesAvailable} types`, color: 'text-secondary' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-6 text-center">
              <Icon className={`h-6 w-6 mx-auto mb-2 ${color}`} />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Level Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Level Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {levelDistribution.map(({ level, count }) => {
            const pct = stats.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0;
            return (
              <div key={level} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{level}</span>
                  <span className="text-muted-foreground">{count} users ({Math.round(pct)}%)</span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Most Earned Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-warning" />
              Most Earned Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topBadges.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              <div className="space-y-3">
                {topBadges.map((b, i) => (
                  <div key={b.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground w-5">{i + 1}.</span>
                      <span className="text-sm font-medium">{b.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{b.earned_count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Least Earned Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-muted-foreground" />
              Rarest Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leastBadges.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              <div className="space-y-3">
                {leastBadges.map((b, i) => (
                  <div key={b.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground w-5">{i + 1}.</span>
                      <span className="text-sm font-medium">{b.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{b.earned_count} earned</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
