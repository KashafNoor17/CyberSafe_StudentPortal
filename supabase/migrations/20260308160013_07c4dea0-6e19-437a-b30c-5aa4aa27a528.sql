-- Add rich content columns to weekly_tips
ALTER TABLE public.weekly_tips
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS detailed_text text,
  ADD COLUMN IF NOT EXISTS why_it_matters text,
  ADD COLUMN IF NOT EXISTS action_step text,
  ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'beginner',
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS helpful_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS viewed_count integer DEFAULT 0;

-- Create user tip history for tracking views and helpful marks
CREATE TABLE IF NOT EXISTS public.user_tip_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tip_id uuid NOT NULL REFERENCES public.weekly_tips(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  marked_helpful boolean DEFAULT false,
  UNIQUE(user_id, tip_id)
);

ALTER TABLE public.user_tip_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tip history"
  ON public.user_tip_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tip history"
  ON public.user_tip_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tip history"
  ON public.user_tip_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);