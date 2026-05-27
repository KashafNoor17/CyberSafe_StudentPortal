-- Drop the overly permissive anon policy and make it more specific
DROP POLICY IF EXISTS "Anyone can read feedback for aggregates" ON public.module_feedback;

-- Instead, allow authenticated users to read all feedback (for showing avg ratings)
CREATE POLICY "Authenticated users can view all feedback"
  ON public.module_feedback FOR SELECT
  TO authenticated
  USING (true);