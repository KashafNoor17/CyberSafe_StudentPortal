
-- 1. Drop overly permissive SELECT on quiz_questions (admin-only policy remains)
DROP POLICY IF EXISTS "Anyone can view quiz questions" ON public.quiz_questions;

-- 2. Restrict generated_questions SELECT to admins (contains correct_answer)
DROP POLICY IF EXISTS "Authenticated users can read generated questions" ON public.generated_questions;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='generated_questions' AND policyname='Only admins select generated_questions') THEN
    CREATE POLICY "Only admins select generated_questions"
      ON public.generated_questions FOR SELECT TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- 3. Restrict lms_connections SELECT to admins only (tokens are sensitive)
DROP POLICY IF EXISTS "Org admins can view lms connections" ON public.lms_connections;
DROP POLICY IF EXISTS "Org admins can read lms_connections" ON public.lms_connections;
DROP POLICY IF EXISTS "Admins can view lms connections" ON public.lms_connections;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lms_connections' AND policyname='Only platform admins select lms_connections') THEN
    CREATE POLICY "Only platform admins select lms_connections"
      ON public.lms_connections FOR SELECT TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- 4. Drop user SELECT on student_verification_tokens (raw token must not be re-readable)
DROP POLICY IF EXISTS "Users can view their own verification tokens" ON public.student_verification_tokens;
DROP POLICY IF EXISTS "Users can read own verification tokens" ON public.student_verification_tokens;
DROP POLICY IF EXISTS "Users view own verification tokens" ON public.student_verification_tokens;

-- 5. Drop self-insert on reputation_log (only server-side RPCs should award reputation)
DROP POLICY IF EXISTS "Users can insert their own reputation" ON public.reputation_log;
DROP POLICY IF EXISTS "Users can insert own reputation log" ON public.reputation_log;
DROP POLICY IF EXISTS "Users insert own reputation" ON public.reputation_log;
