-- DROP the security_invoker = true view and recreate it without security_invoker
-- This makes it security definer by default, allowing it to safely bypass profiles RLS for general rankings
DROP VIEW IF EXISTS public.leaderboard_view;

CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT 
  p.user_id,
  p.name,
  p.total_points,
  p.level,
  ROW_NUMBER() OVER (ORDER BY p.total_points DESC NULLS LAST) as rank
FROM public.profiles p
WHERE p.total_points > 0
ORDER BY p.total_points DESC NULLS LAST
LIMIT 100;

GRANT SELECT ON public.leaderboard_view TO authenticated;

-- Create public profiles view that excludes sensitive column "email"
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  id, 
  user_id, 
  name, 
  total_points, 
  level, 
  cyber_score, 
  created_at, 
  updated_at
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO authenticated, anon;

-- Drop the insecure policy that leaks other users' emails to logged-in users
DROP POLICY IF EXISTS "Authenticated users can view leaderboard data" ON public.profiles;

-- Remove insecure direct insert policy on notifications (system triggers bypass RLS anyway)
DROP POLICY IF EXISTS "System can create notifications" ON public.forum_notifications;

-- Create secure RPC function for solution marking
CREATE OR REPLACE FUNCTION public.mark_reply_as_solution(p_reply_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_id UUID;
  v_post_author_id UUID;
BEGIN
  -- Get post details from the reply
  SELECT post_id INTO v_post_id
  FROM forum_replies
  WHERE id = p_reply_id;
  
  IF v_post_id IS NULL THEN
    RAISE EXCEPTION 'Reply not found';
  END IF;
  
  SELECT user_id INTO v_post_author_id
  FROM forum_posts
  WHERE id = v_post_id;
  
  -- Check if the current user is the author of the parent post
  IF v_post_author_id IS NULL OR v_post_author_id != auth.uid() THEN
    RAISE EXCEPTION 'Only the post author can mark a reply as solution';
  END IF;
  
  -- Clear previous solution for this post
  UPDATE forum_replies
  SET is_solution = false
  WHERE post_id = v_post_id;
  
  -- Mark the specified reply as solution
  UPDATE forum_replies
  SET is_solution = true
  WHERE id = p_reply_id;
  
  -- Mark the post as solved
  UPDATE forum_posts
  SET is_solution_found = true
  WHERE id = v_post_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_reply_as_solution(UUID) TO authenticated;
