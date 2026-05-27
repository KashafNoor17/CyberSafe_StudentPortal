
-- Feedback table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  category TEXT NOT NULL DEFAULT 'general',
  feedback_type TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  rating INTEGER,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'medium',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback" ON public.feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anon can submit feedback" ON public.feedback FOR INSERT TO anon WITH CHECK (user_id IS NULL);
CREATE POLICY "Users can view own feedback" ON public.feedback FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own feedback" ON public.feedback FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all feedback" ON public.feedback FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Module surveys table
CREATE TABLE public.module_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  clarity TEXT,
  most_helpful TEXT,
  improvement TEXT,
  would_recommend BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.module_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit surveys" ON public.module_surveys FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own surveys" ON public.module_surveys FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all surveys" ON public.module_surveys FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Beta signups table
CREATE TABLE public.beta_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  experience_level TEXT NOT NULL DEFAULT 'beginner',
  device_type TEXT NOT NULL DEFAULT 'desktop',
  consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can sign up for beta" ON public.beta_signups FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anon can sign up for beta" ON public.beta_signups FOR INSERT TO anon WITH CHECK (user_id IS NULL);
CREATE POLICY "Admins can manage beta signups" ON public.beta_signups FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_feedback_category ON public.feedback(category);
CREATE INDEX idx_feedback_status ON public.feedback(status);
CREATE INDEX idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX idx_feedback_created_at ON public.feedback(created_at DESC);
CREATE INDEX idx_module_surveys_module_id ON public.module_surveys(module_id);
CREATE INDEX idx_module_surveys_user_id ON public.module_surveys(user_id);
CREATE INDEX idx_beta_signups_email ON public.beta_signups(email);
