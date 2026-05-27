-- Revoke direct SELECT on base quiz/CTF tables from non-admin roles
-- Users should query via the _public views instead

-- CTF challenges: drop old policy that was recreated, restrict to admins only
DROP POLICY IF EXISTS "Authenticated view active challenges" ON public.ctf_challenges;
DROP POLICY IF EXISTS "Anyone can view active challenges" ON public.ctf_challenges;
CREATE POLICY "Only admins select base ctf_challenges"
  ON public.ctf_challenges FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- module_quizzes: restrict base table to admins
DROP POLICY IF EXISTS "Authenticated view module quizzes" ON public.module_quizzes;
CREATE POLICY "Only admins select base module_quizzes"
  ON public.module_quizzes FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- quiz_questions: restrict base table to admins
DROP POLICY IF EXISTS "Authenticated view quiz questions" ON public.quiz_questions;
CREATE POLICY "Only admins select base quiz_questions"
  ON public.quiz_questions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix notification injection: restrict INSERT to own user_id
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.forum_notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON public.forum_notifications;
DO $$ BEGIN
  -- Find and drop any INSERT policy on forum_notifications
  PERFORM 1; -- policies already dropped above if they exist
END $$;

-- Recreate with proper check
CREATE POLICY "Users can only insert own notifications"
  ON public.forum_notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);