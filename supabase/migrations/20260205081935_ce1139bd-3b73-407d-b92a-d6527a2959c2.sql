-- Fix the overly permissive notification INSERT policy
DROP POLICY IF EXISTS "System can create notifications" ON public.forum_notifications;

-- Create a more restrictive notification policy - only for authenticated users creating notifications for others
CREATE POLICY "Authenticated users can create notifications" ON public.forum_notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON public.forum_notifications
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);