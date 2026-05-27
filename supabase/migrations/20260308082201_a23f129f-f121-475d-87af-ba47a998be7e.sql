
-- Cyber Range Infrastructure Tables
CREATE TABLE public.cyber_labs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  difficulty text NOT NULL DEFAULT 'easy',
  duration_minutes integer NOT NULL DEFAULT 120,
  environment_type text NOT NULL DEFAULT 'docker',
  docker_image text,
  cpu integer NOT NULL DEFAULT 1,
  memory integer NOT NULL DEFAULT 512,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.lab_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lab_id uuid NOT NULL REFERENCES public.cyber_labs(id) ON DELETE CASCADE,
  instance_id text NOT NULL DEFAULT gen_random_uuid()::text,
  connection_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'starting',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '2 hours'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.lab_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lab_instance_id uuid NOT NULL REFERENCES public.lab_instances(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  commands_log jsonb NOT NULL DEFAULT '[]'::jsonb
);

-- Add environment columns to ctf_challenges for lab-based challenges
ALTER TABLE public.ctf_challenges ADD COLUMN IF NOT EXISTS requires_instance boolean NOT NULL DEFAULT false;
ALTER TABLE public.ctf_challenges ADD COLUMN IF NOT EXISTS lab_id uuid REFERENCES public.cyber_labs(id);
ALTER TABLE public.ctf_challenges ADD COLUMN IF NOT EXISTS connection_info jsonb NOT NULL DEFAULT '{}'::jsonb;

-- RLS for cyber_labs
ALTER TABLE public.cyber_labs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active labs" ON public.cyber_labs FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage labs" ON public.cyber_labs FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for lab_instances
ALTER TABLE public.lab_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own instances" ON public.lab_instances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create instances" ON public.lab_instances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own instances" ON public.lab_instances FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all instances" ON public.lab_instances FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for lab_sessions
ALTER TABLE public.lab_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sessions" ON public.lab_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all sessions" ON public.lab_sessions FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
