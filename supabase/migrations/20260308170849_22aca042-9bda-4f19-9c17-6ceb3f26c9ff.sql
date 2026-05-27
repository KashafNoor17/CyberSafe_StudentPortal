
-- Fix overly permissive RLS policies by tightening WITH CHECK clauses
DROP POLICY IF EXISTS "Admins can manage LMS courses" ON public.lms_courses;
DROP POLICY IF EXISTS "Admins can manage LMS assignments" ON public.lms_assignments;

CREATE POLICY "Admins can manage LMS courses" ON public.lms_courses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage LMS assignments" ON public.lms_assignments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Also fix the SELECT policies that had USING(true) for non-admin write
DROP POLICY IF EXISTS "Authenticated users can view LMS courses" ON public.lms_courses;
DROP POLICY IF EXISTS "Authenticated users can view LMS assignments" ON public.lms_assignments;

CREATE POLICY "Authenticated users can view LMS courses" ON public.lms_courses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view LMS assignments" ON public.lms_assignments
  FOR SELECT TO authenticated USING (true);
