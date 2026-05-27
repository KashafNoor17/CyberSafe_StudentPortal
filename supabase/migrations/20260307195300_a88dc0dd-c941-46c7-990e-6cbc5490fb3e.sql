
-- Performance indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_module_completions_user_id ON public.module_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_module_completions_module_id ON public.module_completions(module_id);
CREATE INDEX IF NOT EXISTS idx_points_log_user_id ON public.points_log(user_id);
CREATE INDEX IF NOT EXISTS idx_points_log_created_at ON public.points_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed_at ON public.quiz_results(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category_id ON public.forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON public.forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post_id ON public.forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_id ON public.certificates(verification_id);
CREATE INDEX IF NOT EXISTS idx_user_module_progress_user_id ON public.user_module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_modules_slug ON public.learning_modules(slug);
CREATE INDEX IF NOT EXISTS idx_learning_modules_order_index ON public.learning_modules(order_index);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_published ON public.blog_posts(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_tips_week ON public.weekly_tips(year, week_number);
CREATE INDEX IF NOT EXISTS idx_forum_notifications_user_id ON public.forum_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_mini_quiz_results_user_module ON public.mini_quiz_results(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_answers_user_module ON public.user_quiz_answers(user_id, module_id);
