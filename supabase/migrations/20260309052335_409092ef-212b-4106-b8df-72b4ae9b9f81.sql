
-- Fix 1: referral_tracking - replace WITH CHECK (true) INSERT
DROP POLICY IF EXISTS "Anyone can insert referral tracking" ON public.referral_tracking;
CREATE POLICY "Authenticated can insert referral tracking"
  ON public.referral_tracking FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = referrer_id);

-- Fix 2: scholarship_applications - drop the WITH CHECK (true) duplicate
DROP POLICY IF EXISTS "Anyone can insert scholarship apps" ON public.scholarship_applications;

-- Fix 3: translation_memory - replace WITH CHECK (true) INSERT
DROP POLICY IF EXISTS "Translation memory insertable by authenticated" ON public.translation_memory;
CREATE POLICY "Authenticated can insert translation memory"
  ON public.translation_memory FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Fix 4: university_partnerships - drop both WITH CHECK (true) INSERTs
DROP POLICY IF EXISTS "Anyone can insert partnership requests" ON public.university_partnerships;
DROP POLICY IF EXISTS "Authenticated can submit partnership request" ON public.university_partnerships;
CREATE POLICY "Authenticated can submit partnership request"
  ON public.university_partnerships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Fix 5: password_reset_attempts - add deny-all policy (service_role bypasses RLS)
CREATE POLICY "Deny all direct access"
  ON public.password_reset_attempts FOR ALL TO authenticated, anon
  USING (false) WITH CHECK (false);

-- Fix 6: community_challenges - create safe view excluding flag_hash
CREATE OR REPLACE VIEW public.community_challenges_safe
WITH (security_invoker = on) AS
  SELECT id, user_id, title, description, category, difficulty,
         hints, connection_info, status, featured, upvotes, downvotes,
         created_at, reviewed_at, reviewed_by, review_notes, file_attachments
  FROM public.community_challenges;
