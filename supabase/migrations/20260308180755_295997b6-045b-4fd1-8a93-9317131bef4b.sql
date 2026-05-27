
-- Fix overly permissive insert policy on research_publications
DROP POLICY IF EXISTS "Authenticated users can submit publications" ON public.research_publications;
CREATE POLICY "Authenticated users can insert publications" ON public.research_publications
    FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
