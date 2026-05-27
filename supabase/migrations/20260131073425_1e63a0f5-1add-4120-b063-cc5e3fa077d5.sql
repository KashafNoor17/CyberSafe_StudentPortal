-- ============================================
-- SECURITY FIX MIGRATION
-- ============================================

-- 1. FIX: Certificates verification policy - restrict to specific verification_id lookup
DROP POLICY IF EXISTS "Anyone can verify certificates by verification_id" ON public.certificates;

-- Create a more restrictive policy that only allows public verification with a specific ID
-- This prevents enumeration of all certificates
CREATE POLICY "Public can verify specific certificate" 
ON public.certificates 
FOR SELECT 
TO anon, authenticated
USING (false); -- Disable direct anonymous access - verification will use RPC

-- 2. Create a secure RPC function for certificate verification
CREATE OR REPLACE FUNCTION public.verify_certificate(p_verification_id TEXT)
RETURNS TABLE (
  certificate_number TEXT,
  verification_id TEXT,
  issued_at TIMESTAMPTZ,
  student_name TEXT,
  is_valid BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Input validation
  IF p_verification_id IS NULL OR LENGTH(TRIM(p_verification_id)) < 5 THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    c.certificate_number,
    c.verification_id,
    c.issued_at,
    p.name as student_name,
    c.is_verified as is_valid
  FROM certificates c
  JOIN profiles p ON p.user_id = c.user_id
  WHERE c.verification_id = UPPER(TRIM(p_verification_id))
     OR c.certificate_number = UPPER(TRIM(p_verification_id))
  LIMIT 1;
END;
$$;

-- Grant execute to public (including anon)
GRANT EXECUTE ON FUNCTION public.verify_certificate(TEXT) TO anon, authenticated;

-- 3. FIX: User roles protection - add explicit admin-only policies
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. FIX: Gamification validation - Create secure server-side functions

-- 4a. Secure module completion function
CREATE OR REPLACE FUNCTION public.complete_module(p_module_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Validate module exists
  IF NOT EXISTS (SELECT 1 FROM learning_modules WHERE id = p_module_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid module');
  END IF;
  
  -- Check if already completed
  IF EXISTS (SELECT 1 FROM module_completions WHERE user_id = v_user_id AND module_id = p_module_id) THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already completed', 'points_awarded', 0);
  END IF;
  
  -- Insert completion
  INSERT INTO module_completions (user_id, module_id) 
  VALUES (v_user_id, p_module_id);
  
  -- Award points (trigger will update profile)
  INSERT INTO points_log (user_id, points, action, description)
  VALUES (v_user_id, 25, 'module_complete', 'Completed learning module');
  
  RETURN jsonb_build_object('success', true, 'message', 'Module completed', 'points_awarded', 25);
END;
$$;

-- 4b. Secure quiz submission function
CREATE OR REPLACE FUNCTION public.submit_quiz_result(
  p_score INTEGER,
  p_total_questions INTEGER,
  p_answers JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_points INTEGER;
  v_percentage NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Validate inputs
  IF p_score < 0 OR p_total_questions <= 0 OR p_score > p_total_questions THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid score values');
  END IF;
  
  -- Calculate percentage
  v_percentage := (p_score::NUMERIC / p_total_questions) * 100;
  
  -- Determine points based on performance
  IF v_percentage >= 100 THEN
    v_points := 100; -- Perfect score
  ELSIF v_percentage >= 70 THEN
    v_points := 50;  -- Passed
  ELSE
    v_points := 10;  -- Participated
  END IF;
  
  -- Insert quiz result
  INSERT INTO quiz_results (user_id, score, total_questions, answers)
  VALUES (v_user_id, p_score, p_total_questions, p_answers);
  
  -- Award points
  INSERT INTO points_log (user_id, points, action, description)
  VALUES (v_user_id, v_points, 'quiz_complete', 'Completed phishing quiz with ' || ROUND(v_percentage) || '% score');
  
  RETURN jsonb_build_object(
    'success', true, 
    'score', p_score, 
    'percentage', ROUND(v_percentage),
    'points_awarded', v_points,
    'passed', v_percentage >= 70
  );
END;
$$;

-- 4c. Secure certificate generation function
CREATE OR REPLACE FUNCTION public.generate_certificate()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_cert_number TEXT;
  v_modules_count INTEGER;
  v_completions_count INTEGER;
  v_quiz_passed BOOLEAN;
  v_existing_cert UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check for existing certificate
  SELECT id INTO v_existing_cert FROM certificates WHERE user_id = v_user_id;
  IF v_existing_cert IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Certificate already exists');
  END IF;
  
  -- Check all modules completed
  SELECT COUNT(*) INTO v_modules_count FROM learning_modules;
  SELECT COUNT(*) INTO v_completions_count FROM module_completions WHERE user_id = v_user_id;
  
  IF v_completions_count < v_modules_count THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not all modules completed', 
      'completed', v_completions_count, 'required', v_modules_count);
  END IF;
  
  -- Check quiz passed (70% or higher)
  SELECT (score::NUMERIC / NULLIF(total_questions, 0)) >= 0.7 INTO v_quiz_passed
  FROM quiz_results
  WHERE user_id = v_user_id
  ORDER BY completed_at DESC
  LIMIT 1;
  
  IF v_quiz_passed IS NULL OR NOT v_quiz_passed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quiz not passed with 70% or higher');
  END IF;
  
  -- Generate certificate
  v_cert_number := 'CYBER-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8));
  
  INSERT INTO certificates (user_id, certificate_number)
  VALUES (v_user_id, v_cert_number);
  
  -- Award points for certificate
  INSERT INTO points_log (user_id, points, action, description)
  VALUES (v_user_id, 200, 'certificate_earned', 'Earned CyberSafe Certificate');
  
  RETURN jsonb_build_object('success', true, 'certificate_number', v_cert_number);
END;
$$;

-- 4d. Secure review submission function
CREATE OR REPLACE FUNCTION public.submit_review(
  p_rating INTEGER,
  p_review_text TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Validate inputs
  IF p_rating < 1 OR p_rating > 5 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Rating must be between 1 and 5');
  END IF;
  
  IF LENGTH(TRIM(p_review_text)) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Review must be at least 10 characters');
  END IF;
  
  IF LENGTH(p_review_text) > 500 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Review must be less than 500 characters');
  END IF;
  
  -- Check for existing review
  IF EXISTS (SELECT 1 FROM reviews WHERE user_id = v_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You have already submitted a review');
  END IF;
  
  -- Insert review
  INSERT INTO reviews (user_id, rating, review_text)
  VALUES (v_user_id, p_rating, TRIM(p_review_text));
  
  -- Award points
  INSERT INTO points_log (user_id, points, action, description)
  VALUES (v_user_id, 10, 'review_submit', 'Submitted a platform review');
  
  RETURN jsonb_build_object('success', true, 'message', 'Review submitted for approval');
END;
$$;

-- 4e. Secure badge awarding function (called after points)
CREATE OR REPLACE FUNCTION public.check_and_award_badges()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_earned_badges TEXT[] := '{}';
  v_badge RECORD;
  v_completions INTEGER;
  v_total_modules INTEGER;
  v_total_points INTEGER;
  v_quiz_percentage NUMERIC;
  v_has_cert BOOLEAN;
  v_has_review BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get user stats
  SELECT COUNT(*) INTO v_completions FROM module_completions WHERE user_id = v_user_id;
  SELECT COUNT(*) INTO v_total_modules FROM learning_modules;
  SELECT COALESCE(total_points, 0) INTO v_total_points FROM profiles WHERE user_id = v_user_id;
  SELECT (score::NUMERIC / NULLIF(total_questions, 0)) * 100 INTO v_quiz_percentage
    FROM quiz_results WHERE user_id = v_user_id ORDER BY completed_at DESC LIMIT 1;
  SELECT EXISTS (SELECT 1 FROM certificates WHERE user_id = v_user_id) INTO v_has_cert;
  SELECT EXISTS (SELECT 1 FROM reviews WHERE user_id = v_user_id) INTO v_has_review;
  
  -- Check badge eligibility and award
  FOR v_badge IN SELECT id, name FROM badges LOOP
    -- Skip if already earned
    IF EXISTS (SELECT 1 FROM user_badges WHERE user_id = v_user_id AND badge_id = v_badge.id) THEN
      CONTINUE;
    END IF;
    
    -- Check eligibility based on badge name
    IF v_badge.name = 'First Steps' AND v_completions >= 1 THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, v_badge.id);
      v_earned_badges := array_append(v_earned_badges, v_badge.name);
    ELSIF v_badge.name = 'Quick Learner' AND v_completions >= 3 THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, v_badge.id);
      v_earned_badges := array_append(v_earned_badges, v_badge.name);
    ELSIF v_badge.name = 'Knowledge Seeker' AND v_completions >= v_total_modules THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, v_badge.id);
      v_earned_badges := array_append(v_earned_badges, v_badge.name);
    ELSIF v_badge.name = 'Phishing Detector' AND COALESCE(v_quiz_percentage, 0) >= 70 THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, v_badge.id);
      v_earned_badges := array_append(v_earned_badges, v_badge.name);
    ELSIF v_badge.name = 'Phishing Expert' AND COALESCE(v_quiz_percentage, 0) >= 100 THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, v_badge.id);
      v_earned_badges := array_append(v_earned_badges, v_badge.name);
    ELSIF v_badge.name = 'Rising Star' AND v_total_points >= 100 THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, v_badge.id);
      v_earned_badges := array_append(v_earned_badges, v_badge.name);
    ELSIF v_badge.name = 'Cyber Champion' AND v_total_points >= 500 THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, v_badge.id);
      v_earned_badges := array_append(v_earned_badges, v_badge.name);
    ELSIF v_badge.name = 'Community Voice' AND v_has_review THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, v_badge.id);
      v_earned_badges := array_append(v_earned_badges, v_badge.name);
    ELSIF v_badge.name = 'Cyber Defender' AND v_has_cert THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, v_badge.id);
      v_earned_badges := array_append(v_earned_badges, v_badge.name);
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object('success', true, 'badges_earned', v_earned_badges);
END;
$$;

