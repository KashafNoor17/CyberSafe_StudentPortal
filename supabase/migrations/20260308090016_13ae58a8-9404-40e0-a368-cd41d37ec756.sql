
-- AI Generated Content tracking
CREATE TABLE public.ai_generated_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL DEFAULT 'module',
  content_data jsonb NOT NULL DEFAULT '{}',
  prompt_used text NOT NULL DEFAULT '',
  model_version text NOT NULL DEFAULT 'gemini-3-flash-preview',
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  approved boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL
);

ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage AI content" ON public.ai_generated_content
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view approved content" ON public.ai_generated_content
  FOR SELECT TO authenticated
  USING (approved = true);

CREATE POLICY "Users can create AI content" ON public.ai_generated_content
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view own content" ON public.ai_generated_content
  FOR SELECT TO authenticated
  USING (auth.uid() = created_by);

-- Content Review Queue
CREATE TABLE public.content_review_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.ai_generated_content(id) ON DELETE CASCADE,
  content_type text NOT NULL DEFAULT 'module',
  generated_at timestamptz NOT NULL DEFAULT now(),
  priority text NOT NULL DEFAULT 'medium',
  assigned_reviewer uuid,
  status text NOT NULL DEFAULT 'pending',
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_review_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage review queue" ON public.content_review_queue
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own queued items" ON public.content_review_queue
  FOR SELECT TO authenticated
  USING (content_id IN (SELECT id FROM public.ai_generated_content WHERE created_by = auth.uid()));
