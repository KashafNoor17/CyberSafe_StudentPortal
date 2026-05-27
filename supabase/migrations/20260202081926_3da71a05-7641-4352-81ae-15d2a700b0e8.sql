-- Create module_quizzes table for quiz questions
CREATE TABLE public.module_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  explanation TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.module_quizzes ENABLE ROW LEVEL SECURITY;

-- Anyone can view quiz questions
CREATE POLICY "Anyone can view quiz questions"
  ON public.module_quizzes
  FOR SELECT
  USING (true);

-- Admins can manage quiz questions
CREATE POLICY "Admins can manage quiz questions"
  ON public.module_quizzes
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create user_quiz_answers table to track user responses
CREATE TABLE public.user_quiz_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.module_quizzes(id) ON DELETE CASCADE,
  selected_answer CHAR(1) NOT NULL CHECK (selected_answer IN ('a', 'b', 'c', 'd')),
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, quiz_id)
);

-- Enable RLS
ALTER TABLE public.user_quiz_answers ENABLE ROW LEVEL SECURITY;

-- Users can view their own answers
CREATE POLICY "Users can view their own quiz answers"
  ON public.user_quiz_answers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own answers
CREATE POLICY "Users can insert their own quiz answers"
  ON public.user_quiz_answers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own answers
CREATE POLICY "Users can update their own quiz answers"
  ON public.user_quiz_answers
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all answers
CREATE POLICY "Admins can view all quiz answers"
  ON public.user_quiz_answers
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));