
-- Fix overly permissive RLS policies
DROP POLICY IF EXISTS "Members can view sessions" ON public.study_group_sessions;
CREATE POLICY "Members can view sessions" ON public.study_group_sessions FOR SELECT TO authenticated 
  USING (group_id IN (SELECT group_id FROM public.study_group_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Auth users can create sessions" ON public.study_group_sessions;
CREATE POLICY "Leaders can create sessions" ON public.study_group_sessions FOR INSERT TO authenticated 
  WITH CHECK (group_id IN (SELECT group_id FROM public.study_group_members WHERE user_id = auth.uid() AND role IN ('leader', 'co-leader')));

DROP POLICY IF EXISTS "Auth users can create mentorship sessions" ON public.mentorship_sessions;
CREATE POLICY "Mentors can create mentorship sessions" ON public.mentorship_sessions FOR INSERT TO authenticated 
  WITH CHECK (mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Auth users can ask questions" ON public.session_questions;
CREATE POLICY "Registered users can ask questions" ON public.session_questions FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid() AND session_id IN (SELECT session_id FROM public.session_registrations WHERE user_id = auth.uid()));
