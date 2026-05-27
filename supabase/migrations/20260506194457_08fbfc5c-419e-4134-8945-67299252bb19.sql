
DROP POLICY IF EXISTS "Users can insert own reputation" ON public.reputation_log;

DROP POLICY IF EXISTS "Users read own gift certs" ON public.gift_certificates;

CREATE POLICY "Purchasers read own gift certs"
  ON public.gift_certificates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = purchaser_id);

CREATE OR REPLACE VIEW public.gift_certificates_redeemer_safe
WITH (security_invoker = true) AS
SELECT
  id,
  purchaser_id,
  redeemed_by,
  redeemed_at,
  delivery_date,
  created_at,
  status,
  amount,
  code
FROM public.gift_certificates
WHERE auth.uid() = redeemed_by OR auth.uid() = purchaser_id;
