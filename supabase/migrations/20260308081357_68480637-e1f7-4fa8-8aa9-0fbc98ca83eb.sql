
-- Compliance Frameworks (GDPR, HIPAA, PCI-DSS, etc.)
CREATE TABLE public.compliance_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  version text NOT NULL DEFAULT '1.0',
  industry text NOT NULL DEFAULT 'general',
  regulatory_body text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.compliance_frameworks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view frameworks" ON public.compliance_frameworks FOR SELECT USING (true);
CREATE POLICY "Admins can manage frameworks" ON public.compliance_frameworks FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Compliance Requirements (individual controls within a framework)
CREATE TABLE public.compliance_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id uuid NOT NULL REFERENCES public.compliance_frameworks(id) ON DELETE CASCADE,
  requirement_code text NOT NULL DEFAULT '',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  control_family text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'required',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.compliance_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view requirements" ON public.compliance_requirements FOR SELECT USING (true);
CREATE POLICY "Admins can manage requirements" ON public.compliance_requirements FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Compliance Mappings (link requirements to learning modules)
CREATE TABLE public.compliance_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id uuid NOT NULL REFERENCES public.compliance_requirements(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  mapping_type text NOT NULL DEFAULT 'covers',
  coverage_percentage integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(requirement_id, module_id)
);

ALTER TABLE public.compliance_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view mappings" ON public.compliance_mappings FOR SELECT USING (true);
CREATE POLICY "Admins can manage mappings" ON public.compliance_mappings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Organizational Compliance (tracks an org's adoption of a framework)
CREATE TABLE public.organizational_compliance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  framework_id uuid NOT NULL REFERENCES public.compliance_frameworks(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started',
  target_completion_date date,
  last_audit_date timestamptz,
  compliance_score integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, framework_id)
);

ALTER TABLE public.organizational_compliance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view compliance" ON public.organizational_compliance FOR SELECT USING (is_org_member(auth.uid(), organization_id));
CREATE POLICY "Org admins can manage compliance" ON public.organizational_compliance FOR ALL USING (is_org_admin(auth.uid(), organization_id));

-- Compliance Training Records (tracks user completion of requirements)
CREATE TABLE public.compliance_training_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  requirement_id uuid NOT NULL REFERENCES public.compliance_requirements(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'assigned',
  assigned_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expiration_date date,
  assigned_by uuid,
  role_template text,
  evidence_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, requirement_id)
);

ALTER TABLE public.compliance_training_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own training records" ON public.compliance_training_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Org admins can manage training records" ON public.compliance_training_records FOR ALL USING (
  organization_id IS NOT NULL AND is_org_admin(auth.uid(), organization_id)
);
CREATE POLICY "Admins can manage all training records" ON public.compliance_training_records FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
