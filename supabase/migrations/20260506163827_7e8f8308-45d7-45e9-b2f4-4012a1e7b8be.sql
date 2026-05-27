-- 1. Tighten module_feedback: drop permissive SELECT, add aggregate RPC
DROP POLICY IF EXISTS "Authenticated users can view all feedback" ON public.module_feedback;

CREATE OR REPLACE FUNCTION public.get_module_feedback_stats(p_module_id uuid)
RETURNS TABLE(avg_rating numeric, total_ratings integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(ROUND(AVG(rating)::numeric, 2), 0)::numeric AS avg_rating,
    COUNT(*)::integer AS total_ratings
  FROM public.module_feedback
  WHERE module_id = p_module_id;
$$;

REVOKE ALL ON FUNCTION public.get_module_feedback_stats(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_module_feedback_stats(uuid) TO authenticated, anon;

-- 2. Restrict phishing_templates to admins only
DROP POLICY IF EXISTS "Authenticated read phishing templates" ON public.phishing_templates;

-- 3. Remove unused / private tables from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.ctf_submissions;
ALTER PUBLICATION supabase_realtime DROP TABLE public.ctf_team_messages;
ALTER PUBLICATION supabase_realtime DROP TABLE public.study_group_messages;