
-- =====================================================
-- Fix 1: generated_questions - restrict INSERT/UPDATE to admins only
-- The template engine uses increment_template_usage (SECURITY DEFINER)
-- and we'll create a new SECURITY DEFINER function for inserts
-- =====================================================

-- Drop overly permissive INSERT and UPDATE policies
DROP POLICY IF EXISTS "Authenticated users can insert generated questions" ON public.generated_questions;
DROP POLICY IF EXISTS "Authenticated users can update generated questions" ON public.generated_questions;

-- Create SECURITY DEFINER function for inserting generated questions
-- This allows the template engine to insert without giving all users direct write access
CREATE OR REPLACE FUNCTION public.insert_generated_question(
  p_template_id uuid,
  p_source_table text,
  p_generated_text text,
  p_correct_answer text,
  p_wrong_options jsonb,
  p_explanation text,
  p_variables_used jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  -- Only authenticated users can call this
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.generated_questions (
    template_id, source_table, generated_text, correct_answer,
    wrong_options, explanation, variables_used
  ) VALUES (
    p_template_id, p_source_table, p_generated_text, p_correct_answer,
    p_wrong_options, p_explanation, p_variables_used
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Create SECURITY DEFINER function for incrementing stats
CREATE OR REPLACE FUNCTION public.increment_generated_question_stats(
  p_id uuid,
  p_was_correct boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.generated_questions
  SET used_count = COALESCE(used_count, 0) + 1,
      correct_count = CASE WHEN p_was_correct THEN COALESCE(correct_count, 0) + 1 ELSE COALESCE(correct_count, 0) END
  WHERE id = p_id;
END;
$$;

-- Only admins can directly INSERT/UPDATE generated_questions
CREATE POLICY "Admins can insert generated questions"
  ON public.generated_questions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update generated questions"
  ON public.generated_questions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- Fix 2: ctf_teams - restrict SELECT to members/captains/admins
-- Non-members should use ctf_teams_public view
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can view teams" ON public.ctf_teams;

CREATE POLICY "Team members and admins can view teams"
  ON public.ctf_teams FOR SELECT TO authenticated
  USING (
    auth.uid() = captain_id
    OR EXISTS (
      SELECT 1 FROM public.ctf_team_members
      WHERE team_id = ctf_teams.id AND user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );
