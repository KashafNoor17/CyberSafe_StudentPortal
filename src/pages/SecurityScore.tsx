import { useState, useEffect, useMemo } from 'react';
import { Shield, Lock, Smartphone, Fish, BookOpen, Settings, TrendingUp, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CyberScoreRing } from '@/components/CyberScoreRing';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { T } from '@/components/T';

interface ScoreCategory {
  key: string;
  label: string;
  icon: React.ReactNode;
  weight: number;
  score: number;
  maxScore: number;
  tips: string[];
  actionLink?: string;
  actionLabel?: string;
}

export default function SecurityScore() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modulesCompleted, setModulesCompleted] = useState(0);
  const [totalModules, setTotalModules] = useState(0);
  const [quizBestScore, setQuizBestScore] = useState(0);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    
    const fetchData = async () => {
      const [modulesRes, completionsRes, quizRes, certRes] = await Promise.all([
        supabase.from('learning_modules').select('id', { count: 'exact', head: true }),
        supabase.from('module_completions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('quiz_results').select('score, total_questions').eq('user_id', user.id).order('completed_at', { ascending: false }).limit(1),
        supabase.from('certificates').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      
      setTotalModules(modulesRes.count || 0);
      setModulesCompleted(completionsRes.count || 0);
      if (quizRes.data?.[0]) {
        const q = quizRes.data[0];
        setQuizBestScore(q.total_questions > 0 ? Math.round((q.score / q.total_questions) * 100) : 0);
      }
      setHasCertificate((certRes.count || 0) > 0);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const categories: ScoreCategory[] = useMemo(() => {
    const modulePercent = totalModules > 0 ? Math.round((modulesCompleted / totalModules) * 100) : 0;
    
    return [
      {
        key: 'password',
        label: 'Password Strength',
        icon: <Lock className="h-5 w-5" />,
        weight: 30,
        score: 65, // Default moderate score — user should check with password checker
        maxScore: 100,
        tips: [
          'Use a unique password for each account',
          'Enable a password manager',
          'Use 16+ character passphrases',
        ],
        actionLink: '/password-checker',
        actionLabel: 'Check Passwords',
      },
      {
        key: 'mfa',
        label: '2FA / MFA Status',
        icon: <Smartphone className="h-5 w-5" />,
        weight: 20,
        score: 40, // Conservative default — can't verify externally
        maxScore: 100,
        tips: [
          'Enable 2FA on email accounts',
          'Use an authenticator app over SMS',
          'Set up backup recovery codes',
        ],
      },
      {
        key: 'phishing',
        label: 'Phishing Awareness',
        icon: <Fish className="h-5 w-5" />,
        weight: 20,
        score: Math.min(100, quizBestScore + 10), // Quiz performance as proxy
        maxScore: 100,
        tips: [
          'Complete the phishing detection quiz',
          'Practice with the AI phishing detector',
          'Learn to spot suspicious URLs',
        ],
        actionLink: '/ai-detector',
        actionLabel: 'Practice Detection',
      },
      {
        key: 'modules',
        label: 'Training Completion',
        icon: <BookOpen className="h-5 w-5" />,
        weight: 15,
        score: modulePercent,
        maxScore: 100,
        tips: [
          `Complete ${totalModules - modulesCompleted} remaining modules`,
          'Review modules you scored low on',
          'Earn your CyberSafe certificate',
        ],
        actionLink: '/modules',
        actionLabel: 'Continue Learning',
      },
      {
        key: 'settings',
        label: 'Security Settings',
        icon: <Settings className="h-5 w-5" />,
        weight: 15,
        score: hasCertificate ? 80 : 50,
        maxScore: 100,
        tips: [
          'Review browser privacy settings',
          'Check social media privacy',
          'Enable automatic software updates',
        ],
      },
    ];
  }, [modulesCompleted, totalModules, quizBestScore, hasCertificate]);

  const overallScore = useMemo(() => {
    return Math.round(
      categories.reduce((sum, cat) => sum + (cat.score / cat.maxScore) * cat.weight, 0)
    );
  }, [categories]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-yellow-500';
    return 'text-destructive';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2"><T>Personal Security Score</T></h1>
          <p className="text-muted-foreground mb-6"><T>Log in to see your security score.</T></p>
          <Link to="/auth?mode=login">
            <Button><T>Log In</T></Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <T>Personal Security Score</T>
          </h1>
          <p className="text-muted-foreground mt-1">
            <T>A comprehensive view of your cybersecurity posture</T>
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Overall Score */}
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <CyberScoreRing score={overallScore} size={180} strokeWidth={14} />
                  <div className="flex-1 space-y-3">
                    <h2 className="text-2xl font-bold"><T>Your Overall Score</T></h2>
                    <p className="text-muted-foreground">
                      {overallScore >= 80
                        ? <T>Excellent! You're well-protected. Keep it up!</T>
                        : overallScore >= 60
                        ? <T>Good progress! A few improvements will strengthen your security.</T>
                        : overallScore >= 40
                        ? <T>Fair. There are several areas where you can improve.</T>
                        : <T>Your security needs attention. Follow the recommendations below.</T>}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Link to="/modules">
                        <Button size="sm" variant="outline">
                          <BookOpen className="h-4 w-4 mr-1" /> <T>Learn More</T>
                        </Button>
                      </Link>
                      <Link to="/breach-alerts">
                        <Button size="sm" variant="outline">
                          <AlertTriangle className="h-4 w-4 mr-1" /> <T>Check Breaches</T>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <Card key={cat.key} className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="text-primary">{cat.icon}</span>
                        <T>{cat.label}</T>
                      </span>
                      <span className={`text-lg font-bold ${getScoreColor(cat.score)}`}>
                        {cat.score}%
                      </span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <T>Weight</T>: {cat.weight}% <T>of overall score</T>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Progress value={cat.score} className="h-2" />
                    <ul className="space-y-1">
                      {cat.tips.map((tip, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          {cat.score >= 70 ? (
                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                          ) : (
                            <ArrowRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                          )}
                          <T>{tip}</T>
                        </li>
                      ))}
                    </ul>
                    {cat.actionLink && (
                      <Link to={cat.actionLink}>
                        <Button variant="ghost" size="sm" className="w-full text-xs mt-1">
                          <T>{cat.actionLabel ?? ''}</T> →
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Score History */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <T>Score History</T>
                </CardTitle>
                <CardDescription className="text-xs">
                  <T>Weekly tracking starts from today — your score will be recorded each week</T>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={(() => {
                      const now = new Date();
                      return Array.from({ length: 8 }, (_, i) => {
                        const d = new Date(now);
                        d.setDate(d.getDate() - (7 - i) * 7);
                        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        if (i < 7) return { week: label, score: null };
                        return { week: label, score: overallScore };
                      });
                    })()} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(value: number | null) => value !== null ? [`${value}%`, 'Score'] : ['—', 'Score']}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        fill="url(#scoreGradient)"
                        strokeWidth={2}
                        dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                        connectNulls={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  <T>Today's score</T>: {overallScore}% — <T>check back weekly to see your progress</T>
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
