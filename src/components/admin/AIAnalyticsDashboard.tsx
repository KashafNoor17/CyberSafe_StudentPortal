import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Bot, Zap, DollarSign, ThumbsUp, Database, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(142 76% 36%)', 'hsl(38 92% 50%)', 'hsl(var(--accent))', 'hsl(280 70% 50%)'];

export function AIAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalInteractions: 0,
    totalTokens: 0,
    avgLatency: 0,
    cacheHitRate: 0,
    avgRating: 0,
    feedbackCount: 0,
    positiveRate: 0,
    byType: [] as { name: string; value: number }[],
    byModel: [] as { name: string; value: number }[],
    recentInteractions: [] as { type: string; latency: number; model: string; created_at: string }[],
    dailyUsage: [] as { date: string; count: number }[],
  });

  useEffect(() => { fetchMetrics(); }, []);

  const fetchMetrics = async () => {
    try {
      const [interactionsRes, feedbackRes, cacheRes] = await Promise.all([
        supabase.from('ai_interactions').select('interaction_type, tokens_used, latency_ms, model_version, created_at').order('created_at', { ascending: false }).limit(1000),
        supabase.from('ai_feedback').select('helpful, user_rating, created_at').order('created_at', { ascending: false }).limit(500),
        supabase.from('ai_content_cache').select('access_count, created_at').limit(500),
      ]);

      const interactions = interactionsRes.data || [];
      const feedback = feedbackRes.data || [];
      const cache = cacheRes.data || [];

      // Totals
      const totalInteractions = interactions.length;
      const totalTokens = interactions.reduce((s, i) => s + (i.tokens_used || 0), 0);
      const avgLatency = totalInteractions > 0
        ? Math.round(interactions.reduce((s, i) => s + (i.latency_ms || 0), 0) / totalInteractions)
        : 0;

      // Cache stats
      const totalCacheAccess = cache.reduce((s, c) => s + (c.access_count || 0), 0);
      const cacheHitRate = totalCacheAccess > 0 && totalInteractions > 0
        ? Math.round((totalCacheAccess / (totalCacheAccess + totalInteractions)) * 100)
        : 0;

      // Feedback
      const feedbackCount = feedback.length;
      const positiveCount = feedback.filter(f => f.helpful === true).length;
      const positiveRate = feedbackCount > 0 ? Math.round((positiveCount / feedbackCount) * 100) : 0;
      const avgRating = feedbackCount > 0
        ? Math.round((feedback.reduce((s, f) => s + (f.user_rating || 0), 0) / feedbackCount) * 10) / 10
        : 0;

      // By type
      const typeCounts: Record<string, number> = {};
      interactions.forEach(i => { typeCounts[i.interaction_type] = (typeCounts[i.interaction_type] || 0) + 1; });
      const byType = Object.entries(typeCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

      // By model
      const modelCounts: Record<string, number> = {};
      interactions.forEach(i => { modelCounts[i.model_version || 'unknown'] = (modelCounts[i.model_version || 'unknown'] || 0) + 1; });
      const byModel = Object.entries(modelCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

      // Daily usage (last 14 days)
      const dailyMap: Record<string, number> = {};
      interactions.forEach(i => {
        const day = i.created_at.slice(0, 10);
        dailyMap[day] = (dailyMap[day] || 0) + 1;
      });
      const dailyUsage = Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-14)
        .map(([date, count]) => ({ date: date.slice(5), count }));

      setMetrics({
        totalInteractions,
        totalTokens,
        avgLatency,
        cacheHitRate,
        avgRating,
        feedbackCount,
        positiveRate,
        byType,
        byModel,
        recentInteractions: interactions.slice(0, 10).map(i => ({
          type: i.interaction_type,
          latency: i.latency_ms,
          model: i.model_version,
          created_at: i.created_at,
        })),
        dailyUsage,
      });
    } catch (e) {
      console.error('AI analytics error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading AI analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Calls', value: metrics.totalInteractions.toLocaleString(), icon: Bot, color: 'text-primary' },
          { label: 'Tokens Used', value: metrics.totalTokens > 1000 ? `${(metrics.totalTokens / 1000).toFixed(1)}K` : metrics.totalTokens.toString(), icon: Zap, color: 'text-yellow-500' },
          { label: 'Avg Latency', value: `${metrics.avgLatency}ms`, icon: TrendingUp, color: 'text-blue-500' },
          { label: 'Cache Hit', value: `${metrics.cacheHitRate}%`, icon: Database, color: 'text-green-500' },
          { label: 'Avg Rating', value: `${metrics.avgRating}/5`, icon: ThumbsUp, color: 'text-purple-500' },
          { label: 'Positive %', value: `${metrics.positiveRate}%`, icon: ThumbsUp, color: 'text-emerald-500' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Usage Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Daily AI Usage</CardTitle>
            <CardDescription>API calls per day (last 14 days)</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.dailyUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={metrics.dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">No usage data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Usage by Feature */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Usage by Feature</CardTitle>
            <CardDescription>Distribution of AI interaction types</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.byType.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={metrics.byType} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={false}>
                      {metrics.byType.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 text-xs">
                  {metrics.byType.slice(0, 6).map((t, i) => (
                    <div key={t.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground">{t.name}</span>
                      <span className="font-medium ml-auto">{t.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Models & Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Model Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.byModel.map((m) => {
                const pct = metrics.totalInteractions > 0 ? Math.round((m.value / metrics.totalInteractions) * 100) : 0;
                return (
                  <div key={m.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate max-w-[200px]">{m.name}</span>
                      <span className="font-medium">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {metrics.byModel.length === 0 && <p className="text-muted-foreground text-sm">No data</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent AI Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {metrics.recentInteractions.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-xs border-b border-border/50 pb-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] px-1.5">{r.type}</Badge>
                    <span className="text-muted-foreground">{r.model}</span>
                  </div>
                  <span className="text-muted-foreground">{r.latency}ms</span>
                </div>
              ))}
              {metrics.recentInteractions.length === 0 && <p className="text-muted-foreground text-sm">No interactions yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">User Satisfaction</CardTitle>
          <CardDescription>{metrics.feedbackCount} feedback responses collected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{metrics.avgRating}</p>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{metrics.positiveRate}%</p>
              <p className="text-xs text-muted-foreground">Found Helpful</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{metrics.feedbackCount}</p>
              <p className="text-xs text-muted-foreground">Total Feedback</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
