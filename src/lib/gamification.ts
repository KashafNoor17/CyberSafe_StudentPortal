import { supabase } from '@/integrations/supabase/client';

// Point values for different actions
export const POINT_VALUES = {
  MODULE_COMPLETE: 25,
  QUIZ_PASS: 50,
  QUIZ_PERFECT: 100,
  FIRST_MODULE: 10,
  ALL_MODULES: 100,
  CERTIFICATE_EARNED: 200,
  PASSWORD_CHECK: 5,
  REVIEW_SUBMIT: 10,
} as const;

// Badge definitions matching database
export const BADGE_TRIGGERS = {
  FIRST_STEPS: 'First Steps',
  QUICK_LEARNER: 'Quick Learner', 
  KNOWLEDGE_SEEKER: 'Knowledge Seeker',
  PHISHING_DETECTOR: 'Phishing Detector',
  PHISHING_EXPERT: 'Phishing Expert',
  PASSWORD_MASTER: 'Password Master',
  CYBER_DEFENDER: 'Cyber Defender',
  RISING_STAR: 'Rising Star',
  CYBER_CHAMPION: 'Cyber Champion',
  COMMUNITY_VOICE: 'Community Voice',
} as const;

// Award points to user
export async function awardPoints(
  userId: string, 
  points: number, 
  action: string, 
  description?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('points_log')
      .insert({
        user_id: userId,
        points,
        action,
        description
      });
    
    return !error;
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error('Error awarding points:', e);
    }
    return false;
  }
}

// Award badge to user
export async function awardBadge(userId: string, badgeName: string): Promise<boolean> {
  try {
    // Get badge ID
    const { data: badge } = await supabase
      .from('badges')
      .select('id')
      .eq('name', badgeName)
      .maybeSingle();

    if (!badge) return false;

    // Check if already earned
    const { data: existing } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badge.id)
      .maybeSingle();

    if (existing) return false; // Already has badge

    // Award badge
    const { error } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badge.id
      });

    return !error;
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error('Error awarding badge:', e);
    }
    return false;
  }
}

// Check and award badges based on current state
export async function checkBadgeEligibility(userId: string): Promise<string[]> {
  const earnedBadges: string[] = [];

  try {
    // Get user stats
    const [
      { data: profile },
      { data: moduleCompletions },
      { data: modules },
      { data: quizResults },
      { data: reviews },
      { data: certificate }
    ] = await Promise.all([
      supabase.from('profiles').select('total_points').eq('user_id', userId).maybeSingle(),
      supabase.from('module_completions').select('id').eq('user_id', userId),
      supabase.from('learning_modules').select('id'),
      supabase.from('quiz_results').select('score, total_questions').eq('user_id', userId).order('completed_at', { ascending: false }),
      supabase.from('reviews').select('id').eq('user_id', userId),
      supabase.from('certificates').select('id').eq('user_id', userId).maybeSingle()
    ]);

    const completedModules = moduleCompletions?.length || 0;
    const totalModules = modules?.length || 6;
    const totalPoints = profile?.total_points || 0;
    const bestQuiz = quizResults?.[0];
    const quizPercentage = bestQuiz ? (bestQuiz.score / bestQuiz.total_questions) * 100 : 0;

    // First Steps - First module
    if (completedModules >= 1) {
      if (await awardBadge(userId, BADGE_TRIGGERS.FIRST_STEPS)) {
        earnedBadges.push(BADGE_TRIGGERS.FIRST_STEPS);
      }
    }

    // Quick Learner - 3 modules
    if (completedModules >= 3) {
      if (await awardBadge(userId, BADGE_TRIGGERS.QUICK_LEARNER)) {
        earnedBadges.push(BADGE_TRIGGERS.QUICK_LEARNER);
      }
    }

    // Knowledge Seeker - All modules
    if (completedModules >= totalModules) {
      if (await awardBadge(userId, BADGE_TRIGGERS.KNOWLEDGE_SEEKER)) {
        earnedBadges.push(BADGE_TRIGGERS.KNOWLEDGE_SEEKER);
      }
    }

    // Phishing Detector - 70%+ on quiz
    if (quizPercentage >= 70) {
      if (await awardBadge(userId, BADGE_TRIGGERS.PHISHING_DETECTOR)) {
        earnedBadges.push(BADGE_TRIGGERS.PHISHING_DETECTOR);
      }
    }

    // Phishing Expert - 100% on quiz
    if (quizPercentage >= 100) {
      if (await awardBadge(userId, BADGE_TRIGGERS.PHISHING_EXPERT)) {
        earnedBadges.push(BADGE_TRIGGERS.PHISHING_EXPERT);
      }
    }

    // Rising Star - 100 points
    if (totalPoints >= 100) {
      if (await awardBadge(userId, BADGE_TRIGGERS.RISING_STAR)) {
        earnedBadges.push(BADGE_TRIGGERS.RISING_STAR);
      }
    }

    // Cyber Champion - 500 points
    if (totalPoints >= 500) {
      if (await awardBadge(userId, BADGE_TRIGGERS.CYBER_CHAMPION)) {
        earnedBadges.push(BADGE_TRIGGERS.CYBER_CHAMPION);
      }
    }

    // Community Voice - Submitted review
    if (reviews && reviews.length > 0) {
      if (await awardBadge(userId, BADGE_TRIGGERS.COMMUNITY_VOICE)) {
        earnedBadges.push(BADGE_TRIGGERS.COMMUNITY_VOICE);
      }
    }

    // Cyber Defender - Certificate earned
    if (certificate) {
      if (await awardBadge(userId, BADGE_TRIGGERS.CYBER_DEFENDER)) {
        earnedBadges.push(BADGE_TRIGGERS.CYBER_DEFENDER);
      }
    }

  } catch (e) {
    if (import.meta.env.DEV) {
      console.error('Error checking badge eligibility:', e);
    }
  }

  return earnedBadges;
}

