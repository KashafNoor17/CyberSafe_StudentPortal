
-- Fix overly permissive policies
DROP POLICY IF EXISTS "Translations insertable by authenticated" ON public.translations;
CREATE POLICY "Translations insertable by own user" ON public.translations FOR INSERT TO authenticated WITH CHECK (translated_by = auth.uid());

DROP POLICY IF EXISTS "Translation memory insertable by authenticated" ON public.translation_memory;
CREATE POLICY "Translation memory insertable by authenticated" ON public.translation_memory FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Translator apps insertable by authenticated" ON public.translator_applications;
CREATE POLICY "Translator apps insertable by own user" ON public.translator_applications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
