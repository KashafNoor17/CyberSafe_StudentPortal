
CREATE TABLE public.scholarship_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email TEXT NOT NULL,
  university TEXT NOT NULL DEFAULT '',
  reason TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scholarship_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit scholarship application"
  ON public.scholarship_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own applications"
  ON public.scholarship_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all applications"
  ON public.scholarship_applications FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.university_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_name TEXT NOT NULL,
  department TEXT DEFAULT '',
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT DEFAULT '',
  estimated_students TEXT DEFAULT '',
  current_lms TEXT DEFAULT '',
  interests TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.university_partnerships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit partnership request"
  ON public.university_partnerships FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage partnerships"
  ON public.university_partnerships FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));
