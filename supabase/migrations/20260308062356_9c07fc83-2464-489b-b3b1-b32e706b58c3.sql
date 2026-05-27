
-- Spaced repetition items for knowledge retention
CREATE TABLE public.spaced_repetition_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.module_quizzes(id) ON DELETE CASCADE,
    easiness_factor DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    interval_days INTEGER NOT NULL DEFAULT 1,
    repetitions INTEGER NOT NULL DEFAULT 0,
    next_review_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    quality_history INTEGER[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, question_id)
);

ALTER TABLE public.spaced_repetition_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own SR items"
ON public.spaced_repetition_items FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- User learning preferences for personalization
CREATE TABLE public.user_learning_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    preferred_difficulty TEXT NOT NULL DEFAULT 'medium',
    preferred_session_minutes INTEGER NOT NULL DEFAULT 15,
    preferred_time_of_day TEXT NOT NULL DEFAULT 'anytime',
    learning_goal TEXT DEFAULT 'certificate',
    personalization_enabled BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_learning_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
ON public.user_learning_preferences FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
