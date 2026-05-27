
-- Fix security definer view to use security_invoker
DROP VIEW IF EXISTS public.ctf_challenges_public;

CREATE VIEW public.ctf_challenges_public
WITH (security_invoker = true) AS
  SELECT id, title, description, category, difficulty, competition_id, points,
         max_attempts, hints, files, is_active, solve_count, created_at,
         requires_instance, lab_id, connection_info
  FROM public.ctf_challenges
  WHERE is_active = true;
