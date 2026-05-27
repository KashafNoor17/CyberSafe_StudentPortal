
-- 1. gift_certificates: restrict INSERT to authenticated role explicitly
DROP POLICY IF EXISTS "Users can insert gift certs" ON public.gift_certificates;
DROP POLICY IF EXISTS "Users insert gift certs" ON public.gift_certificates;
DROP POLICY IF EXISTS "Authenticated users insert gift certs" ON public.gift_certificates;
CREATE POLICY "Authenticated users insert gift certs"
  ON public.gift_certificates FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = purchaser_id);

-- 2. lms_courses: drop broad authenticated-true policy
DROP POLICY IF EXISTS "Authenticated users can view LMS courses" ON public.lms_courses;

-- 3. lms_assignments: drop broad authenticated-true policy
DROP POLICY IF EXISTS "Authenticated users can view LMS assignments" ON public.lms_assignments;

-- 4. friend_activity_reactions: restrict SELECT to authenticated
DROP POLICY IF EXISTS "Users can view reactions on visible activities" ON public.friend_activity_reactions;
CREATE POLICY "Authenticated users view reactions"
  ON public.friend_activity_reactions FOR SELECT TO authenticated
  USING (true);

-- 5. user_streaks: replace ALL policy with SELECT-only for users
DROP POLICY IF EXISTS "Users can manage own streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Users manage own streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can view own streaks" ON public.user_streaks;
CREATE POLICY "Users view own streaks"
  ON public.user_streaks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 6. security_scores: replace ALL policy with SELECT-only for users
DROP POLICY IF EXISTS "Users can manage own security scores" ON public.security_scores;
DROP POLICY IF EXISTS "Users manage own security scores" ON public.security_scores;
DROP POLICY IF EXISTS "Users can view own security scores" ON public.security_scores;
CREATE POLICY "Users view own security scores"
  ON public.security_scores FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
