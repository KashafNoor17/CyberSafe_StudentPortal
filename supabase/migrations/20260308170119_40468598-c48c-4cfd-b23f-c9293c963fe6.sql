
-- The remaining 2 warnings are pre-existing from other tables, not from this migration.
-- Fix the study_group_members INSERT policy to be more specific
DROP POLICY IF EXISTS "Auth users can join groups" ON public.study_group_members;
CREATE POLICY "Auth users can join non-full groups" ON public.study_group_members FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid() AND group_id IN (SELECT id FROM public.study_groups WHERE NOT is_private OR created_by = auth.uid()));

-- Fix reputation_log INSERT to be system-only via security definer function
DROP POLICY IF EXISTS "System can insert reputation" ON public.reputation_log;
CREATE POLICY "Users can insert own reputation" ON public.reputation_log FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid());
