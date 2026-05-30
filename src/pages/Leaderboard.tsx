import { useEffect, useState } from 'react';
import { Trophy, Medal, Crown, Star, TrendingUp, Flame, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getLevelName, getLevelEmoji } from '@/lib/gamification';
import { T } from '@/components/T';

interface LeaderboardEntry {
  user_id: string;
  name: string;
  total_points: number;
  level: string;
  badge_count: number;
  rank: number;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [friendEntries, setFriendEntries] = useState<LeaderboardEntry[]>([]);
  const [streakEntries, setStreakEntries] = useState<{ user_id: string; name: string; current_streak: number }[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all-time');

  useEffect(() => {
    if (!user) return;

    const fetchUserRank = async () => {
      const { data, error } = await supabase
        .from('leaderboard_view')
        .select('rank')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user rank:', error);
        return;
      }

      setUserRank(data?.rank || null);
    };

    fetchUserRank();
  }, [user]);
  useEffect(() => {
    fetchLeaderboard();
    fetchStreaks();
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      const { data: leaderboardData, error } = await supabase
        .from('leaderboard_view')
        .select('user_id, name, total_points, level, rank');

      if (error) return;

      if (leaderboardData) {
        const userIds = leaderboardData.map(p => p.user_id).filter(Boolean) as string[];
        const { data: badges } = await supabase
          .from('user_badges')
          .select('user_id')
          .in('user_id', userIds);

        const badgeCounts: Record<string, number> = {};
        badges?.forEach(b => { badgeCounts[b.user_id] = (badgeCounts[b.user_id] || 0) + 1; });

        const leaderboard = leaderboardData.map(p => ({
          user_id: p.user_id!,
          name: p.name || 'Anonymous',
          total_points: p.total_points || 0,
          level: p.level || getLevelName(p.total_points || 0),
          badge_count: badgeCounts[p.user_id!] || 0,
          rank: Number(p.rank),
        }));

        setEntries(leaderboard);

        if (user) {
          const ue = leaderboard.find(e => e.user_id === user.id);
          setUserRank(ue?.rank || null);
        }
        if (user) {
          const { data: friendships } = await supabase
            .from('friendships')
            .select('user_id, friend_id')
            .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
            .eq('status', 'accepted');

          if (friendships?.length) {
            const friendIds = new Set(friendships.map(f => f.user_id === user.id ? f.friend_id : f.user_id));
            friendIds.add(user.id);
            setFriendEntries(leaderboard.filter(e => friendIds.has(e.user_id)));
          }
        }
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  const fetchStreaks = async () => {
    try {
      const { data } = await supabase
        .from('user_streaks')
        .select('user_id, current_streak')
        .order('current_streak', { ascending: false })
        .limit(50);

      if (!data?.length) return;

      const userIds = data.map(s => s.user_id);
      const { data: profiles } = await supabase
        .from('profiles_public')
        .select('user_id, name')
        .in('user_id', userIds);

      const nameMap = new Map(profiles?.map(p => [p.user_id, p.name]) || []);
      setStreakEntries(data.map(s => ({
        user_id: s.user_id,
        name: nameMap.get(s.user_id) || 'Anonymous',
        current_streak: s.current_streak,
      })));
    } catch { /* silent */ }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-300" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 via-yellow-400/10 to-transparent border-yellow-500/30';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300/20 via-gray-200/10 to-transparent border-gray-300/30';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-transparent border-amber-600/30';
    return '';
  };

  const getFilteredEntries = () => {
    if (tab === 'friends') return friendEntries;
    return entries;
  };
  const filteredEntries = getFilteredEntries();

  const renderEntries = (list: LeaderboardEntry[]) => (
    <div className="space-y-2">
      {list.map((entry, index) => (
        <div
          key={entry.user_id}
          className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
            entry.user_id === user?.id
              ? 'border-primary/50 bg-primary/5'
              : getRankBg(entry.rank) || 'border-border hover:border-border/80 hover:bg-muted/30'
          }`}
        >
          <div className="w-10 flex items-center justify-center">{getRankIcon(entry.rank)}</div>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold truncate ${entry.user_id === user?.id ? 'text-primary' : ''}`}>
              {entry.name}
              {entry.user_id === user?.id && <span className="text-xs ml-2">(<T>You</T>)</span>}
            </p>
            <p className="text-xs text-muted-foreground">
              {getLevelEmoji(entry.level)} {entry.level}
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-warning" />
            <span>{entry.badge_count}</span>
          </div>
          <div className="text-right min-w-[80px]">
            <p className="font-bold text-primary">{entry.total_points.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground"><T>points</T></p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main id="main-content" className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 animate-fade-in text-center">
          <div className="w-16 h-16 rounded-full cyber-gradient mx-auto flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold font-display mb-4">
            <span className="cyber-gradient-text"><T>Leaderboard</T></span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            <T>Top cyber defenders ranked by points earned through learning and achievements.</T>
          </p>
        </div>

        {user && userRank && (
          <Card className="card-cyber mb-6 border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground"><T>Your Rank</T></p>
                    <p className="text-2xl font-bold">#{userRank}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground"><T>Keep learning to climb the ranks!</T></p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="card-cyber">
          <CardHeader>
            <Tabs value={tab} onValueChange={setTab}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="font-display"><T>Top Cyber Defenders</T></CardTitle>
                <TabsList>
                  <TabsTrigger value="all-time"><T>All Time</T></TabsTrigger>
                  <TabsTrigger value="monthly"><T>This Month</T></TabsTrigger>
                  <TabsTrigger value="weekly"><T>This Week</T></TabsTrigger>
                  {user && <TabsTrigger value="friends"><Users className="h-3 w-3 mr-1" /> <T>Friends</T></TabsTrigger>}
                  <TabsTrigger value="streaks"><Flame className="h-3 w-3 mr-1" /> <T>Streaks</T></TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground"><T>Loading leaderboard...</T></p>
              </div>
            ) : tab === 'streaks' ? (
              streakEntries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8"><T>No active streaks yet.</T></p>
              ) : (
                <div className="space-y-2">
                  {streakEntries.map((entry, index) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                        entry.user_id === user?.id ? 'border-primary/50 bg-primary/5' : 'border-border hover:bg-muted/30'
                      }`}
                    >
                      <div className="w-10 flex items-center justify-center">
                        <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${entry.user_id === user?.id ? 'text-primary' : ''}`}>
                          {entry.name}
                          {entry.user_id === user?.id && <span className="text-xs ml-2">(<T>You</T>)</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <span className="font-bold">{entry.current_streak} <T>days</T></span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : filteredEntries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {tab === 'friends' ? <T>Add friends to see them here!</T> : <T>No entries yet. Be the first to earn points!</T>}
              </p>
            ) : (
              renderEntries(filteredEntries)
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
