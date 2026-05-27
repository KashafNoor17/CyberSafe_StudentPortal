import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, Monitor, Smartphone, Globe, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LiveMetrics {
  activeUsers: number;
  eventsToday: number;
  topPages: { page: string; count: number }[];
  recentEvents: { type: string; user: string; time: string; detail?: string }[];
}

export function LiveDashboard() {
  const [metrics, setMetrics] = useState<LiveMetrics>({
    activeUsers: 0,
    eventsToday: 0,
    topPages: [],
    recentEvents: [],
  });
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    fetchLiveData();
    intervalRef.current = setInterval(fetchLiveData, 15000); // 15s refresh
    return () => clearInterval(intervalRef.current);
  }, []);

  const fetchLiveData = async () => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [
        { data: todayActivity, count: activityCount },
        { data: recentEvents },
        { data: profiles },
      ] = await Promise.all([
        supabase.from('user_activity_log')
          .select('user_id, activity_type', { count: 'exact' })
          .gte('created_at', todayStart.toISOString()),
        supabase.from('user_activity_log')
          .select('user_id, activity_type, metadata, created_at')
          .order('created_at', { ascending: false })
          .limit(20),
        supabase.from('profiles').select('user_id, name'),
      ]);

      const nameMap = new Map(profiles?.map(p => [p.user_id, p.name]) || []);
      const uniqueActiveUsers = new Set(todayActivity?.map(a => a.user_id) || []);

      // Count events by type for "top pages"
      const typeCounts: Record<string, number> = {};
      todayActivity?.forEach(a => {
        typeCounts[a.activity_type] = (typeCounts[a.activity_type] || 0) + 1;
      });
      const topPages = Object.entries(typeCounts)
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      const eventLabels: Record<string, string> = {
        page_view: '👁️ Viewed page',
        module_start: '📖 Started module',
        module_complete: '✅ Completed module',
        quiz_attempt: '🎯 Took quiz',
        certificate_earned: '🏅 Earned certificate',
        badge_earned: '🏆 Earned badge',
        forum_post: '💬 Posted in forum',
        feedback_submit: '📝 Submitted feedback',
      };

      const recent = (recentEvents || []).slice(0, 12).map(e => ({
        type: e.activity_type,
        user: nameMap.get(e.user_id) || 'User',
        time: new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        detail: eventLabels[e.activity_type] || e.activity_type,
      }));

      setMetrics({
        activeUsers: uniqueActiveUsers.size,
        eventsToday: activityCount || 0,
        topPages,
        recentEvents: recent,
      });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users Today</p>
                <p className="text-3xl font-bold text-primary">{metrics.activeUsers}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Live · refreshes every 15s</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Events Today</p>
                <p className="text-3xl font-bold">{metrics.eventsToday}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Event Types</p>
                <p className="text-3xl font-bold">{metrics.topPages.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top event types */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Top Event Types Today</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.topPages.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No events recorded today</p>
          ) : (
            <div className="space-y-2">
              {metrics.topPages.map(p => {
                const maxCount = metrics.topPages[0]?.count || 1;
                return (
                  <div key={p.page} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium truncate">{p.page}</div>
                    <div className="flex-1">
                      <div
                        className="h-6 rounded bg-primary/20 flex items-center px-2"
                        style={{ width: `${Math.max(10, (p.count / maxCount) * 100)}%` }}
                      >
                        <span className="text-xs font-semibold">{p.count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live event stream */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Event Stream
          </CardTitle>
          <CardDescription>Most recent platform activity</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.recentEvents.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Waiting for events...</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto font-mono text-sm">
              {metrics.recentEvents.map((event, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-muted/30 transition-colors">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">[{event.time}]</span>
                  <span className="font-medium text-primary">{event.user}</span>
                  <span className="text-muted-foreground">{event.detail}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
