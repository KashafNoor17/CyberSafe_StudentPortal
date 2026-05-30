-- Create rate_limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  reset_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint ON public.rate_limits (ip_address, endpoint);

-- Enable RLS and deny all direct public/anon/authenticated access
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny all public access to rate_limits" ON public.rate_limits;
CREATE POLICY "Deny all public access to rate_limits"
  ON public.rate_limits FOR ALL TO authenticated, anon
  USING (false) WITH CHECK (false);

-- Create a database-level signup rate limit checker trigger
CREATE OR REPLACE FUNCTION public.check_signup_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_ip TEXT;
  v_headers TEXT;
  v_count INTEGER;
  v_limit INTEGER := 3; -- Max 3 signups per hour
  v_window INTERVAL := INTERVAL '1 hour';
  v_reset_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Retrieve request headers set by Supabase Auth API
  BEGIN
    v_headers := current_setting('request.headers', true);
  EXCEPTION WHEN OTHERS THEN
    v_headers := NULL;
  END;

  -- Extract client IP address from x-forwarded-for header
  IF v_headers IS NOT NULL AND v_headers <> '' THEN
    v_ip := (v_headers::json)->>'x-forwarded-for';
    -- Extract first IP if it's a comma-separated list
    IF v_ip IS NOT NULL AND v_ip LIKE '%,%' THEN
      v_ip := trim(split_part(v_ip, ',', 1));
    END IF;
  END IF;

  -- Fallback if no IP found
  IF v_ip IS NULL OR v_ip = '' THEN
    v_ip := 'unknown_db_trigger';
  END IF;

  -- Delete expired entries for signup rate limiting for this IP
  DELETE FROM public.rate_limits 
  WHERE endpoint = 'signup' AND reset_at < now();

  -- Get current request count
  SELECT request_count, reset_at INTO v_count, v_reset_at
  FROM public.rate_limits
  WHERE ip_address = v_ip AND endpoint = 'signup';

  IF v_count IS NOT NULL THEN
    IF v_count >= v_limit THEN
      RAISE EXCEPTION 'Signup rate limit exceeded. Please try again in % minutes.', CEIL(EXTRACT(EPOCH FROM (v_reset_at - now())) / 60);
    ELSE
      UPDATE public.rate_limits
      SET request_count = v_count + 1
      WHERE ip_address = v_ip AND endpoint = 'signup';
    END IF;
  ELSE
    INSERT INTO public.rate_limits (ip_address, endpoint, request_count, reset_at)
    VALUES (v_ip, 'signup', 1, now() + v_window);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users before insert
DROP TRIGGER IF EXISTS tr_check_signup_rate_limit ON auth.users;
CREATE TRIGGER tr_check_signup_rate_limit
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.check_signup_rate_limit();
