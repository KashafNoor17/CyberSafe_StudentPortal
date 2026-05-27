-- Restrict public submission forms to authenticated users
DROP POLICY IF EXISTS "Anyone can submit scholarship application" ON public.scholarship_applications;
CREATE POLICY "Authenticated can submit scholarship application"
  ON public.scholarship_applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can submit partnership request" ON public.university_partnerships;
CREATE POLICY "Authenticated can submit partnership request"
  ON public.university_partnerships FOR INSERT TO authenticated
  WITH CHECK (true);