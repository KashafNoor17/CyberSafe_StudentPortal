DROP POLICY IF EXISTS "Users manage own tokens" ON public.student_verification_tokens;

CREATE POLICY "Users can insert own verification tokens"
  ON public.student_verification_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);