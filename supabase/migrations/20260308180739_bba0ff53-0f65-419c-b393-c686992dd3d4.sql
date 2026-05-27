
-- Research publications table
CREATE TABLE IF NOT EXISTS public.research_publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    authors TEXT NOT NULL,
    institution TEXT NOT NULL DEFAULT '',
    year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
    journal TEXT NOT NULL DEFAULT '',
    abstract TEXT NOT NULL DEFAULT '',
    doi TEXT DEFAULT '',
    dataset_used TEXT DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending',
    submitted_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Anonymized completions for research
CREATE TABLE IF NOT EXISTS public.anonymized_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID REFERENCES public.research_datasets(id) ON DELETE CASCADE,
    anonymized_user_id TEXT NOT NULL,
    module_id UUID,
    completed_at DATE,
    time_spent_minutes INTEGER DEFAULT 0,
    quiz_score NUMERIC(5,2) DEFAULT 0,
    attempts_before_complete INTEGER DEFAULT 1
);

-- Anonymized quiz attempts for research
CREATE TABLE IF NOT EXISTS public.anonymized_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID REFERENCES public.research_datasets(id) ON DELETE CASCADE,
    anonymized_user_id TEXT NOT NULL,
    module_id UUID,
    question_id UUID,
    is_correct BOOLEAN DEFAULT false,
    time_spent_seconds INTEGER DEFAULT 0,
    attempt_number INTEGER DEFAULT 1
);

-- Ethics review records
CREATE TABLE IF NOT EXISTS public.ethics_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.dataset_requests(id) ON DELETE CASCADE,
    reviewer_id UUID,
    risk_level TEXT DEFAULT 'low',
    decision TEXT DEFAULT 'pending',
    comments TEXT DEFAULT '',
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.research_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymized_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymized_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ethics_reviews ENABLE ROW LEVEL SECURITY;

-- Publications: anyone can read published, admins manage
CREATE POLICY "Anyone can read published publications" ON public.research_publications
    FOR SELECT USING (status = 'published');
CREATE POLICY "Authenticated users can submit publications" ON public.research_publications
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins manage publications" ON public.research_publications
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Anonymized data: admins only
CREATE POLICY "Admins manage anonymized completions" ON public.anonymized_completions
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage anonymized quiz attempts" ON public.anonymized_quiz_attempts
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Ethics reviews: admins only
CREATE POLICY "Admins manage ethics reviews" ON public.ethics_reviews
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
