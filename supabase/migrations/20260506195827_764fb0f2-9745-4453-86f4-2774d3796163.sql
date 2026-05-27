
-- 1) Profiles: drop overly broad friends policy and create a safe view for friends
DROP POLICY IF EXISTS "Friends can view friend profiles" ON public.profiles;

CREATE OR REPLACE VIEW public.friend_profiles_safe
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.user_id,
  p.name,
  p.display_name,
  p.bio,
  p.avatar_url,
  p.level,
  p.total_points,
  p.cyber_score,
  p.ctf_points,
  p.ctf_solved_count,
  p.created_at
FROM public.profiles p
WHERE
  public.are_friends(auth.uid(), p.user_id)
  AND (
    NOT EXISTS (SELECT 1 FROM public.friend_activity_visibility fav WHERE fav.user_id = p.user_id)
    OR EXISTS (
      SELECT 1 FROM public.friend_activity_visibility fav
      WHERE fav.user_id = p.user_id
        AND fav.profile_visibility = ANY (ARRAY['public'::text, 'friends_only'::text])
    )
  );

GRANT SELECT ON public.friend_profiles_safe TO authenticated;

-- 2) study_group_messages: require sender to be a member of the group
DROP POLICY IF EXISTS "Auth users can send messages" ON public.study_group_messages;
CREATE POLICY "Members can send messages"
  ON public.study_group_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND group_id IN (
      SELECT sgm.group_id FROM public.study_group_members sgm WHERE sgm.user_id = auth.uid()
    )
  );

-- 3) university_partnerships: associate submissions with the submitter
ALTER TABLE public.university_partnerships
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "Authenticated can submit partnership request" ON public.university_partnerships;
CREATE POLICY "Users submit own partnership request"
  ON public.university_partnerships
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own partnership submissions"
  ON public.university_partnerships
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
