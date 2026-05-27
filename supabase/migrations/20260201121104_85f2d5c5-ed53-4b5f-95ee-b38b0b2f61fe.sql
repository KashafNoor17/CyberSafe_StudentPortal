-- Step 1: Add missing columns to learning_modules table
ALTER TABLE public.learning_modules 
ADD COLUMN IF NOT EXISTS difficulty text NOT NULL DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS estimated_minutes integer NOT NULL DEFAULT 10;

-- Step 2: Create module_sections table for structured content
CREATE TABLE public.module_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id uuid NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  content_type text NOT NULL DEFAULT 'text',
  content text NOT NULL DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Step 3: Create user_module_progress table for detailed progress tracking
CREATE TABLE public.user_module_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  module_id uuid NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started',
  completed_at timestamp with time zone,
  last_accessed timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS on new tables
ALTER TABLE public.module_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for module_sections (anyone can view, admins can manage)
CREATE POLICY "Anyone can view module sections" 
ON public.module_sections 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage module sections" 
ON public.module_sections 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_module_progress
CREATE POLICY "Users can view their own progress" 
ON public.user_module_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
ON public.user_module_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.user_module_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" 
ON public.user_module_progress 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));