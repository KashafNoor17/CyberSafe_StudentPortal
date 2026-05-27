-- Tighten generated_questions policies: only allow insert/update, not delete
-- The INSERT WITH CHECK(true) is intentional: any authenticated quiz-taker needs to store generated variations
-- But let's add admin-only DELETE and restrict UPDATE to incrementing counters only
CREATE POLICY "Admins can delete generated questions"
ON public.generated_questions FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));