-- 5. Create leaderboard view for public leaderboard access (without exposing email)
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT 
  p.user_id,
  p.name,
  p.total_points,
  p.level,
  ROW_NUMBER() OVER (ORDER BY p.total_points DESC NULLS LAST) as rank
FROM profiles p
WHERE p.total_points > 0
ORDER BY p.total_points DESC NULLS LAST
LIMIT 100;

-- Grant SELECT to authenticated users only
GRANT SELECT ON public.leaderboard_view TO authenticated;

-- 6. Add constraint to points_log to prevent abuse
ALTER TABLE points_log ADD CONSTRAINT points_log_points_check 
  CHECK (points >= 0 AND points <= 1000);

-- 7. Remove direct INSERT policies that allow client manipulation
-- Keep only server-side (RPC) inserts for sensitive tables

-- Points log: remove user INSERT (will use RPC functions)
DROP POLICY IF EXISTS "Users can log points" ON public.points_log;

-- User badges: remove user INSERT (will use RPC functions)  
DROP POLICY IF EXISTS "Users can earn badges" ON public.user_badges;

-- Module completions: remove user INSERT (will use RPC functions)
DROP POLICY IF EXISTS "Users can insert their own completions" ON public.module_completions;

-- Quiz results: remove user INSERT (will use RPC functions)
DROP POLICY IF EXISTS "Users can insert their own results" ON public.quiz_results;

-- Certificates: remove user INSERT (will use RPC functions)
DROP POLICY IF EXISTS "Users can insert their own certificate" ON public.certificates;

-- Reviews: remove user INSERT (will use RPC functions)
DROP POLICY IF EXISTS "Users can submit reviews" ON public.reviews;

-- Grant execute on all secure functions to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_module(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_quiz_result(INTEGER, INTEGER, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_certificate() TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_review(INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_award_badges() TO authenticated;