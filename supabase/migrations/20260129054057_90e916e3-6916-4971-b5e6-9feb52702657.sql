-- Fix function search path warnings
CREATE OR REPLACE FUNCTION public.calculate_user_level(points integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN points >= 1000 THEN 'Expert'
    WHEN points >= 500 THEN 'Advanced'
    WHEN points >= 200 THEN 'Intermediate'
    WHEN points >= 50 THEN 'Beginner'
    ELSE 'Novice'
  END
$$;