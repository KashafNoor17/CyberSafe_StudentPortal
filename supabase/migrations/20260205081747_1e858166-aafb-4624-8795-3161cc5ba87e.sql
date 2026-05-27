-- Fix 1: Remove the overly permissive profiles policy that exposes emails
DROP POLICY IF EXISTS "Authenticated users can view leaderboard data" ON public.profiles;

-- Fix 2: Create a new secure submit_quiz_result function that validates answers server-side
CREATE OR REPLACE FUNCTION public.submit_quiz_result(
  p_answers JSONB -- [{questionId, userAnswer, correct}, ...]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_score INTEGER := 0;
  v_total INTEGER;
  v_answer JSONB;
  v_correct_answer TEXT;
  v_question_id UUID;
  v_user_answer TEXT;
  v_points INTEGER;
  v_percentage NUMERIC;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Validate answers array
  IF p_answers IS NULL OR jsonb_array_length(p_answers) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'No answers provided');
  END IF;
  
  v_total := jsonb_array_length(p_answers);
  
  -- Validate total questions matches actual quiz questions
  IF v_total > (SELECT COUNT(*) FROM quiz_questions) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid number of answers');
  END IF;
  
  -- Verify each answer SERVER-SIDE against the actual correct answers
  FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers)
  LOOP
    -- Extract question ID and user's answer
    v_question_id := (v_answer->>'questionId')::UUID;
    v_user_answer := v_answer->>'userAnswer';
    
    -- Skip if question_id is invalid
    IF v_question_id IS NULL THEN
      CONTINUE;
    END IF;
    
    -- Fetch the actual correct answer from the database
    SELECT correct_answer INTO v_correct_answer 
    FROM quiz_questions 
    WHERE id = v_question_id;
    
    -- Only count as correct if the answer actually matches
    IF v_correct_answer IS NOT NULL AND v_correct_answer = v_user_answer THEN
      v_score := v_score + 1;
    END IF;
  END LOOP;
  
  -- Calculate percentage based on server-validated score
  v_percentage := CASE WHEN v_total > 0 THEN (v_score::NUMERIC / v_total) * 100 ELSE 0 END;
  
  -- Determine points based on performance
  IF v_percentage >= 100 THEN
    v_points := 100; -- Perfect score
  ELSIF v_percentage >= 70 THEN
    v_points := 50;  -- Passed
  ELSE
    v_points := 10;  -- Participated
  END IF;
  
  -- Insert quiz result with server-validated score
  INSERT INTO quiz_results (user_id, score, total_questions, answers)
  VALUES (v_user_id, v_score, v_total, p_answers);
  
  -- Award points
  INSERT INTO points_log (user_id, points, action, description)
  VALUES (v_user_id, v_points, 'quiz_complete', 'Completed phishing quiz with ' || ROUND(v_percentage) || '% score');
  
  RETURN jsonb_build_object(
    'success', true, 
    'score', v_score, 
    'percentage', ROUND(v_percentage),
    'points_awarded', v_points,
    'passed', v_percentage >= 70
  );
END;
$$;

-- Fix 3: Add badge_key column for stable badge identification
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS badge_key TEXT UNIQUE;

-- Update existing badges with badge_keys
UPDATE public.badges SET badge_key = LOWER(REPLACE(REPLACE(name, ' ', '_'), '''', '')) WHERE badge_key IS NULL;

-- Update check_and_award_badges to use badge_key for stability
CREATE OR REPLACE FUNCTION public.check_and_award_badges()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
  v_badge_key TEXT;
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
  
  -- Check badge eligibility and award using badge_key for stability
  FOR v_badge IN SELECT id, name, badge_key FROM badges LOOP
    -- Skip if already earned
    IF EXISTS (SELECT 1 FROM user_badges WHERE user_id = v_user_id AND badge_id = v_badge.id) THEN
      CONTINUE;
    END IF;
    
    -- Use badge_key for stable identification, fallback to name if badge_key is null
    v_badge_key := COALESCE(v_badge.badge_key, LOWER(REPLACE(v_badge.name, ' ', '_')));
    
    -- Check eligibility based on badge_key
    IF v_badge_key = 'first_steps' AND v_completions >= 1 THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, v_badge.id);
      v_earned_badges := array_append(v_earned_badges, v_badge.name);
    ELSIF v_badge_key = 'quick_learner' AND v_completions >= 3 THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, v_badge.id);
      v_earned_badges := array_append(v_earned_badges, v_badge.name);
    ELSIF v_badge_key = 'knowledge_seeker' AND v_completions >= v_total_modules THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, v_badge.id);
      v_earned_badges := array_append(v_earned_badges, v_badge.name);
    ELSIF v_badge_key = 'phishing_detector' AND COALESCE(v_quiz_percentage, 0) >= 70 THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, v_badge.id);
      v_earned_badges := array_append(v_earned_badges, v_badge.name);
    ELSIF v_badge_key = 'phishing_expert' AND COALESCE(v_quiz_percentage, 0) >= 100 THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, v_badge.id);
      v_earned_badges := array_append(v_earned_badges, v_badge.name);
    ELSIF v_badge_key = 'rising_star' AND v_total_points >= 100 THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, v_badge.id);
      v_earned_badges := array_append(v_earned_badges, v_badge.name);
    ELSIF v_badge_key = 'cyber_champion' AND v_total_points >= 500 THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, v_badge.id);
      v_earned_badges := array_append(v_earned_badges, v_badge.name);
    ELSIF v_badge_key = 'community_voice' AND v_has_review THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, v_badge.id);
      v_earned_badges := array_append(v_earned_badges, v_badge.name);
    ELSIF v_badge_key = 'cyber_defender' AND v_has_cert THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (v_user_id, v_badge.id);
      v_earned_badges := array_append(v_earned_badges, v_badge.name);
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object('success', true, 'badges_earned', v_earned_badges);
END;
$$;