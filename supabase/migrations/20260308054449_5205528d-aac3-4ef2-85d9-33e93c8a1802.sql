
-- Organization role enum
CREATE TYPE public.org_role AS ENUM ('member', 'manager', 'admin', 'owner');

-- Organization plan enum
CREATE TYPE public.org_plan AS ENUM ('free', 'pro', 'enterprise');

-- Organizations table
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text UNIQUE,
  plan_type org_plan NOT NULL DEFAULT 'free',
  max_users integer NOT NULL DEFAULT 10,
  features jsonb NOT NULL DEFAULT '{}',
  billing_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Organization members table
CREATE TABLE public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role org_role NOT NULL DEFAULT 'member',
  department text,
  job_title text,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);

-- Organization invites table
CREATE TABLE public.organization_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  invite_code text NOT NULL UNIQUE DEFAULT upper(substring(gen_random_uuid()::text, 1, 8)),
  role org_role NOT NULL DEFAULT 'member',
  invited_by uuid NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_org_invites_code ON public.organization_invites(invite_code);
CREATE INDEX idx_org_invites_email ON public.organization_invites(email);

-- Helper function: check if user is org member with specific role
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id AND organization_id = _org_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id AND organization_id = _org_id
    AND role IN ('admin', 'owner')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_org_manager(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id AND organization_id = _org_id
    AND role IN ('manager', 'admin', 'owner')
  )
$$;

-- RLS: Organizations
CREATE POLICY "Members can view their org"
  ON public.organizations FOR SELECT TO authenticated
  USING (is_org_member(auth.uid(), id));

CREATE POLICY "Admins can update their org"
  ON public.organizations FOR UPDATE TO authenticated
  USING (is_org_admin(auth.uid(), id));

CREATE POLICY "Authenticated users can create orgs"
  ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Platform admins can manage all orgs"
  ON public.organizations FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- RLS: Organization members
CREATE POLICY "Members can view org members"
  ON public.organization_members FOR SELECT TO authenticated
  USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can manage org members"
  ON public.organization_members FOR ALL TO authenticated
  USING (is_org_admin(auth.uid(), organization_id))
  WITH CHECK (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Users can insert self as owner"
  ON public.organization_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'owner');

-- RLS: Organization invites
CREATE POLICY "Org managers can manage invites"
  ON public.organization_invites FOR ALL TO authenticated
  USING (is_org_manager(auth.uid(), organization_id))
  WITH CHECK (is_org_manager(auth.uid(), organization_id));

CREATE POLICY "Invited users can view their invite"
  ON public.organization_invites FOR SELECT TO authenticated
  USING (email = (SELECT email FROM public.profiles WHERE user_id = auth.uid() LIMIT 1));

-- Trigger to update updated_at on organizations
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
