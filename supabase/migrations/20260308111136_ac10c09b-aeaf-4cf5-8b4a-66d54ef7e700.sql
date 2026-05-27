
-- Create ctf_competition_challenges linking table
CREATE TABLE IF NOT EXISTS public.ctf_competition_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.ctf_competitions(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.ctf_challenges(id) ON DELETE CASCADE,
  points_override INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (competition_id, challenge_id)
);

-- Add CTF-specific columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ctf_points INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ctf_solved_count INTEGER NOT NULL DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ctf_competition_challenges_comp ON public.ctf_competition_challenges(competition_id);
CREATE INDEX IF NOT EXISTS idx_ctf_competition_challenges_chal ON public.ctf_competition_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_ctf_submissions_user ON public.ctf_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_ctf_submissions_challenge ON public.ctf_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_ctf_challenges_category ON public.ctf_challenges(category);
CREATE INDEX IF NOT EXISTS idx_ctf_challenges_active ON public.ctf_challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_ctf_teams_competition ON public.ctf_teams(competition_id);
CREATE INDEX IF NOT EXISTS idx_profiles_ctf_points ON public.profiles(ctf_points DESC);

-- RLS for ctf_competition_challenges
ALTER TABLE public.ctf_competition_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view competition challenges"
  ON public.ctf_competition_challenges FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage competition challenges"
  ON public.ctf_competition_challenges FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a competition registration table
CREATE TABLE IF NOT EXISTS public.ctf_competition_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.ctf_competitions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.ctf_teams(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'registered',
  UNIQUE (competition_id, team_id)
);

ALTER TABLE public.ctf_competition_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view registrations"
  ON public.ctf_competition_registrations FOR SELECT
  USING (true);

CREATE POLICY "Team captains can register"
  ON public.ctf_competition_registrations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ctf_teams
      WHERE id = team_id AND captain_id = auth.uid()
    )
  );

-- Function to update CTF stats on correct submission
CREATE OR REPLACE FUNCTION public.update_ctf_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.is_correct = true THEN
    UPDATE public.profiles
    SET ctf_points = ctf_points + NEW.points_awarded,
        ctf_solved_count = ctf_solved_count + 1
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for CTF stats update
DROP TRIGGER IF EXISTS trg_update_ctf_stats ON public.ctf_submissions;
CREATE TRIGGER trg_update_ctf_stats
  AFTER INSERT ON public.ctf_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ctf_stats();
