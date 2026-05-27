
-- AI Interactions tracking table
CREATE TABLE public.ai_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  interaction_type text NOT NULL DEFAULT 'explanation',
  prompt text NOT NULL DEFAULT '',
  response text NOT NULL DEFAULT '',
  tokens_used integer NOT NULL DEFAULT 0,
  model_version text NOT NULL DEFAULT 'gemini-3-flash-preview',
  latency_ms integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interactions" ON public.ai_interactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions" ON public.ai_interactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all interactions" ON public.ai_interactions
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_ai_interactions_user_id ON public.ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_type ON public.ai_interactions(interaction_type);

-- AI Feedback table
CREATE TABLE public.ai_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id uuid REFERENCES public.ai_interactions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  user_rating integer CHECK (user_rating >= 1 AND user_rating <= 5),
  helpful boolean,
  user_comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own feedback" ON public.ai_feedback
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback" ON public.ai_feedback
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_ai_feedback_interaction ON public.ai_feedback(interaction_id);

-- AI Content Cache table
CREATE TABLE public.ai_content_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_hash text NOT NULL UNIQUE,
  content_type text NOT NULL DEFAULT 'explanation',
  response jsonb NOT NULL DEFAULT '{}'::jsonb,
  access_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_content_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cache" ON public.ai_content_cache
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage cache" ON public.ai_content_cache
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_ai_cache_hash ON public.ai_content_cache(content_hash);
