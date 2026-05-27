-- Fix: password_reset_attempts - add permissive select for service usage
CREATE POLICY "Allow insert for reset attempts"
  ON public.password_reset_attempts FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Allow select for reset attempts"
  ON public.password_reset_attempts FOR SELECT
  TO authenticated, anon
  USING (true);