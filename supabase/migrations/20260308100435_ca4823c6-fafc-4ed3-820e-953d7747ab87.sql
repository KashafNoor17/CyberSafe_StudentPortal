CREATE OR REPLACE VIEW public.quiz_questions_public
WITH (security_invoker = true) AS
SELECT id, question_text, scenario, options, explanation, order_index, created_at, difficulty, image_url, time_limit
FROM public.quiz_questions;

-- Fix WARNING: friend_activity_visibility public access
DROP POLICY IF EXISTS "Anyone can view visibility settings" ON public.friend_activity_visibility;
CREATE POLICY "Users and friends can view visibility"
  ON public.friend_activity_visibility FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR are_friends(auth.uid(), user_id));
REVOKE SELECT ON public.friend_activity_visibility FROM anon;