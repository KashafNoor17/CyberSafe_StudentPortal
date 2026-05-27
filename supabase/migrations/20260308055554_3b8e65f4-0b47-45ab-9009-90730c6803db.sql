
-- Friend system tables

CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  friend_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  friend_nickname text,
  UNIQUE(user_id, friend_id),
  CONSTRAINT friendships_no_self CHECK (user_id != friend_id),
  CONSTRAINT friendships_status_check CHECK (status IN ('pending', 'accepted', 'blocked'))
);

CREATE TABLE public.friend_activity_visibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  profile_visibility text NOT NULL DEFAULT 'public',
  activity_visibility text NOT NULL DEFAULT 'friends_only',
  progress_visibility text NOT NULL DEFAULT 'friends_only',
  badges_visibility text NOT NULL DEFAULT 'public',
  online_status_visibility text NOT NULL DEFAULT 'friends_only',
  friend_request_setting text NOT NULL DEFAULT 'everyone',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT visibility_check CHECK (
    profile_visibility IN ('public', 'friends_only', 'private') AND
    activity_visibility IN ('public', 'friends_only', 'private') AND
    progress_visibility IN ('public', 'friends_only', 'private') AND
    badges_visibility IN ('public', 'friends_only', 'private') AND
    online_status_visibility IN ('everyone', 'friends_only', 'nobody') AND
    friend_request_setting IN ('everyone', 'friends_of_friends', 'nobody')
  )
);

CREATE TABLE public.friend_activity_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_log_id uuid NOT NULL REFERENCES public.user_activity_log(id) ON DELETE CASCADE,
  emoji text NOT NULL DEFAULT '👍',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_log_id, emoji)
);

CREATE INDEX idx_friendships_user ON public.friendships(user_id);
CREATE INDEX idx_friendships_friend ON public.friendships(friend_id);
CREATE INDEX idx_friendships_status ON public.friendships(status);
CREATE INDEX idx_friend_reactions_activity ON public.friend_activity_reactions(activity_log_id);

CREATE OR REPLACE FUNCTION public.are_friends(_user_id uuid, _friend_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
    AND (
      (user_id = _user_id AND friend_id = _friend_id) OR
      (user_id = _friend_id AND friend_id = _user_id)
    )
  )
$$;

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_activity_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_activity_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can send friend requests"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Users can update friendships they are part of"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete own friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Admins can manage all friendships"
  ON public.friendships FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage own visibility"
  ON public.friend_activity_visibility FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view visibility settings"
  ON public.friend_activity_visibility FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own reactions"
  ON public.friend_activity_reactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view reactions on visible activities"
  ON public.friend_activity_reactions FOR SELECT
  USING (true);

CREATE POLICY "Friends can view friend profiles"
  ON public.profiles FOR SELECT
  USING (are_friends(auth.uid(), user_id));
