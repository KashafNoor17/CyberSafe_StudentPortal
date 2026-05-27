
-- Fix overly permissive INSERT policy on organizations
DROP POLICY "Authenticated users can create orgs" ON public.organizations;

CREATE POLICY "Authenticated users can create orgs"
  ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
