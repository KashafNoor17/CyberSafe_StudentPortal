
-- 1. Fix org member privilege escalation: replace permissive INSERT policy
DROP POLICY IF EXISTS "Users can insert self as owner" ON public.organization_members;

CREATE POLICY "Users can insert self as owner of new orgs" ON public.organization_members
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND role = 'owner'::org_role
    AND NOT EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_members.organization_id
    )
  );

-- 2. Fix friendship self-accept: only recipient can accept
DROP POLICY IF EXISTS "Users can update friendships they are part of" ON public.friendships;

CREATE POLICY "Users can update friendships they are part of" ON public.friendships
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id)
  WITH CHECK (
    CASE
      WHEN status = 'accepted' THEN auth.uid() = friend_id
      ELSE auth.uid() = user_id OR auth.uid() = friend_id
    END
  );

-- 3. Fix CTF flag hash exposure: create a secure view excluding flag_hash
CREATE OR REPLACE VIEW public.ctf_challenges_public AS
  SELECT id, title, description, category, difficulty, competition_id, points,
         max_attempts, hints, files, is_active, solve_count, created_at,
         requires_instance, lab_id, connection_info
  FROM public.ctf_challenges
  WHERE is_active = true;

-- 4. Fix LMS token exposure: restrict to org admins only
DROP POLICY IF EXISTS "Org members can view LMS connections" ON public.lms_connections;

CREATE POLICY "Org admins can view LMS connections" ON public.lms_connections
  FOR SELECT
  USING (is_org_admin(auth.uid(), university_id));
