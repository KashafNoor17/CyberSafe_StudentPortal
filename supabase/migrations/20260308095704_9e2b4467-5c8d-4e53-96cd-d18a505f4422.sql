
-- Performance indexes for unindexed foreign keys and high-traffic query patterns

-- Core learning tables
CREATE INDEX IF NOT EXISTS idx_module_completions_user_module ON public.module_completions(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_module_completions_completed_at ON public.module_completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_completed ON public.quiz_results(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_log_user_created ON public.points_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mini_quiz_results_user_module ON public.mini_quiz_results(user_id, module_id);

-- Forum tables
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON public.forum_posts(category_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user ON public.forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post ON public.forum_replies(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_forum_replies_user ON public.forum_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_votes_post ON public.forum_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_votes_reply ON public.forum_votes(reply_id);
CREATE INDEX IF NOT EXISTS idx_forum_notifications_user_read ON public.forum_notifications(user_id, is_read, created_at DESC);

-- Social tables
CREATE INDEX IF NOT EXISTS idx_friendships_user ON public.friendships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON public.friendships(friend_id, status);
CREATE INDEX IF NOT EXISTS idx_friend_reactions_activity ON public.friend_activity_reactions(activity_log_id);

-- CTF tables
CREATE INDEX IF NOT EXISTS idx_ctf_submissions_challenge ON public.ctf_submissions(challenge_id, is_correct);
CREATE INDEX IF NOT EXISTS idx_ctf_submissions_user ON public.ctf_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_ctf_challenges_competition ON public.ctf_challenges(competition_id, is_active);
CREATE INDEX IF NOT EXISTS idx_ctf_team_members_team ON public.ctf_team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_ctf_team_members_user ON public.ctf_team_members(user_id);

-- Feature requests (new tables)
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON public.feature_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_requests_category ON public.feature_requests(category);
CREATE INDEX IF NOT EXISTS idx_feature_votes_feature ON public.feature_votes(feature_id);
CREATE INDEX IF NOT EXISTS idx_feature_comments_feature ON public.feature_comments(feature_id, created_at);

-- Organization tables
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_invites_org ON public.organization_invites(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invites_email ON public.organization_invites(email);

-- Compliance tables
CREATE INDEX IF NOT EXISTS idx_compliance_mappings_module ON public.compliance_mappings(module_id);
CREATE INDEX IF NOT EXISTS idx_compliance_mappings_requirement ON public.compliance_mappings(requirement_id);
CREATE INDEX IF NOT EXISTS idx_compliance_requirements_framework ON public.compliance_requirements(framework_id);
CREATE INDEX IF NOT EXISTS idx_compliance_training_user ON public.compliance_training_records(user_id, status);
CREATE INDEX IF NOT EXISTS idx_compliance_training_org ON public.compliance_training_records(organization_id);

-- Research tables
CREATE INDEX IF NOT EXISTS idx_anonymized_records_dataset ON public.anonymized_user_records(dataset_id);
CREATE INDEX IF NOT EXISTS idx_dataset_requests_dataset ON public.dataset_requests(dataset_id);
CREATE INDEX IF NOT EXISTS idx_research_opt_outs_user ON public.research_opt_outs(user_id);

-- Security tables
CREATE INDEX IF NOT EXISTS idx_security_scores_user ON public.security_scores(user_id, calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_breach_alerts_user ON public.breach_alerts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_breach_checks_user ON public.breach_checks(user_id);

-- AI tables
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user ON public.ai_interactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_interaction ON public.ai_feedback(interaction_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_cache_hash ON public.ai_content_cache(content_hash);

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Spaced repetition
CREATE INDEX IF NOT EXISTS idx_sr_items_user_next ON public.spaced_repetition_items(user_id, next_review_at);

-- Blog
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(is_published, created_at DESC);

-- Badges
CREATE INDEX IF NOT EXISTS idx_favorite_tips_user ON public.favorite_tips(user_id);

-- LMS
CREATE INDEX IF NOT EXISTS idx_lms_courses_connection ON public.lms_courses(connection_id);
CREATE INDEX IF NOT EXISTS idx_lms_assignments_course ON public.lms_assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_lms_grade_sync_assignment ON public.lms_grade_sync(assignment_id);
CREATE INDEX IF NOT EXISTS idx_lms_grade_sync_user ON public.lms_grade_sync(user_id);

-- User segments
CREATE INDEX IF NOT EXISTS idx_user_segments_user ON public.user_segments(user_id);

-- Daily aggregates
CREATE INDEX IF NOT EXISTS idx_daily_aggregates_date ON public.daily_aggregates(date DESC);

-- Phishing
CREATE INDEX IF NOT EXISTS idx_phishing_results_campaign ON public.phishing_results(campaign_id);
CREATE INDEX IF NOT EXISTS idx_phishing_results_user ON public.phishing_results(user_id);
CREATE INDEX IF NOT EXISTS idx_phishing_campaigns_template ON public.phishing_campaigns(template_id);
