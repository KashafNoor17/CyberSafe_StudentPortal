
-- Fix 1: Drop overly permissive RLS policies on password_reset_attempts
-- The edge function uses service_role_key which bypasses RLS, so these are unnecessary
DROP POLICY IF EXISTS "Allow select for reset attempts" ON public.password_reset_attempts;
DROP POLICY IF EXISTS "Allow insert for reset attempts" ON public.password_reset_attempts;

-- Fix 2: Replace broken study_group_messages SELECT policy with proper membership check
DROP POLICY IF EXISTS "Members can view messages" ON public.study_group_messages;
CREATE POLICY "Members can view messages" ON public.study_group_messages
  FOR SELECT TO authenticated
  USING (group_id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid()));
