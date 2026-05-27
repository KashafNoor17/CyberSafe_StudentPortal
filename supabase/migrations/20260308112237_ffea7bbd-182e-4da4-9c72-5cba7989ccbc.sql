
-- CTF challenge comments/writeups
CREATE TABLE public.ctf_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.ctf_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL DEFAULT '',
  is_writeup boolean NOT NULL DEFAULT false,
  upvotes integer NOT NULL DEFAULT 0,
  downvotes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ctf_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments (only on solved challenges - enforced in app)
CREATE POLICY "Anyone can view ctf comments" ON public.ctf_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON public.ctf_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.ctf_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.ctf_comments FOR DELETE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- CTF comment votes
CREATE TABLE public.ctf_comment_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.ctf_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  vote_type text NOT NULL DEFAULT 'up' CHECK (vote_type IN ('up', 'down')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

ALTER TABLE public.ctf_comment_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comment votes" ON public.ctf_comment_votes FOR SELECT USING (true);
CREATE POLICY "Users can manage own votes" ON public.ctf_comment_votes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- CTF bookmarks
CREATE TABLE public.ctf_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.ctf_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.ctf_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bookmarks" ON public.ctf_bookmarks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_ctf_comments_challenge ON public.ctf_comments(challenge_id);
CREATE INDEX idx_ctf_comments_user ON public.ctf_comments(user_id);
CREATE INDEX idx_ctf_bookmarks_user ON public.ctf_bookmarks(user_id);
CREATE INDEX idx_ctf_comment_votes_comment ON public.ctf_comment_votes(comment_id);
