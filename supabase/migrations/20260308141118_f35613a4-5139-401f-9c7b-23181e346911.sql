-- Update "Friends can view friend profiles" to respect profile_visibility setting
DROP POLICY IF EXISTS "Friends can view friend profiles" ON public.profiles;

CREATE POLICY "Friends can view friend profiles"
ON public.profiles
FOR SELECT
USING (
  are_friends(auth.uid(), user_id)
  AND (
    -- Allow if user has no visibility settings (default = public)
    NOT EXISTS (
      SELECT 1 FROM public.friend_activity_visibility fav
      WHERE fav.user_id = profiles.user_id
    )
    OR EXISTS (
      SELECT 1 FROM public.friend_activity_visibility fav
      WHERE fav.user_id = profiles.user_id
      AND fav.profile_visibility IN ('public', 'friends_only')
    )
  )
);