
-- Only create missing tables

CREATE TABLE public.campaign_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.phishing_campaigns(id) ON DELETE CASCADE,
    user_id UUID,
    email_sent_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    reported_at TIMESTAMPTZ,
    credentials_submitted BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'pending'
);

CREATE TABLE public.awareness_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) DEFAULT 'training',
    target_group VARCHAR(50) DEFAULT 'all',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'draft',
    completion_rate DECIMAL(5,2) DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.awareness_campaign_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.awareness_campaigns(id) ON DELETE CASCADE,
    user_id UUID,
    completed_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'assigned'
);

-- Enable RLS on new tables
ALTER TABLE public.campaign_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awareness_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awareness_campaign_targets ENABLE ROW LEVEL SECURITY;

-- RLS for existing tables that may not have policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'phishing_templates' AND policyname = 'Admins can manage phishing_templates') THEN
    CREATE POLICY "Admins can manage phishing_templates" ON public.phishing_templates FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'phishing_campaigns' AND policyname = 'Admins can manage phishing_campaigns') THEN
    CREATE POLICY "Admins can manage phishing_campaigns" ON public.phishing_campaigns FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'phishing_results' AND policyname = 'Admins can manage phishing_results') THEN
    CREATE POLICY "Admins can manage phishing_results" ON public.phishing_results FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

CREATE POLICY "Admins can manage campaign_targets" ON public.campaign_targets FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own campaign targets" ON public.campaign_targets FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can manage awareness_campaigns" ON public.awareness_campaigns FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage awareness_campaign_targets" ON public.awareness_campaign_targets FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own awareness targets" ON public.awareness_campaign_targets FOR SELECT TO authenticated USING (user_id = auth.uid());
