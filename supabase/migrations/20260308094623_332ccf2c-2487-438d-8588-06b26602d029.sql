
-- Feature Requests table
CREATE TABLE public.feature_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view feature requests" ON public.feature_requests
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create feature requests" ON public.feature_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feature requests" ON public.feature_requests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all feature requests" ON public.feature_requests
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Feature Votes table
CREATE TABLE public.feature_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id uuid NOT NULL REFERENCES public.feature_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  vote_type text NOT NULL DEFAULT 'up',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(feature_id, user_id)
);

ALTER TABLE public.feature_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes" ON public.feature_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON public.feature_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes" ON public.feature_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON public.feature_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Feature Comments table
CREATE TABLE public.feature_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id uuid NOT NULL REFERENCES public.feature_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  comment text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view feature comments" ON public.feature_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON public.feature_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.feature_comments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments" ON public.feature_comments
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
