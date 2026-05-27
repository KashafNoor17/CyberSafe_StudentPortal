import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Fish, Lock, Lightbulb, Award, ArrowRight, Download } from 'lucide-react';
import { T } from '@/components/T';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CyberScoreRing } from '@/components/CyberScoreRing';
import { SkillRadarChart } from '@/components/SkillRadarChart';
import { 
  ContinueLearning, 
  ProgressTracker, 
  RecentAchievements, 
  LearningStats,
} from '@/components/dashboard';
import { CertificateProgress } from '@/components/certificate';
import { StreakCalendar } from '@/components/dashboard/StreakCalendar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Module {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty?: string;
  estimated_minutes?: number;
  completed: boolean;
  quizScore?: { correct: number; total: number } | null;
}

interface QuizResult {
  score: number;
  total_questions: number;
  completed_at: string;
}

interface UserBadge {
  id: string;
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
  };
  earned_at: string;
}

interface ModuleCompletion {
  id: string;
  module_id: string;
  completed_at: string;
  module?: { title: string };
}

interface ActivityItem {
  id: string;
  type: 'module_complete' | 'badge_earned' | 'quiz_score';
  title: string;
  subtitle?: string;
  timestamp: string;
  icon: string;
}

export default function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [moduleCompletions, setModuleCompletions] = useState<ModuleCompletion[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [stats, setStats] = useState({
    totalPoints: 0,
    level: 'Novice',
    cyberScore: 0,
    streak: 7,
    avgQuizScore: 0,
    totalLearningMinutes: 0,
    modulesCompleted: 0,
    totalModules: 0,
    nextBadge: undefined as { name: string; progress: number } | undefined,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch all data in parallel
      const [
        modulesResult,
        completionsResult,
        quizCountsResult,
        userAnswersResult,
        quizResultsData,
        badgesResult,
        profileResult,
        allBadgesResult,
        certificateResult,
      ] = await Promise.all([
        supabase.from('learning_modules').select('id, title, slug, description, difficulty, estimated_minutes').order('order_index'),
        supabase.from('module_completions').select('id, module_id, completed_at').eq('user_id', user!.id),
        supabase.from('module_quizzes').select('module_id'),
        supabase.from('user_quiz_answers').select('module_id, is_correct').eq('user_id', user!.id),
        supabase.from('quiz_results').select('score, total_questions, completed_at').eq('user_id', user!.id).order('completed_at', { ascending: false }),
        supabase.from('user_badges').select('id, earned_at, badge:badges(id, name, description, icon, category)').eq('user_id', user!.id).order('earned_at', { ascending: false }),
        supabase.from('profiles').select('total_points, level, cyber_score').eq('user_id', user!.id).maybeSingle(),
        supabase.from('badges').select('id, name, points_required').order('points_required'),
        supabase.from('certificates').select('id').eq('user_id', user!.id).maybeSingle(),
      ]);

      setHasCertificate(!!certificateResult.data);

      const modulesData = modulesResult.data || [];
      const completions = completionsResult.data || [];
      const quizCounts = quizCountsResult.data || [];
      const userAnswers = userAnswersResult.data || [];
      const quizResults = quizResultsData.data || [];
      const badgesData = badgesResult.data || [];
      const profileData = profileResult.data;
      const allBadges = allBadgesResult.data || [];

      const completedIds = new Set(completions.map(c => c.module_id));
      const modulesCompleted = completions.length;

      // Calculate quiz scores per module
      const questionCountMap: Record<string, number> = {};
      quizCounts.forEach(q => {
        questionCountMap[q.module_id] = (questionCountMap[q.module_id] || 0) + 1;
      });

      const correctCountMap: Record<string, number> = {};
      userAnswers.forEach(a => {
        if (!correctCountMap[a.module_id]) correctCountMap[a.module_id] = 0;
        if (a.is_correct) correctCountMap[a.module_id]++;
      });

      const quizScoresMap: Record<string, { correct: number; total: number }> = {};
      Object.keys(questionCountMap).forEach(moduleId => {
        const total = questionCountMap[moduleId];
        const userAnswerCount = userAnswers.filter(a => a.module_id === moduleId).length;
        if (userAnswerCount === total) {
          quizScoresMap[moduleId] = {
            correct: correctCountMap[moduleId] || 0,
            total
          };
        }
      });

      const processedModules = modulesData.map(m => ({
        ...m,
        completed: completedIds.has(m.id),
        quizScore: quizScoresMap[m.id] || null
      }));

      setModules(processedModules);
      setQuizResults(quizResults);
      setUserBadges(badgesData as unknown as UserBadge[]);
      setModuleCompletions(completions);

      // Calculate average quiz score
      const avgQuizScore = quizResults.length > 0
        ? Math.round(quizResults.reduce((sum, r) => sum + (r.score / r.total_questions) * 100, 0) / quizResults.length)
        : 0;

      // Calculate total learning time
      const totalLearningMinutes = processedModules
        .filter(m => m.completed)
        .reduce((sum, m) => sum + (m.estimated_minutes || 10), 0);

      // Find next badge to earn
      const earnedBadgeIds = new Set(badgesData.map(b => b.badge.id));
      const nextBadgeToEarn = allBadges.find(b => 
        !earnedBadgeIds.has(b.id) && b.points_required !== null
      );

      const currentPoints = profileData?.total_points || 0;
      let nextBadge = undefined;
      if (nextBadgeToEarn && nextBadgeToEarn.points_required) {
        const progress = Math.min(100, Math.round((currentPoints / nextBadgeToEarn.points_required) * 100));
        nextBadge = { name: nextBadgeToEarn.name, progress };
      }

      // Calculate cyber score
      const totalModules = modulesData.length || 1;
      const latestQuiz = quizResults[0];
      const cyberScore = Math.round(
        ((modulesCompleted / totalModules) * 40) +
        ((latestQuiz ? (latestQuiz.score / latestQuiz.total_questions) * 30 : 0)) +
        ((badgesData.length || 0) * 3)
      );

      setStats({
        totalPoints: currentPoints,
        level: profileData?.level || 'Novice',
        cyberScore: Math.min(100, cyberScore),
        streak: 7, // Placeholder — real streak calculation requires user_activity_log aggregation
        avgQuizScore,
        totalLearningMinutes,
        modulesCompleted,
        totalModules,
        nextBadge,
      });

      // Build activity timeline
      const activityItems: ActivityItem[] = [];

      // Add module completions
      completions.forEach(c => {
        const module = modulesData.find(m => m.id === c.module_id);
        if (module) {
          activityItems.push({
            id: `completion-${c.id}`,
            type: 'module_complete',
            title: `Completed ${module.title}`,
            timestamp: c.completed_at,
            icon: '✅',
          });
        }
      });

      // Add badge earnings
      badgesData.forEach(b => {
        activityItems.push({
          id: `badge-${b.id}`,
          type: 'badge_earned',
          title: `Earned "${b.badge.name}"`,
          subtitle: b.badge.description,
          timestamp: b.earned_at,
          icon: b.badge.icon,
        });
      });

      // Add quiz results
      quizResults.forEach((r, i) => {
        activityItems.push({
          id: `quiz-${i}`,
          type: 'quiz_score',
          title: `Scored ${Math.round((r.score / r.total_questions) * 100)}% on quiz`,
          subtitle: `${r.score}/${r.total_questions} correct`,
          timestamp: r.completed_at,
          icon: '🎯',
        });
      });

      // Sort by timestamp, most recent first
      activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(activityItems);

    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportProgress = () => {
    const completedModules = modules.filter(m => m.completed);
    const report = `
CYBERSAFE PROGRESS REPORT
Generated: ${new Date().toLocaleDateString()}
================================

STUDENT: ${profile?.name || 'Student'}
LEVEL: ${stats.level}
TOTAL POINTS: ${stats.totalPoints}

MODULES COMPLETED: ${stats.modulesCompleted}/${stats.totalModules}
${completedModules.map(m => `  ✓ ${m.title}`).join('\n')}

QUIZ PERFORMANCE:
  Average Score: ${stats.avgQuizScore}%
  Quizzes Taken: ${quizResults.length}

BADGES EARNED: ${userBadges.length}
${userBadges.map(b => `  🏆 ${b.badge.name}`).join('\n')}

TOTAL LEARNING TIME: ${stats.totalLearningMinutes} minutes

================================
Keep learning and stay safe online!
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cybersafe-progress-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

      toast({
        title: t('dashboard.reportDownloaded', 'Progress Report Downloaded'),
        description: t('dashboard.reportDownloadedDesc', 'Your progress report has been saved.'),
      });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  const completedCount = modules.filter(m => m.completed).length;
  const latestQuiz = quizResults[0];
  const quizPassed = latestQuiz && (latestQuiz.score / latestQuiz.total_questions) >= 0.7;
  const canGetCertificate = completedCount === modules.length && modules.length > 0 && quizPassed;

  // Prepare skill data for radar chart
  const skillData = [
    { skill: 'Phishing', value: latestQuiz ? (latestQuiz.score / latestQuiz.total_questions) * 100 : 20, fullMark: 100 },
    { skill: 'Passwords', value: modules.some(m => m.slug === 'password-security-basics' && m.completed) ? 80 : 30, fullMark: 100 },
    { skill: 'Privacy', value: modules.some(m => m.slug === 'social-media-safety' && m.completed) ? 75 : 25, fullMark: 100 },
    { skill: 'Malware', value: completedCount > 0 ? 70 : 30, fullMark: 100 },
    { skill: 'Network', value: completedCount > 2 ? 55 : 20, fullMark: 100 },
    { skill: 'Social Eng.', value: completedCount > 1 ? 65 : 25, fullMark: 100 },
  ];

  const quickActions = [
    { icon: BookOpen, title: t('dashboard.quickLearn'), href: '/modules', color: 'bg-primary/10 text-primary' },
    { icon: Fish, title: t('dashboard.quickQuiz'), href: '/quiz', color: 'bg-secondary/10 text-secondary' },
    { icon: Lock, title: t('dashboard.quickPassword'), href: '/password-checker', color: 'bg-accent/10 text-accent' },
    { icon: Lightbulb, title: t('dashboard.quickTips'), href: '/tips', color: 'bg-warning/10 text-warning' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              {t('dashboard.welcomeBack', { name: profile?.name || t('dashboard.student') })}
            </h1>
            <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            {quickActions.map((action) => (
              <Link 
                key={action.title}
                to={action.href}
                className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center hover:scale-105 transition-transform`}
                title={action.title}
              >
                <action.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>

        {/* Main Three-Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <ContinueLearning modules={modules} completedCount={completedCount} />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <ProgressTracker modules={modules} completedCount={completedCount} />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <RecentAchievements badges={userBadges} />
          </div>
        </div>

        {/* Learning Stats */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <LearningStats stats={stats} />
        </div>

        {/* Streak Calendar */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.27s' }}>
          <StreakCalendar />
        </div>

        {/* Cyber Score and Skills */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="card-glow animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  {t('dashboard.cyberScore')}
                </CardTitle>
                <CardDescription>{t('dashboard.cyberScoreDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <CyberScoreRing score={stats.cyberScore} size={180} />
            </CardContent>
          </Card>

          <Card className="card-glow animate-fade-in" style={{ animationDelay: '0.35s' }}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-secondary" />
                  {t('dashboard.skillBreakdown')}
                </CardTitle>
                <CardDescription>{t('dashboard.skillBreakdownDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <SkillRadarChart data={skillData} />
            </CardContent>
          </Card>
        </div>

        {/* Certificate Progress */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.45s' }}>
          <CertificateProgress 
            modulesCompleted={completedCount}
            totalModules={modules.length}
            quizPassed={quizPassed}
            hasCertificate={hasCertificate}
          />
        </div>

        {/* Export Progress */}
        <div className="flex justify-center animate-fade-in" style={{ animationDelay: '0.55s' }}>
          <Button variant="outline" onClick={handleExportProgress}>
            <Download className="mr-2 h-4 w-4" />
            {t('dashboard.downloadReport')}
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
