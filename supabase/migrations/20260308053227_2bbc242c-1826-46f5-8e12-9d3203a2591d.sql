
-- Activity log for tracking user events
CREATE TABLE public.user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  module_id uuid REFERENCES public.learning_modules(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own activity" ON public.user_activity_log
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own activity" ON public.user_activity_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity" ON public.user_activity_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_activity_user_id ON public.user_activity_log(user_id);
CREATE INDEX idx_activity_type ON public.user_activity_log(activity_type);
CREATE INDEX idx_activity_created ON public.user_activity_log(created_at DESC);
CREATE INDEX idx_activity_module ON public.user_activity_log(module_id) WHERE module_id IS NOT NULL;

-- Daily aggregates for fast dashboard queries
CREATE TABLE public.daily_aggregates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  new_users integer NOT NULL DEFAULT 0,
  active_users integer NOT NULL DEFAULT 0,
  modules_completed integer NOT NULL DEFAULT 0,
  certificates_issued integer NOT NULL DEFAULT 0,
  avg_quiz_score numeric(5,2) DEFAULT 0,
  retention_rate numeric(5,2) DEFAULT 0
);

ALTER TABLE public.daily_aggregates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage aggregates" ON public.daily_aggregates
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_aggregates_date ON public.daily_aggregates(date DESC);

-- User segments for cohort analysis
CREATE TABLE public.user_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  segment_name text NOT NULL DEFAULT 'new',
  last_activity_date timestamp with time zone DEFAULT now(),
  days_since_last_visit integer DEFAULT 0,
  total_modules_completed integer DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own segment" ON public.user_segments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage segments" ON public.user_segments
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_segments_user ON public.user_segments(user_id);
CREATE INDEX idx_segments_name ON public.user_segments(segment_name);
