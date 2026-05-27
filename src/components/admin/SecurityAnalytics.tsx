import { Shield, AlertTriangle, Lock, Users, TrendingDown, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const BREACH_SOURCES = [
  { name: 'LinkedIn', pct: 45 },
  { name: 'Adobe', pct: 23 },
  { name: 'Twitter', pct: 18 },
  { name: 'Others', pct: 14 },
];

const SCORE_DISTRIBUTION = [
  { label: 'Excellent (90-100)', pct: 18, color: 'text-green-500' },
  { label: 'Good (70-89)', pct: 32, color: 'text-primary' },
  { label: 'Fair (50-69)', pct: 28, color: 'text-yellow-500' },
  { label: 'Poor (30-49)', pct: 15, color: 'text-orange-500' },
  { label: 'Critical (0-29)', pct: 7, color: 'text-destructive' },
];

const MONTHLY_CLICK_RATES = [
  { month: 'Jan', rate: 28 }, { month: 'Feb', rate: 25 }, { month: 'Mar', rate: 22 },
  { month: 'Apr', rate: 20 }, { month: 'May', rate: 18 }, { month: 'Jun', rate: 15 },
  { month: 'Jul', rate: 16 }, { month: 'Aug', rate: 14 }, { month: 'Sep', rate: 13 },
  { month: 'Oct', rate: 12 }, { month: 'Nov', rate: 11 }, { month: 'Dec', rate: 10 },
];

export function SecurityAnalytics() {
  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">12%</p>
            <p className="text-xs text-muted-foreground">Phishing Click Rate</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-primary">45%</p>
            <p className="text-xs text-muted-foreground">2FA Adoption</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-destructive">234</p>
            <p className="text-xs text-muted-foreground">Breached Accounts</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-500">72</p>
            <p className="text-xs text-muted-foreground">Avg Security Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Phishing Click Rate Trend */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-green-500" />
            Phishing Click Rate Trend
          </CardTitle>
          <CardDescription>Monthly click rate on simulated phishing emails</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-32">
            {MONTHLY_CLICK_RATES.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary/20 rounded-t"
                  style={{ height: `${(m.rate / 30) * 100}%` }}
                >
                  <div
                    className="w-full bg-primary rounded-t transition-all"
                    style={{ height: `${(m.rate / 30) * 100}%` }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground">{m.month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Breach Sources */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Top Breach Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {BREACH_SOURCES.map(s => (
              <div key={s.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{s.name}</span>
                  <span className="text-muted-foreground">{s.pct}%</span>
                </div>
                <Progress value={s.pct} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security Score Distribution */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SCORE_DISTRIBUTION.map(d => (
              <div key={d.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{d.label}</span>
                  <span className={`font-semibold ${d.color}`}>{d.pct}%</span>
                </div>
                <Progress value={d.pct} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Awareness Campaign Impact */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Awareness Campaign Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg border border-border/50">
              <p className="text-2xl font-bold text-green-500">-58%</p>
              <p className="text-xs text-muted-foreground">Click rate reduction (YoY)</p>
            </div>
            <div className="p-3 rounded-lg border border-border/50">
              <p className="text-2xl font-bold text-primary">+120%</p>
              <p className="text-xs text-muted-foreground">Report rate increase</p>
            </div>
            <div className="p-3 rounded-lg border border-border/50">
              <p className="text-2xl font-bold text-green-500">+15</p>
              <p className="text-xs text-muted-foreground">Avg score improvement</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
