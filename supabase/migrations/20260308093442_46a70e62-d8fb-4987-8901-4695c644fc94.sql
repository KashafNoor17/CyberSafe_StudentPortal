
-- Fix overly permissive insert on dataset_requests: require user_id match
DROP POLICY IF EXISTS "Anyone can submit request" ON public.dataset_requests;
CREATE POLICY "Authenticated can submit request" ON public.dataset_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