// Calculate cyber score (0-100)
export function calculateCyberScore(stats: {
  modulesCompleted: number;
  totalModules: number;
  quizScore: number;
  totalQuestions: number;
  badgeCount: number;
  totalBadges: number;
}): number {
  const moduleScore = (stats.modulesCompleted / Math.max(stats.totalModules, 1)) * 40;
  const quizScoreVal = (stats.quizScore / Math.max(stats.totalQuestions, 1)) * 40;
  const badgeScore = (stats.badgeCount / Math.max(stats.totalBadges, 1)) * 20;
  
  return Math.round(moduleScore + quizScoreVal + badgeScore);
}

// Get level name based on points (matches DB function)
export function getLevelName(points: number): string {
  if (points >= 5500) return 'Digital Sentinel';
  if (points >= 3500) return 'Cyber Defender';
  if (points >= 2000) return 'Security Specialist';
  if (points >= 1000) return 'Privacy Guardian';
  if (points >= 500) return 'Threat Detector';
  if (points >= 200) return 'Security Apprentice';
  return 'Cyber Novice';
}

// Level emoji indicators
export function getLevelEmoji(level: string): string {
  const map: Record<string, string> = {
    'Cyber Novice': '🟢',
    'Security Apprentice': '🔵',
    'Threat Detector': '🟣',
    'Privacy Guardian': '🟠',
    'Security Specialist': '🔴',
    'Cyber Defender': '🟡',
    'Digital Sentinel': '⚫',
  };
  return map[level] || '🟢';
}

// Get level progress (percentage to next level)
export function getLevelProgress(points: number): { current: string; next: string; progress: number } {
  const levels = [
    { name: 'Cyber Novice', min: 0 },
    { name: 'Security Apprentice', min: 200 },
    { name: 'Threat Detector', min: 500 },
    { name: 'Privacy Guardian', min: 1000 },
    { name: 'Security Specialist', min: 2000 },
    { name: 'Cyber Defender', min: 3500 },
    { name: 'Digital Sentinel', min: 5500 },
  ];

  let currentLevel = levels[0];
  let nextLevel = levels[1];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].min) {
      currentLevel = levels[i];
      nextLevel = levels[i + 1] || levels[i];
      break;
    }
  }

  if (currentLevel.name === 'Digital Sentinel') {
    return { current: 'Digital Sentinel', next: 'Digital Sentinel', progress: 100 };
  }

  const pointsInLevel = points - currentLevel.min;
  const pointsNeeded = nextLevel.min - currentLevel.min;
  const progress = Math.round((pointsInLevel / pointsNeeded) * 100);

  return { current: currentLevel.name, next: nextLevel.name, progress };
}

// Get icon name for badge
export function getBadgeIcon(iconName: string): string {
  return iconName;
}
