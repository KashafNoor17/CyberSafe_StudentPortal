
-- LMS Connections
CREATE TABLE public.lms_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  lms_type text NOT NULL DEFAULT 'canvas',
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  settings jsonb NOT NULL DEFAULT '{}',
  lms_base_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lms_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can manage LMS connections" ON public.lms_connections
  FOR ALL TO authenticated
  USING (is_org_admin(auth.uid(), university_id))
  WITH CHECK (is_org_admin(auth.uid(), university_id));

CREATE POLICY "Org members can view LMS connections" ON public.lms_connections
  FOR SELECT TO authenticated
  USING (is_org_member(auth.uid(), university_id));

-- LMS Courses
CREATE TABLE public.lms_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid REFERENCES public.lms_connections(id) ON DELETE CASCADE NOT NULL,
  lms_course_id text NOT NULL,
  name text NOT NULL,
  term text,
  enrollment_count integer NOT NULL DEFAULT 0,
  instructor_id uuid,
  last_synced timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lms_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view LMS courses" ON public.lms_courses
  FOR SELECT TO authenticated
  USING (connection_id IN (
    SELECT id FROM public.lms_connections WHERE is_org_member(auth.uid(), university_id)
  ));

CREATE POLICY "Org admins can manage LMS courses" ON public.lms_courses
  FOR ALL TO authenticated
  USING (connection_id IN (
    SELECT id FROM public.lms_connections WHERE is_org_admin(auth.uid(), university_id)
  ));

-- LMS Assignments
CREATE TABLE public.lms_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.lms_courses(id) ON DELETE CASCADE NOT NULL,
  module_id uuid REFERENCES public.learning_modules(id) ON DELETE CASCADE NOT NULL,
  lms_assignment_id text,
  due_date timestamptz,
  points_possible numeric NOT NULL DEFAULT 100,
  credit_value numeric NOT NULL DEFAULT 0.25,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lms_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view assignments" ON public.lms_assignments
  FOR SELECT TO authenticated
  USING (course_id IN (
    SELECT lc.id FROM public.lms_courses lc
    JOIN public.lms_connections conn ON lc.connection_id = conn.id
    WHERE is_org_member(auth.uid(), conn.university_id)
  ));

CREATE POLICY "Org admins can manage assignments" ON public.lms_assignments
  FOR ALL TO authenticated
  USING (course_id IN (
    SELECT lc.id FROM public.lms_courses lc
    JOIN public.lms_connections conn ON lc.connection_id = conn.id
    WHERE is_org_admin(auth.uid(), conn.university_id)
  ));

-- LMS Grade Sync
CREATE TABLE public.lms_grade_sync (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  assignment_id uuid REFERENCES public.lms_assignments(id) ON DELETE CASCADE NOT NULL,
  grade numeric,
  credit_earned numeric NOT NULL DEFAULT 0,
  synced_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lms_grade_sync ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own grades" ON public.lms_grade_sync
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage grade sync" ON public.lms_grade_sync
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Org admins can manage grades" ON public.lms_grade_sync
  FOR ALL TO authenticated
  USING (assignment_id IN (
    SELECT a.id FROM public.lms_assignments a
    JOIN public.lms_courses lc ON a.course_id = lc.id
    JOIN public.lms_connections conn ON lc.connection_id = conn.id
    WHERE is_org_admin(auth.uid(), conn.university_id)
  ));
