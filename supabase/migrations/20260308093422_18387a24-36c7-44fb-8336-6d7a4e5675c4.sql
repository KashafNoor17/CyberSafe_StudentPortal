
-- Research datasets metadata
CREATE TABLE public.research_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_by UUID NOT NULL,
  record_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'generating',
  anonymization_method TEXT NOT NULL DEFAULT 'k-anonymity',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.research_datasets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage datasets" ON public.research_datasets
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view published datasets" ON public.research_datasets
  FOR SELECT TO authenticated
  USING (status = 'published');

-- Dataset access requests
CREATE TABLE public.dataset_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES public.research_datasets(id) ON DELETE CASCADE,
  user_id UUID,
  researcher_name TEXT NOT NULL,
  institution TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dataset_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage dataset requests" ON public.dataset_requests
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can submit request" ON public.dataset_requests
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users view own requests" ON public.dataset_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Anonymized user records for research
CREATE TABLE public.anonymized_user_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES public.research_datasets(id) ON DELETE CASCADE,
  anonymized_user_id TEXT NOT NULL,
  module_completions JSONB NOT NULL DEFAULT '[]'::jsonb,
  quiz_scores JSONB NOT NULL DEFAULT '[]'::jsonb,
  time_spent INTEGER NOT NULL DEFAULT 0,
  badge_count INTEGER NOT NULL DEFAULT 0,
  streak_data JSONB NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.anonymized_user_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage anonymized records" ON public.anonymized_user_records
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Threat intelligence entries
CREATE TABLE public.threat_intel_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'manual',
  threat_type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  severity TEXT NOT NULL DEFAULT 'medium',
  related_module_ids UUID[] DEFAULT '{}',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  external_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.threat_intel_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active threats" ON public.threat_intel_entries
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins manage threats" ON public.threat_intel_entries
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Research opt-out tracking
CREATE TABLE public.research_opt_outs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  opted_out_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason TEXT
);

ALTER TABLE public.research_opt_outs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own opt-out" ON public.research_opt_outs
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
