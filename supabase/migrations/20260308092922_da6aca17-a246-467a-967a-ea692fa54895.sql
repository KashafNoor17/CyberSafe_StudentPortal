
-- Phishing simulation tables
CREATE TABLE public.phishing_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  sender_name TEXT NOT NULL DEFAULT 'Security Team',
  sender_email TEXT NOT NULL DEFAULT 'security@example.com',
  content_html TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'medium',
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

CREATE TABLE public.phishing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  template_id UUID REFERENCES public.phishing_templates(id) ON DELETE SET NULL,
  target_user_ids JSONB NOT NULL DEFAULT '[]',
  scheduled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

CREATE TABLE public.phishing_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  campaign_id UUID REFERENCES public.phishing_campaigns(id) ON DELETE CASCADE NOT NULL,
  email_sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  reported_at TIMESTAMPTZ,
  credentials_submitted BOOLEAN NOT NULL DEFAULT false
);

-- Breach monitoring tables
CREATE TABLE public.breach_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  found_in_breaches JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE public.breach_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  breach_name TEXT NOT NULL,
  breach_date TEXT,
  affected_data TEXT NOT NULL DEFAULT '',
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Security score tracking
CREATE TABLE public.security_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  overall_score INTEGER NOT NULL DEFAULT 0,
  password_score INTEGER NOT NULL DEFAULT 0,
  mfa_score INTEGER NOT NULL DEFAULT 0,
  phishing_score INTEGER NOT NULL DEFAULT 0,
  modules_score INTEGER NOT NULL DEFAULT 0,
  settings_score INTEGER NOT NULL DEFAULT 0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Incident response simulation
CREATE TABLE public.incident_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  scenario_type TEXT NOT NULL,
  choices JSONB NOT NULL DEFAULT '[]',
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 100,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.phishing_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phishing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phishing_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breach_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breach_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_simulations ENABLE ROW LEVEL SECURITY;

-- Phishing templates: admins can manage, authenticated can read
CREATE POLICY "Admins manage phishing templates" ON public.phishing_templates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated read phishing templates" ON public.phishing_templates
  FOR SELECT TO authenticated USING (true);

-- Phishing campaigns: admins manage
CREATE POLICY "Admins manage phishing campaigns" ON public.phishing_campaigns
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Phishing results: users see own, admins see all
CREATE POLICY "Users read own phishing results" ON public.phishing_results
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System inserts phishing results" ON public.phishing_results
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Breach checks: users manage own
CREATE POLICY "Users manage own breach checks" ON public.breach_checks
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Breach alerts: users manage own
CREATE POLICY "Users manage own breach alerts" ON public.breach_alerts
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Security scores: users manage own
CREATE POLICY "Users manage own security scores" ON public.security_scores
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Incident simulations: users manage own
CREATE POLICY "Users manage own incident simulations" ON public.incident_simulations
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
