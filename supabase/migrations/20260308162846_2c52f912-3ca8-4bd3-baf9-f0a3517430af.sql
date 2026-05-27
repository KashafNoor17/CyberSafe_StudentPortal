-- Add prerequisite and recommendation columns to learning_modules
ALTER TABLE public.learning_modules
  ADD COLUMN IF NOT EXISTS prerequisites uuid[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS recommended_order integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pdf_summary jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_modules uuid[] DEFAULT '{}';

-- Create module_feedback table
CREATE TABLE IF NOT EXISTS public.module_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module_id uuid NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  rating integer NOT NULL,
  easy_to_understand text,
  most_helpful text,
  improvement_suggestions text,
  would_recommend boolean,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Validation trigger for rating
CREATE OR REPLACE FUNCTION public.validate_module_feedback_rating()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_module_feedback_rating
  BEFORE INSERT OR UPDATE ON public.module_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_module_feedback_rating();

-- RLS for module_feedback
ALTER TABLE public.module_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback"
  ON public.module_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
  ON public.module_feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback"
  ON public.module_feedback FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Public read for aggregate stats
CREATE POLICY "Anyone can read feedback for aggregates"
  ON public.module_feedback FOR SELECT
  TO anon
  USING (true);