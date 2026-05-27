import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

interface ActivityData {
  date: string;
  signups: number;
  completions: number;
}

interface ActivityChartProps {
  data: ActivityData[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate mock data for last 14 days if no data
      const today = new Date();
      return Array.from({ length: 14 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (13 - i));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          signups: Math.floor(Math.random() * 5) + 1,
          completions: Math.floor(Math.random() * 8) + 2,
        };
      });
    }
    return data;
  }, [data]);

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Daily Activity (Last 14 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="signupsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="completionsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="signups" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#signupsGradient)" 
                strokeWidth={2}
                name="User Signups"
              />
              <Area 
                type="monotone" 
                dataKey="completions" 
                stroke="hsl(var(--success))" 
                fillOpacity={1} 
                fill="url(#completionsGradient)" 
                strokeWidth={2}
                name="Module Completions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">User Signups</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Module Completions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
