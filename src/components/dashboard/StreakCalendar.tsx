import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Shield, Snowflake, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface StreakCalendarProps {
  compact?: boolean;
}

export function StreakCalendar({ compact = false }: StreakCalendarProps) {
  const { user } = useAuth();
  const [streak, setStreak] = useState({ current: 0, longest: 0, freezesAvailable: 0 });
  const [activeDays, setActiveDays] = useState<Set<string>>(new Set());
  const [freezeDays, setFreezeDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) fetchStreakData();
  }, [user]);

  const fetchStreakData = async () => {
    if (!user) return;

    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('current_streak, longest_streak, freeze_count')
      .eq('user_id', user.id)
      .maybeSingle();

    if (streakData) {
      setStreak({
        current: (streakData as any).current_streak || 0,
        longest: (streakData as any).longest_streak || 0,
        freezesAvailable: (streakData as any).freeze_count || 0,
      });
    }

    // Build a set of active days from activity log (last 35 days)
    const since = new Date();
    since.setDate(since.getDate() - 35);

    const { data: activities } = await supabase
      .from('user_activity_log')
      .select('activity_date')
      .eq('user_id', user.id)
      .gte('activity_date', since.toISOString().slice(0, 10));

    if (activities) {
      setActiveDays(new Set(activities.map((a: any) => a.activity_date)));
    }
  };

  // Generate last 28 days (4 weeks)
  const today = new Date();
  const days: Date[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const isToday = (d: Date) => d.toISOString().slice(0, 10) === today.toISOString().slice(0, 10);
  const isActive = (d: Date) => activeDays.has(d.toISOString().slice(0, 10));
  const isFreezeUsed = (d: Date) => freezeDays.has(d.toISOString().slice(0, 10));

  // Streak milestones
  const milestones = [
    { days: 7, label: 'Week Warrior', points: 100 },
    { days: 30, label: 'Monthly Master', points: 500 },
    { days: 100, label: 'Century Club', points: 2000 },
    { days: 365, label: 'Year of Cyber', points: 10000 },
  ];
  const nextMilestone = milestones.find(m => m.days > streak.current);

  // Check if streak at risk (no activity today)
  const todayStr = today.toISOString().slice(0, 10);
  const streakAtRisk = streak.current > 0 && !activeDays.has(todayStr);

  return (
    <Card className={streakAtRisk ? 'border-warning/50' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Flame className={`h-5 w-5 ${streak.current > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
            {streak.current}-Day Streak
          </CardTitle>
          <div className="flex items-center gap-2">
            {streak.freezesAvailable > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Snowflake className="h-3 w-3" />
                {streak.freezesAvailable} freeze{streak.freezesAvailable !== 1 ? 's' : ''}
              </Badge>
            )}
            <Badge variant="outline">Best: {streak.longest}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Streak at risk warning */}
        {streakAtRisk && (
          <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Your streak is at risk!</p>
              <p className="text-xs text-muted-foreground">Complete any learning activity today to keep it going.</p>
            </div>
          </div>
        )}

        {/* Calendar Grid */}
        {!compact && (
          <div className="mb-4">
            <div className="grid grid-cols-7 gap-1 mb-1">
              {dayNames.map((d, i) => (
                <div key={i} className="text-center text-xs text-muted-foreground font-medium py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {/* Pad first row to align with day of week */}
              {Array.from({ length: (days[0].getDay() + 6) % 7 }).map((_, i) => (
                <div key={`pad-${i}`} className="w-full aspect-square" />
              ))}
              {days.map((day, i) => {
                const active = isActive(day);
                const todayCell = isToday(day);
                const freeze = isFreezeUsed(day);
                return (
                  <div
                    key={i}
                    className={`w-full aspect-square rounded-sm flex items-center justify-center text-xs transition-colors ${
                      active
                        ? 'bg-orange-500 text-white'
                        : freeze
                        ? 'bg-blue-500/20 text-blue-500'
                        : todayCell
                        ? 'border-2 border-primary bg-muted/30'
                        : 'bg-muted/20'
                    }`}
                    title={`${day.toLocaleDateString()} ${active ? '✓ Active' : freeze ? '❄ Freeze used' : ''}`}
                  >
                    {day.getDate()}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-orange-500" /> Active
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-blue-500/20 border border-blue-500/30" /> Freeze
              </div>
            </div>
          </div>
        )}

        {/* Next Milestone */}
        {nextMilestone && (
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Next: {nextMilestone.label}</span>
              <span className="text-xs text-muted-foreground">+{nextMilestone.points} pts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (streak.current / nextMilestone.days) * 100)}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {streak.current}/{nextMilestone.days} days
              </span>
            </div>
          </div>
        )}

        {streakAtRisk && (
          <Button asChild className="w-full mt-3 cyber-gradient" size="sm">
            <Link to="/modules">Learn Now to Save Streak</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
