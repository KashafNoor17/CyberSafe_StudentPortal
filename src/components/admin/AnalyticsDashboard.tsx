import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { TrendingUp, Target, Users, Activity, AlertTriangle, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(142 76% 36%)', 'hsl(38 92% 50%)', 'hsl(var(--accent))'];

const SEGMENT_CONFIG: Record<string, { color: string; icon: string }> = {
  active: { color: 'text-green-500', icon: '🟢' },
  new: { color: 'text-purple-500', icon: '🟣' },
  at_risk: { color: 'text-yellow-500', icon: '🟡' },
  churned: { color: 'text-red-500', icon: '🔴' },
};

export function AnalyticsDashboard() {
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalCompletions: 0,
    avgQuizScore: 0,
    certificatesIssued: 0,
    moduleCompletion: [] as { name: string; completions: number }[],
    userLevels: [] as { name: string; value: number }[],
    segments: [] as { name: string; count: number }[],
    recentActivity: [] as { type: string; time: string; user: string }[],
    dailySignups: [] as { date: string; count: number }[],
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [
        { data: profiles },
        { data: modules },
        { data: completions },
        { data: quizResults },
        { data: certificates },
        { data: segments },
      ] = await Promise.all([
        supabase.from('profiles').select('level, created_at, name'),
        supabase.from('learning_modules').select('id, title'),
        supabase.from('module_completions').select('module_id'),
        supabase.from('quiz_results').select('score, total_questions'),
        supabase.from('certificates').select('id'),
        supabase.from('user_segments' as any).select('segment_name'),
      ]);

      const moduleCompletion = modules?.map(m => ({
        name: m.title.replace(/ Security| Awareness/g, ''),
        completions: completions?.filter(c => c.module_id === m.id).length || 0,
      })) || [];

      const levelCounts: Record<string, number> = {};
      profiles?.forEach(p => {
        const lvl = p.level || 'Novice';
        levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
      });
      const userLevels = Object.entries(levelCounts).map(([name, value]) => ({ name, value }));

      const segCounts: Record<string, number> = {};
      (segments as any[])?.forEach((s: any) => {
        segCounts[s.segment_name] = (segCounts[s.segment_name] || 0) + 1;
      });
      const segmentData = Object.entries(segCounts).map(([name, count]) => ({ name, count }));

      const avgScore = quizResults && quizResults.length > 0
        ? Math.round(quizResults.reduce((a, r) => a + (r.score / r.total_questions) * 100, 0) / quizResults.length)
        : 0;

      // Daily signups for last 14 days
      const dailyMap: Record<string, number> = {};
      const now = new Date();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dailyMap[d.toISOString().slice(0, 10)] = 0;
      }
      profiles?.forEach(p => {
        const d = p.created_at.slice(0, 10);
        if (d in dailyMap) dailyMap[d]++;
      });
      const dailySignups = Object.entries(dailyMap).map(([date, count]) => ({
        date: date.slice(5), count,
      }));

      setMetrics({
        totalUsers: profiles?.length || 0,
        totalCompletions: completions?.length || 0,
        avgQuizScore: avgScore,
        certificatesIssued: certificates?.length || 0,
        moduleCompletion,
        userLevels,
        segments: segmentData,
        recentActivity: [],
        dailySignups,
      });
    } catch (e) {
      if (import.meta.env.DEV) console.error('Analytics fetch error:', e);
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
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: metrics.totalUsers, icon: Users, color: 'primary' },
          { label: 'Completions', value: metrics.totalCompletions, icon: Target, color: 'primary' },
          { label: 'Avg Quiz Score', value: `${metrics.avgQuizScore}%`, icon: TrendingUp, color: 'primary' },
          { label: 'Certificates', value: metrics.certificatesIssued, icon: Award, color: 'primary' },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="modules">Module Performance</TabsTrigger>
          <TabsTrigger value="segments">User Segments</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Signups trend */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">New Users (14 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.dailySignups}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* User levels */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">User Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={metrics.userLevels} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                        {metrics.userLevels.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Module Performance Tab */}
        <TabsContent value="modules" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Module Completions</CardTitle>
              <CardDescription>Total completions per learning module</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.moduleCompletion} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="name" type="category" width={120} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="completions" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {['active', 'new', 'at_risk', 'churned'].map(seg => {
              const cfg = SEGMENT_CONFIG[seg];
              const count = metrics.segments.find(s => s.name === seg)?.count || 0;
              const total = metrics.totalUsers || 1;
              return (
                <Card key={seg} className="border-border/50">
                  <CardContent className="pt-6 text-center">
                    <span className="text-2xl">{cfg.icon}</span>
                    <p className="text-2xl font-bold mt-2">{count}</p>
                    <p className="text-sm text-muted-foreground capitalize">{seg.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground">{((count / total) * 100).toFixed(0)}% of users</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {metrics.segments.length === 0 && (
            <Card className="border-border/50">
              <CardContent className="py-8 text-center text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>No segment data yet. Segments are computed as users interact with the platform.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
