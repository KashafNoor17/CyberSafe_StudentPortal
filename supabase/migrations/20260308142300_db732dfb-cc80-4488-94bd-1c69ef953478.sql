-- Phase 1: Add template columns to module_quizzes
ALTER TABLE public.module_quizzes
  ADD COLUMN IF NOT EXISTS is_template boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS template_text text,
  ADD COLUMN IF NOT EXISTS variable_definitions jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS correct_answer_template text,
  ADD COLUMN IF NOT EXISTS wrong_options_templates jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS explanation_template text,
  ADD COLUMN IF NOT EXISTS variable_examples jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS generation_count integer DEFAULT 0;

ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS is_template boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS template_text text,
  ADD COLUMN IF NOT EXISTS variable_definitions jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS correct_answer_template text,
  ADD COLUMN IF NOT EXISTS wrong_options_templates jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS explanation_template text,
  ADD COLUMN IF NOT EXISTS variable_examples jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS generation_count integer DEFAULT 0;

CREATE TABLE public.generated_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL,
  source_table text NOT NULL DEFAULT 'module_quizzes',
  generated_text text NOT NULL,
  correct_answer text NOT NULL,
  wrong_options jsonb NOT NULL DEFAULT '[]',
  explanation text,
  variables_used jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  used_count integer DEFAULT 0,
  correct_count integer DEFAULT 0
);

CREATE TABLE public.user_seen_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  generated_question_id uuid NOT NULL REFERENCES public.generated_questions(id) ON DELETE CASCADE,
  seen_at timestamptz DEFAULT now(),
  was_correct boolean,
  UNIQUE(user_id, generated_question_id)
);

CREATE INDEX idx_generated_questions_template ON public.generated_questions(template_id);
CREATE INDEX idx_generated_questions_source ON public.generated_questions(source_table, template_id);
CREATE INDEX idx_user_seen_questions_user ON public.user_seen_questions(user_id);

ALTER TABLE public.generated_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_seen_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read generated questions"
ON public.generated_questions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert generated questions"
ON public.generated_questions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update generated questions"
ON public.generated_questions FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users read own seen questions"
ON public.user_seen_questions FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users insert own seen questions"
ON public.user_seen_questions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own seen questions"
ON public.user_seen_questions FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.increment_template_usage(
  p_template_id uuid,
  p_source_table text DEFAULT 'module_quizzes'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_source_table = 'module_quizzes' THEN
    UPDATE module_quizzes 
    SET generation_count = COALESCE(generation_count, 0) + 1, last_generated_at = now()
    WHERE id = p_template_id;
  ELSIF p_source_table = 'quiz_questions' THEN
    UPDATE quiz_questions 
    SET generation_count = COALESCE(generation_count, 0) + 1, last_generated_at = now()
    WHERE id = p_template_id;
  END IF;
END;
$$;