
-- Analytics deep-dive tables

CREATE TABLE public.user_journey_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  page_url text,
  module_id uuid REFERENCES public.learning_modules(id),
  time_on_page integer DEFAULT 0,
  scroll_depth integer DEFAULT 0,
  referrer text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.conversion_funnels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_name text NOT NULL,
  step_number integer NOT NULL,
  step_name text NOT NULL,
  step_description text,
  target_event text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.cohort_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_date date NOT NULL,
  cohort_size integer NOT NULL DEFAULT 0,
  week_1_retention float DEFAULT 0,
  week_2_retention float DEFAULT 0,
  week_4_retention float DEFAULT 0,
  week_8_retention float DEFAULT 0,
  month_3_retention float DEFAULT 0,
  month_6_retention float DEFAULT 0,
  calculated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for analytics queries
CREATE INDEX idx_journey_events_user ON public.user_journey_events(user_id);
CREATE INDEX idx_journey_events_type ON public.user_journey_events(event_type);
CREATE INDEX idx_journey_events_created ON public.user_journey_events(created_at DESC);
CREATE INDEX idx_journey_events_session ON public.user_journey_events(session_id);
CREATE INDEX idx_cohort_date ON public.cohort_analysis(cohort_date);
CREATE INDEX idx_funnel_name ON public.conversion_funnels(funnel_name, step_number);

-- RLS
ALTER TABLE public.user_journey_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_analysis ENABLE ROW LEVEL SECURITY;

-- Journey events: users can insert their own, admins can read all
CREATE POLICY "Users can insert own journey events"
  ON public.user_journey_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all journey events"
  ON public.user_journey_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own journey events"
  ON public.user_journey_events FOR SELECT
  USING (auth.uid() = user_id);

-- Funnels: admin only
CREATE POLICY "Admins can manage funnels"
  ON public.conversion_funnels FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Cohort: admin only
CREATE POLICY "Admins can manage cohorts"
  ON public.cohort_analysis FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Seed default funnels
INSERT INTO public.conversion_funnels (funnel_name, step_number, step_name, step_description, target_event) VALUES
  ('Registration to Certificate', 1, 'Account Created', 'User signs up for an account', 'signup'),
  ('Registration to Certificate', 2, 'First Module Started', 'User starts their first learning module', 'module_start'),
  ('Registration to Certificate', 3, 'First Module Completed', 'User completes their first module', 'module_complete'),
  ('Registration to Certificate', 4, 'All Modules Completed', 'User completes all available modules', 'all_modules_complete'),
  ('Registration to Certificate', 5, 'Certificate Generated', 'User earns their certificate', 'certificate_earned'),
  ('Module Engagement', 1, 'Module Page Viewed', 'User views a module page', 'page_view'),
  ('Module Engagement', 2, 'Module Started', 'User begins module content', 'module_start'),
  ('Module Engagement', 3, 'Quiz Attempted', 'User attempts the module quiz', 'quiz_attempt'),
  ('Module Engagement', 4, 'Quiz Passed', 'User passes quiz with 70%+', 'quiz_pass'),
  ('Module Engagement', 5, 'Module Completed', 'User completes the module', 'module_complete'),
  ('Community Engagement', 1, 'Community Visited', 'User visits the community page', 'page_view'),
  ('Community Engagement', 2, 'Post Read', 'User reads a forum post', 'post_view'),
  ('Community Engagement', 3, 'Content Upvoted', 'User upvotes content', 'upvote'),
  ('Community Engagement', 4, 'Reply Created', 'User creates a reply', 'forum_reply'),
  ('Community Engagement', 5, 'Post Created', 'User creates their own post', 'forum_post');
