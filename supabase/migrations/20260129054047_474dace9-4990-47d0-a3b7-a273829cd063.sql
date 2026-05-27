-- ==============================================
-- CYBERSAFE STUDENT PORTAL - ENHANCEMENT SCHEMA
-- ==============================================

-- 1. GAMIFICATION: User Points & Levels
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS level text DEFAULT 'Beginner',
ADD COLUMN IF NOT EXISTS cyber_score integer DEFAULT 0;

-- 2. BADGES TABLE
CREATE TABLE public.badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text NOT NULL,
    icon text NOT NULL,
    points_required integer DEFAULT 0,
    category text NOT NULL DEFAULT 'achievement',
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges"
ON public.badges FOR SELECT
USING (true);

CREATE POLICY "Admins can manage badges"
ON public.badges FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- 3. USER BADGES (earned badges)
CREATE TABLE public.user_badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges"
ON public.user_badges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can earn badges"
ON public.user_badges FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all user badges"
ON public.user_badges FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- 4. BLOG POSTS
CREATE TABLE public.blog_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    content text NOT NULL,
    excerpt text,
    category text NOT NULL DEFAULT 'general',
    tags text[] DEFAULT '{}',
    author_id uuid NOT NULL REFERENCES auth.users(id),
    featured_image text,
    is_published boolean DEFAULT false,
    views integer DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blogs"
ON public.blog_posts FOR SELECT
USING (is_published = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage blogs"
ON public.blog_posts FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- 5. REVIEWS
CREATE TABLE public.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text text NOT NULL,
    is_approved boolean DEFAULT false,
    is_hidden boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews"
ON public.reviews FOR SELECT
USING (is_approved = true AND is_hidden = false);

CREATE POLICY "Users can submit reviews"
ON public.reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reviews"
ON public.reviews FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews"
ON public.reviews FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- 6. QUIZ REQUESTS (student-initiated)
CREATE TABLE public.quiz_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    suggested_questions jsonb DEFAULT '[]',
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    reviewed_at timestamptz
);

ALTER TABLE public.quiz_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own requests"
ON public.quiz_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests"
ON public.quiz_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all requests"
ON public.quiz_requests FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- 7. FAVORITE TIPS
CREATE TABLE public.favorite_tips (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tip_id uuid NOT NULL REFERENCES public.weekly_tips(id) ON DELETE CASCADE,
    saved_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id, tip_id)
);

ALTER TABLE public.favorite_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their favorite tips"
ON public.favorite_tips FOR ALL
USING (auth.uid() = user_id);

-- 8. ENHANCE WEEKLY TIPS with categories and risk levels
ALTER TABLE public.weekly_tips 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'general',
ADD COLUMN IF NOT EXISTS risk_level text DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS is_banner boolean DEFAULT false;

-- 9. ENHANCE QUIZ QUESTIONS with difficulty
ALTER TABLE public.quiz_questions 
ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS time_limit integer DEFAULT 30;

-- 10. ENHANCE CERTIFICATES with verification
ALTER TABLE public.certificates 
ADD COLUMN IF NOT EXISTS verification_id text UNIQUE,
ADD COLUMN IF NOT EXISTS qr_code_data text,
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT true;

-- 11. MINI QUIZ RESULTS (per module)
CREATE TABLE public.mini_quiz_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id uuid NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    score integer NOT NULL,
    total_questions integer NOT NULL,
    completed_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id, module_id)
);

ALTER TABLE public.mini_quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mini quiz results"
ON public.mini_quiz_results FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mini quiz results"
ON public.mini_quiz_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mini quiz results"
ON public.mini_quiz_results FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all mini quiz results"
ON public.mini_quiz_results FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- 12. LEARNING MODULES enhancements
ALTER TABLE public.learning_modules 
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS infographic_url text,
ADD COLUMN IF NOT EXISTS case_study text,
ADD COLUMN IF NOT EXISTS mini_quiz jsonb DEFAULT '[]';

-- 13. POINTS LOG (for gamification tracking)
CREATE TABLE public.points_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    points integer NOT NULL,
    action text NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.points_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points log"
ON public.points_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can log points"
ON public.points_log FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all points"
ON public.points_log FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- 14. SEED BADGES
INSERT INTO public.badges (name, description, icon, points_required, category) VALUES
('First Steps', 'Complete your first learning module', 'trophy', 0, 'learning'),
('Quick Learner', 'Complete 3 learning modules', 'zap', 50, 'learning'),
('Knowledge Seeker', 'Complete all learning modules', 'book-open', 200, 'learning'),
('Phishing Detector', 'Score 70% or higher on the phishing quiz', 'shield-check', 100, 'quiz'),
('Phishing Expert', 'Score 100% on the phishing quiz', 'award', 300, 'quiz'),
('Password Master', 'Test 5 passwords with strength checker', 'lock', 25, 'tools'),
('Cyber Defender', 'Earn your certificate of completion', 'medal', 500, 'achievement'),
('Rising Star', 'Reach 100 total points', 'star', 100, 'milestone'),
('Cyber Champion', 'Reach 500 total points', 'crown', 500, 'milestone'),
('Community Voice', 'Submit a review for the platform', 'message-circle', 10, 'community')
ON CONFLICT (name) DO NOTHING;

-- 15. Function to calculate user level based on points
CREATE OR REPLACE FUNCTION public.calculate_user_level(points integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN points >= 1000 THEN 'Expert'
    WHEN points >= 500 THEN 'Advanced'
    WHEN points >= 200 THEN 'Intermediate'
    WHEN points >= 50 THEN 'Beginner'
    ELSE 'Novice'
  END
$$;

-- 16. Function to update user points and level
CREATE OR REPLACE FUNCTION public.update_user_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    total_points = total_points + NEW.points,
    level = calculate_user_level(total_points + NEW.points)
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- 17. Trigger to auto-update points
DROP TRIGGER IF EXISTS on_points_log_insert ON public.points_log;
CREATE TRIGGER on_points_log_insert
AFTER INSERT ON public.points_log
FOR EACH ROW
EXECUTE FUNCTION public.update_user_points();

-- 18. Function to generate certificate verification ID
CREATE OR REPLACE FUNCTION public.generate_verification_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.verification_id IS NULL THEN
    NEW.verification_id := 'CYBER-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_certificate_insert ON public.certificates;
CREATE TRIGGER on_certificate_insert
BEFORE INSERT ON public.certificates
FOR EACH ROW
EXECUTE FUNCTION public.generate_verification_id();

-- 19. Public certificate verification policy
CREATE POLICY "Anyone can verify certificates by verification_id"
ON public.certificates FOR SELECT
USING (verification_id IS NOT NULL);