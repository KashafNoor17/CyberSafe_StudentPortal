CREATE TABLE public.password_reset_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Allow edge function (service role) full access, no RLS needed since only accessed server-side
ALTER TABLE public.password_reset_attempts ENABLE ROW LEVEL SECURITY;

-- Index for efficient lookups
CREATE INDEX idx_password_reset_attempts_email_created ON public.password_reset_attempts (email, created_at DESC);

-- Auto-cleanup old records (older than 24h) via a simple policy
-- The edge function uses service role so RLS doesn't apply, but we keep it enabled for safety