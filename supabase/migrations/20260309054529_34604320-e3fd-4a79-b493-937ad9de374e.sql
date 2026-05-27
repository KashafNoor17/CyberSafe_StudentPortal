
-- Restrict base community_challenges table to admin-only SELECT
-- Regular users use community_challenges_safe view instead
DROP POLICY IF EXISTS "Anyone can view approved challenges" ON public.community_challenges;

CREATE POLICY "Only admins select base community_challenges"
  ON public.community_challenges FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
