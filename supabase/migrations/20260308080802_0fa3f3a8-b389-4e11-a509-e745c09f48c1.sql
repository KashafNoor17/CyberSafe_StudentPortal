
-- CTF Competitions
CREATE TABLE public.ctf_competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  status text NOT NULL DEFAULT 'upcoming',
  scoring_type text NOT NULL DEFAULT 'static',
  registration_type text NOT NULL DEFAULT 'open',
  max_team_size integer NOT NULL DEFAULT 4,
  min_team_size integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ctf_competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view competitions" ON public.ctf_competitions FOR SELECT USING (true);
CREATE POLICY "Admins can manage competitions" ON public.ctf_competitions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- CTF Challenges
CREATE TABLE public.ctf_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES public.ctf_competitions(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'misc',
  difficulty text NOT NULL DEFAULT 'easy',
  points integer NOT NULL DEFAULT 100,
  flag_hash text NOT NULL,
  max_attempts integer DEFAULT NULL,
  hints jsonb NOT NULL DEFAULT '[]'::jsonb,
  files jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  solve_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ctf_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges" ON public.ctf_challenges FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage challenges" ON public.ctf_challenges FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- CTF Teams
CREATE TABLE public.ctf_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES public.ctf_competitions(id) ON DELETE CASCADE,
  name text NOT NULL,
  captain_id uuid NOT NULL,
  invite_code text NOT NULL DEFAULT upper(substring(gen_random_uuid()::text, 1, 8)),
  total_score integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ctf_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teams" ON public.ctf_teams FOR SELECT USING (true);
CREATE POLICY "Authenticated can create teams" ON public.ctf_teams FOR INSERT WITH CHECK (auth.uid() = captain_id);
CREATE POLICY "Captains can update teams" ON public.ctf_teams FOR UPDATE USING (auth.uid() = captain_id);

-- CTF Team Members
CREATE TABLE public.ctf_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.ctf_teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE public.ctf_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view team members" ON public.ctf_team_members FOR SELECT USING (true);
CREATE POLICY "Users can join teams" ON public.ctf_team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave teams" ON public.ctf_team_members FOR DELETE USING (auth.uid() = user_id);

-- CTF Submissions
CREATE TABLE public.ctf_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.ctf_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  team_id uuid REFERENCES public.ctf_teams(id) ON DELETE SET NULL,
  submitted_flag text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  points_awarded integer NOT NULL DEFAULT 0,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ctf_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions" ON public.ctf_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can submit flags" ON public.ctf_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all submissions" ON public.ctf_submissions FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- CTF Hint Unlocks
CREATE TABLE public.ctf_hint_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.ctf_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  hint_index integer NOT NULL DEFAULT 0,
  cost integer NOT NULL DEFAULT 0,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id, hint_index)
);

ALTER TABLE public.ctf_hint_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hint unlocks" ON public.ctf_hint_unlocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can unlock hints" ON public.ctf_hint_unlocks FOR INSERT WITH CHECK (auth.uid() = user_id);
