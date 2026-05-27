
-- LMS Connections table
CREATE TABLE IF NOT EXISTS public.lms_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_name TEXT NOT NULL,
    lms_type TEXT NOT NULL DEFAULT 'canvas',
    lms_domain TEXT NOT NULL,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- LMS Courses table
CREATE TABLE IF NOT EXISTS public.lms_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES public.lms_connections(id) ON DELETE CASCADE,
    lms_course_id TEXT NOT NULL,
    name TEXT NOT NULL,
    course_code TEXT,
    term TEXT,
    enrollment_count INTEGER DEFAULT 0,
    last_synced TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- LMS Assignments table (maps platform modules to LMS assignments)
CREATE TABLE IF NOT EXISTS public.lms_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.lms_courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    lms_assignment_id TEXT,
    due_date TIMESTAMPTZ,
    points_possible INTEGER DEFAULT 100,
    weight NUMERIC(5,2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- LMS Grade Sync log
CREATE TABLE IF NOT EXISTS public.lms_grade_sync (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.lms_assignments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lms_user_id TEXT,
    grade NUMERIC(5,2),
    feedback TEXT,
    synced_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending'
);

-- Professor Courses table
CREATE TABLE IF NOT EXISTS public.professor_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lms_course_id UUID REFERENCES public.lms_courses(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    code TEXT,
    semester TEXT,
    year INTEGER,
    start_date DATE,
    end_date DATE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Course Enrollments
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.professor_courses(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lms_enrollment_id TEXT,
    enrollment_date TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'active',
    UNIQUE(course_id, student_id)
);

-- Course Modules (professor assigns modules to their course)
CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.professor_courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
    required BOOLEAN DEFAULT true,
    due_date DATE,
    points_possible INTEGER DEFAULT 100,
    order_index INTEGER DEFAULT 0,
    UNIQUE(course_id, module_id)
);

-- Transcript records
CREATE TABLE IF NOT EXISTS public.transcript_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.professor_courses(id) ON DELETE SET NULL,
    module_id UUID REFERENCES public.learning_modules(id) ON DELETE SET NULL,
    credits_earned NUMERIC(5,2) DEFAULT 0,
    grade_percent NUMERIC(5,2),
    letter_grade TEXT,
    completed_at TIMESTAMPTZ,
    verification_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.lms_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_grade_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcript_records ENABLE ROW LEVEL SECURITY;

-- RLS policies: Authenticated users can read their own data
CREATE POLICY "Users can view their own grade sync" ON public.lms_grade_sync FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view their own enrollments" ON public.course_enrollments FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Users can view their own transcripts" ON public.transcript_records FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Professors can manage their own courses
CREATE POLICY "Professors can manage own courses" ON public.professor_courses FOR ALL TO authenticated USING (professor_id = auth.uid()) WITH CHECK (professor_id = auth.uid());
CREATE POLICY "Professors can view enrollments for own courses" ON public.course_enrollments FOR SELECT TO authenticated USING (course_id IN (SELECT id FROM public.professor_courses WHERE professor_id = auth.uid()));
CREATE POLICY "Professors can manage modules for own courses" ON public.course_modules FOR ALL TO authenticated USING (course_id IN (SELECT id FROM public.professor_courses WHERE professor_id = auth.uid())) WITH CHECK (course_id IN (SELECT id FROM public.professor_courses WHERE professor_id = auth.uid()));

-- Admins can manage LMS connections
CREATE POLICY "Admins can manage LMS connections" ON public.lms_connections FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage LMS courses" ON public.lms_courses FOR ALL TO authenticated USING (true) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage LMS assignments" ON public.lms_assignments FOR ALL TO authenticated USING (true) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public read for LMS courses (faculty/students need to see course info)
CREATE POLICY "Authenticated users can view LMS courses" ON public.lms_courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view LMS assignments" ON public.lms_assignments FOR SELECT TO authenticated USING (true);

-- Generate transcript verification IDs
CREATE OR REPLACE FUNCTION public.generate_transcript_verification_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.verification_id IS NULL THEN
    NEW.verification_id := 'TR-' || TO_CHAR(now(), 'YYYY') || '-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_transcript_verification_id
  BEFORE INSERT ON public.transcript_records
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_transcript_verification_id();
