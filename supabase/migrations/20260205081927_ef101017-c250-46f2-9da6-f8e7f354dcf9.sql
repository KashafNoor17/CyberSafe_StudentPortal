-- Create forum_categories table
CREATE TABLE public.forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'MessageSquare',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum_posts table
CREATE TABLE public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_closed BOOLEAN DEFAULT false,
  is_solution_found BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum_replies table
CREATE TABLE public.forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum_votes table
CREATE TABLE public.forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT vote_target CHECK (
    (post_id IS NOT NULL AND reply_id IS NULL) OR 
    (post_id IS NULL AND reply_id IS NOT NULL)
  ),
  CONSTRAINT unique_post_vote UNIQUE (user_id, post_id),
  CONSTRAINT unique_reply_vote UNIQUE (user_id, reply_id)
);

-- Create forum_notifications table
CREATE TABLE public.forum_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_categories
CREATE POLICY "Anyone can view categories" ON public.forum_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.forum_categories
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for forum_posts
CREATE POLICY "Anyone can view posts" ON public.forum_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON public.forum_posts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON public.forum_posts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete posts" ON public.forum_posts
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for forum_replies
CREATE POLICY "Anyone can view replies" ON public.forum_replies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create replies" ON public.forum_replies
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies" ON public.forum_replies
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete replies" ON public.forum_replies
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for forum_votes
CREATE POLICY "Anyone can view votes" ON public.forum_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage their votes" ON public.forum_votes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for forum_notifications
CREATE POLICY "Users can view their own notifications" ON public.forum_notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.forum_notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.forum_notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Insert default categories
INSERT INTO public.forum_categories (name, description, icon, order_index) VALUES
  ('General Cybersecurity', 'General questions and discussions about cybersecurity', 'Shield', 1),
  ('Module Discussions', 'Questions about specific learning modules', 'BookOpen', 2),
  ('Ask for Help', 'Get help with cybersecurity issues', 'HelpCircle', 3),
  ('Share Resources', 'Share helpful articles, tools, or tips', 'Link', 4),
  ('Success Stories', 'Share your learning achievements', 'Trophy', 5);

-- Create trigger for updated_at on forum_posts
CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create trigger for updated_at on forum_replies
CREATE TRIGGER update_forum_replies_updated_at
  BEFORE UPDATE ON public.forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create function to notify on reply
CREATE OR REPLACE FUNCTION public.notify_on_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_post_author_id UUID;
  v_parent_reply_author_id UUID;
  v_post_title TEXT;
BEGIN
  -- Get post author and title
  SELECT user_id, title INTO v_post_author_id, v_post_title
  FROM forum_posts WHERE id = NEW.post_id;
  
  -- Notify post author if different from reply author
  IF v_post_author_id IS NOT NULL AND v_post_author_id != NEW.user_id THEN
    INSERT INTO forum_notifications (user_id, type, message, post_id, reply_id)
    VALUES (v_post_author_id, 'reply', 'Someone replied to your post: ' || v_post_title, NEW.post_id, NEW.id);
  END IF;
  
  -- If this is a reply to another reply, notify parent reply author
  IF NEW.parent_reply_id IS NOT NULL THEN
    SELECT user_id INTO v_parent_reply_author_id
    FROM forum_replies WHERE id = NEW.parent_reply_id;
    
    IF v_parent_reply_author_id IS NOT NULL AND v_parent_reply_author_id != NEW.user_id THEN
      INSERT INTO forum_notifications (user_id, type, message, post_id, reply_id)
      VALUES (v_parent_reply_author_id, 'reply_to_reply', 'Someone replied to your comment', NEW.post_id, NEW.id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for notifications
CREATE TRIGGER notify_on_forum_reply
  AFTER INSERT ON public.forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_reply();

-- Create indexes for performance
CREATE INDEX idx_forum_posts_category ON public.forum_posts(category_id);
CREATE INDEX idx_forum_posts_user ON public.forum_posts(user_id);
CREATE INDEX idx_forum_posts_created ON public.forum_posts(created_at DESC);
CREATE INDEX idx_forum_replies_post ON public.forum_replies(post_id);
CREATE INDEX idx_forum_replies_user ON public.forum_replies(user_id);
CREATE INDEX idx_forum_votes_post ON public.forum_votes(post_id);
CREATE INDEX idx_forum_votes_reply ON public.forum_votes(reply_id);
CREATE INDEX idx_forum_notifications_user ON public.forum_notifications(user_id, is_read);