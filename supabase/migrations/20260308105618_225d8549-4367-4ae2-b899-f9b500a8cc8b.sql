
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS display_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS location VARCHAR(100),
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"theme":"system","language":"en","auto_play_videos":true,"show_reminders":true,"public_profile":false,"high_contrast":false,"reduce_motion":false,"large_text":false}'::jsonb,
  ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"email":{"module_complete":true,"badge_earned":true,"certificate_ready":true,"community_replies":false,"friend_requests":false,"weekly_report":false,"product_updates":false,"marketing":false},"push":{"learning_reminders":true,"streak_alerts":true,"community_posts":false,"friend_activity":false},"frequency":"daily"}'::jsonb;

-- Create avatar storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: Users can upload their own avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Users can update their own avatars
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Users can delete their own avatars
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Anyone can view avatars (public bucket)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
