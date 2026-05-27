
-- Performance indexes for scaling
-- Composite indexes for common query patterns

-- Profiles: fast lookup by points for leaderboard
CREATE INDEX IF NOT EXISTS idx_profiles_total_points_desc ON public.profiles (total_points DESC NULLS LAST);

-- Points log: fast aggregation by user and time
CREATE INDEX IF NOT EXISTS idx_points_log_user_created ON public.points_log (user_id, created_at DESC);

-- Module completions: fast count by user
CREATE INDEX IF NOT EXISTS idx_module_completions_user ON public.module_completions (user_id, module_id);

-- Quiz results: fast lookup by user and time
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_completed ON public.quiz_results (user_id, completed_at DESC);

-- Forum posts: fast category listing with recent first
CREATE INDEX IF NOT EXISTS idx_forum_posts_category_created ON public.forum_posts (category_id, created_at DESC);

-- Forum replies: fast post replies lookup
CREATE INDEX IF NOT EXISTS idx_forum_replies_post_created ON public.forum_replies (post_id, created_at DESC);

-- User activity log: fast time-range queries for analytics
CREATE INDEX IF NOT EXISTS idx_activity_log_type_created ON public.user_activity_log (activity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_created ON public.user_activity_log (user_id, created_at DESC);

-- User streaks: fast leaderboard of streaks
CREATE INDEX IF NOT EXISTS idx_user_streaks_current_desc ON public.user_streaks (current_streak DESC);

-- Certificates: fast verification lookup
CREATE INDEX IF NOT EXISTS idx_certificates_verification ON public.certificates (verification_id);
CREATE INDEX IF NOT EXISTS idx_certificates_cert_number ON public.certificates (certificate_number);

-- Daily aggregates: fast date range queries
CREATE INDEX IF NOT EXISTS idx_daily_aggregates_date ON public.daily_aggregates (date DESC);

-- Blog posts: fast published listing
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_created ON public.blog_posts (is_published, created_at DESC) WHERE is_published = true;
