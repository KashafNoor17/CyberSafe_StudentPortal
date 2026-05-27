import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type ActivityType = 'page_view' | 'module_start' | 'module_complete' | 'quiz_attempt' | 'certificate_earned' | 'badge_earned' | 'forum_post' | 'feedback_submit';

export function useActivityTracker() {
  const trackActivity = useCallback(async (
    activityType: ActivityType,
    moduleId?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_activity_log').insert([{
        user_id: user.id,
        activity_type: activityType,
        module_id: moduleId || null,
        metadata: metadata || {},
      }]);
    } catch {
      // Silent fail — analytics should never block UX
    }
  }, []);

  return { trackActivity };
}
