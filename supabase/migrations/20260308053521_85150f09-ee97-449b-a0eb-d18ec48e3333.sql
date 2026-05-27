
-- Update level system to 7 tiers
CREATE OR REPLACE FUNCTION public.calculate_user_level(points integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN points >= 5500 THEN 'Digital Sentinel'
    WHEN points >= 3500 THEN 'Cyber Defender'
    WHEN points >= 2000 THEN 'Security Specialist'
    WHEN points >= 1000 THEN 'Privacy Guardian'
    WHEN points >= 500  THEN 'Threat Detector'
    WHEN points >= 200  THEN 'Security Apprentice'
    ELSE 'Cyber Novice'
  END
$$;

-- Streak tracking
CREATE TABLE public.user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  streak_freezes_used integer NOT NULL DEFAULT 0,
  streak_freeze_month integer,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own streak" ON public.user_streaks
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all streaks" ON public.user_streaks
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_streaks_user ON public.user_streaks(user_id);
CREATE INDEX idx_streaks_current ON public.user_streaks(current_streak DESC);

-- Daily/weekly challenges
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  challenge_type text NOT NULL DEFAULT 'daily',
  points_reward integer NOT NULL DEFAULT 50,
  requirement_type text NOT NULL,
  requirement_count integer NOT NULL DEFAULT 1,
  badge_reward text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges" ON public.challenges
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins can manage challenges" ON public.challenges
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- User challenge progress
CREATE TABLE public.user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress integer NOT NULL DEFAULT 0,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  period_start date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id, period_start)
);

ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own challenges" ON public.user_challenges
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all challenge progress" ON public.user_challenges
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_user_challenges_user ON public.user_challenges(user_id);
CREATE INDEX idx_user_challenges_period ON public.user_challenges(period_start);

-- Seed default challenges
INSERT INTO public.challenges (title, description, challenge_type, points_reward, requirement_type, requirement_count) VALUES
  ('Daily Learner', 'Complete at least 15 minutes of learning today', 'daily', 50, 'time_spent', 15),
  ('Quiz Master', 'Score 100% on any quiz today', 'daily', 75, 'perfect_quiz', 1),
  ('Community Helper', 'Reply to a forum post today', 'daily', 40, 'forum_reply', 1),
  ('Exercise Complete', 'Complete one interactive exercise', 'daily', 30, 'exercise_complete', 1),
  ('Module Marathon', 'Complete 3 modules this week', 'weekly', 300, 'modules_complete', 3),
  ('Forum Star', 'Earn 5 upvotes on forum posts this week', 'weekly', 200, 'upvotes_received', 5),
  ('Streak Keeper', 'Maintain a 7-day learning streak', 'weekly', 250, 'streak_days', 7),
  ('Perfect Week', 'Complete all daily challenges every day this week', 'weekly', 500, 'all_dailies', 7);
