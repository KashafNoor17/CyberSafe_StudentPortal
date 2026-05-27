
-- Study Groups
CREATE TABLE IF NOT EXISTS public.study_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    module_id UUID REFERENCES public.learning_modules(id),
    created_by UUID NOT NULL,
    max_members INTEGER DEFAULT 10,
    is_private BOOLEAN DEFAULT false,
    join_code VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.study_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('leader', 'co-leader', 'member')),
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.study_group_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    topic TEXT,
    meeting_link TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.study_group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Mentors
CREATE TABLE IF NOT EXISTS public.mentors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    bio TEXT,
    expertise_areas TEXT[],
    availability VARCHAR(50) DEFAULT 'weekly',
    max_mentees INTEGER DEFAULT 3,
    current_mentees INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mentorship_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentee_id UUID NOT NULL,
    mentor_id UUID REFERENCES public.mentors(id) NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    responded_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.mentorship_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES public.mentors(id) NOT NULL,
    mentee_id UUID NOT NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    topic TEXT,
    meeting_link TEXT,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    feedback TEXT,
    rating INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Community Challenges
CREATE TABLE IF NOT EXISTS public.community_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50),
    difficulty VARCHAR(20),
    flag_hash VARCHAR(255),
    hints JSONB DEFAULT '[]',
    file_attachments JSONB DEFAULT '[]',
    connection_info VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'featured')),
    review_notes TEXT,
    featured BOOLEAN DEFAULT false,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID
);

CREATE TABLE IF NOT EXISTS public.challenge_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    challenge_id UUID REFERENCES public.community_challenges(id) ON DELETE CASCADE NOT NULL,
    vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, challenge_id)
);

-- Expert Sessions
CREATE TABLE IF NOT EXISTS public.expert_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expert_name VARCHAR(100) NOT NULL,
    expert_bio TEXT,
    expert_avatar TEXT,
    topic VARCHAR(200),
    scheduled_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    max_attendees INTEGER DEFAULT 100,
    current_attendees INTEGER DEFAULT 0,
    meeting_link TEXT,
    recording_url TEXT,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.session_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.expert_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    registered_at TIMESTAMPTZ DEFAULT now(),
    attended BOOLEAN DEFAULT false,
    UNIQUE(session_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.session_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.expert_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    question TEXT NOT NULL,
    answered BOOLEAN DEFAULT false,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- University Groups
CREATE TABLE IF NOT EXISTS public.university_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_name VARCHAR(200) NOT NULL,
    university_domain VARCHAR(100),
    description TEXT,
    logo_url TEXT,
    created_by UUID NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.university_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.university_groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(group_id, user_id)
);

-- Community Events
CREATE TABLE IF NOT EXISTS public.community_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) DEFAULT 'general',
    scheduled_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.community_events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    registered_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, user_id)
);

-- Reputation System
CREATE TABLE IF NOT EXISTS public.reputation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    points INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- CTF Team Messages (realtime chat)
CREATE TABLE IF NOT EXISTS public.ctf_team_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.ctf_teams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable realtime for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_group_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ctf_team_messages;

-- RLS
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ctf_team_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Study Groups (public read, auth write)
CREATE POLICY "Anyone can view public study groups" ON public.study_groups FOR SELECT USING (NOT is_private OR created_by = auth.uid());
CREATE POLICY "Auth users can create study groups" ON public.study_groups FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Leaders can update their groups" ON public.study_groups FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Leaders can delete their groups" ON public.study_groups FOR DELETE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Members can view group members" ON public.study_group_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can join groups" ON public.study_group_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can leave groups" ON public.study_group_members FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Members can view sessions" ON public.study_group_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can create sessions" ON public.study_group_sessions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Members can view messages" ON public.study_group_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can send messages" ON public.study_group_messages FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Mentors (public read)
CREATE POLICY "Anyone can view active mentors" ON public.mentors FOR SELECT USING (is_active = true);
CREATE POLICY "Auth users can become mentors" ON public.mentors FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Mentors can update their profile" ON public.mentors FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can view their requests" ON public.mentorship_requests FOR SELECT TO authenticated USING (mentee_id = auth.uid() OR mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid()));
CREATE POLICY "Auth users can request mentorship" ON public.mentorship_requests FOR INSERT TO authenticated WITH CHECK (mentee_id = auth.uid());
CREATE POLICY "Mentors can respond to requests" ON public.mentorship_requests FOR UPDATE TO authenticated USING (mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their sessions" ON public.mentorship_sessions FOR SELECT TO authenticated USING (mentee_id = auth.uid() OR mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid()));
CREATE POLICY "Auth users can create mentorship sessions" ON public.mentorship_sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Participants can update sessions" ON public.mentorship_sessions FOR UPDATE TO authenticated USING (mentee_id = auth.uid() OR mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid()));

-- Community Challenges
CREATE POLICY "Anyone can view approved challenges" ON public.community_challenges FOR SELECT USING (status IN ('approved', 'featured') OR user_id = auth.uid());
CREATE POLICY "Auth users can create challenges" ON public.community_challenges FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their challenges" ON public.community_challenges FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Auth users can vote" ON public.challenge_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can cast votes" ON public.challenge_votes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can change votes" ON public.challenge_votes FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can remove votes" ON public.challenge_votes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Expert Sessions (public read)
CREATE POLICY "Anyone can view expert sessions" ON public.expert_sessions FOR SELECT USING (true);
CREATE POLICY "Admins can manage expert sessions" ON public.expert_sessions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update expert sessions" ON public.expert_sessions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view registrations" ON public.session_registrations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Auth users can register" ON public.session_registrations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can unregister" ON public.session_registrations FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Anyone can view session questions" ON public.session_questions FOR SELECT USING (true);
CREATE POLICY "Auth users can ask questions" ON public.session_questions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- University Groups (public read)
CREATE POLICY "Anyone can view university groups" ON public.university_groups FOR SELECT USING (true);
CREATE POLICY "Auth users can create university groups" ON public.university_groups FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Creators can update groups" ON public.university_groups FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Anyone can view uni members" ON public.university_group_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can join uni groups" ON public.university_group_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can leave uni groups" ON public.university_group_members FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Events (public read)
CREATE POLICY "Anyone can view events" ON public.community_events FOR SELECT USING (true);
CREATE POLICY "Auth users can create events" ON public.community_events FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Creators can update events" ON public.community_events FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can view event registrations" ON public.event_registrations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Auth users can register for events" ON public.event_registrations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can unregister from events" ON public.event_registrations FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Reputation
CREATE POLICY "Users can view their reputation" ON public.reputation_log FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System can insert reputation" ON public.reputation_log FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- CTF Team Messages
CREATE POLICY "Team members can view messages" ON public.ctf_team_messages FOR SELECT TO authenticated USING (team_id IN (SELECT team_id FROM public.ctf_team_members WHERE user_id = auth.uid()));
CREATE POLICY "Team members can send messages" ON public.ctf_team_messages FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND team_id IN (SELECT team_id FROM public.ctf_team_members WHERE user_id = auth.uid()));
