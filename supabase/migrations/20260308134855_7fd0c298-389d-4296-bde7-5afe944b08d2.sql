-- 1. Drop the overly permissive public SELECT policy on module_quizzes
DROP POLICY IF EXISTS "Anyone can view quiz questions" ON public.module_quizzes;

-- 2. Create a secure view for CTF teams that hides invite_code
CREATE OR REPLACE VIEW public.ctf_teams_public
WITH (security_invoker = true)
AS
SELECT
  id,
  name,
  captain_id,
  competition_id,
  total_score,
  created_at,
  CASE
    WHEN auth.uid() = captain_id THEN invite_code
    WHEN EXISTS (
      SELECT 1 FROM public.ctf_team_members
      WHERE ctf_team_members.team_id = ctf_teams.id
      AND ctf_team_members.user_id = auth.uid()
    ) THEN invite_code
    ELSE NULL
  END AS invite_code
FROM public.ctf_teams;

-- 3. Replace overly permissive ctf_teams SELECT policy
DROP POLICY IF EXISTS "Anyone can view teams" ON public.ctf_teams;

CREATE POLICY "Authenticated users can view teams"
ON public.ctf_teams
FOR SELECT
TO authenticated
USING (true);