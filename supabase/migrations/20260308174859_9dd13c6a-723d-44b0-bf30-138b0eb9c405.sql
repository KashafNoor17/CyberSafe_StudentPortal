
-- Student verification fields on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_verified boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_method varchar(50);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS university_name varchar(255);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS graduation_year integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_discount_applied boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code varchar(50);

-- University domains for auto-verification
CREATE TABLE IF NOT EXISTS public.university_domains (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    domain varchar(255) UNIQUE NOT NULL,
    university_name varchar(255) NOT NULL,
    is_verified boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);
ALTER TABLE public.university_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read university domains" ON public.university_domains FOR SELECT USING (true);

-- Student verification tokens
CREATE TABLE IF NOT EXISTS public.student_verification_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    email_sent_to varchar(255) NOT NULL,
    token varchar(100) UNIQUE NOT NULL,
    expires_at timestamptz NOT NULL,
    used_at timestamptz,
    created_at timestamptz DEFAULT now()
);
ALTER TABLE public.student_verification_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tokens" ON public.student_verification_tokens FOR ALL USING (auth.uid() = user_id);

-- Subscription plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    description text,
    price_monthly numeric(10,2) DEFAULT 0,
    price_yearly numeric(10,2) DEFAULT 0,
    student_price_monthly numeric(10,2) DEFAULT 0,
    student_price_yearly numeric(10,2) DEFAULT 0,
    features jsonb NOT NULL DEFAULT '{}',
    max_users integer,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read plans" ON public.subscription_plans FOR SELECT USING (true);

-- User subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    plan_id uuid REFERENCES public.subscription_plans(id),
    status varchar(50) DEFAULT 'active',
    payment_method varchar(50),
    current_period_start timestamptz DEFAULT now(),
    current_period_end timestamptz,
    scholarship_approved boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subscriptions" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own subscriptions" ON public.user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Scholarship applications
CREATE TABLE IF NOT EXISTS public.scholarship_applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    email varchar(255) NOT NULL,
    university varchar(255),
    reason text,
    status varchar(50) DEFAULT 'approved',
    approved_at timestamptz DEFAULT now(),
    expires_at timestamptz DEFAULT (now() + interval '1 year'),
    created_at timestamptz DEFAULT now()
);
ALTER TABLE public.scholarship_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert scholarship apps" ON public.scholarship_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users read own scholarship apps" ON public.scholarship_applications FOR SELECT USING (auth.uid() = user_id);

-- University partnership requests
CREATE TABLE IF NOT EXISTS public.university_partnerships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    university_name varchar(255) NOT NULL,
    department varchar(255),
    contact_name varchar(255) NOT NULL,
    contact_email varchar(255) NOT NULL,
    contact_phone varchar(50),
    estimated_students varchar(50),
    current_lms varchar(100),
    interests text[],
    status varchar(50) DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
);
ALTER TABLE public.university_partnerships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert partnership requests" ON public.university_partnerships FOR INSERT WITH CHECK (true);

-- Module purchases
CREATE TABLE IF NOT EXISTS public.module_purchases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    module_id uuid,
    amount numeric(10,2) NOT NULL,
    currency varchar(10) DEFAULT 'usd',
    status varchar(50) DEFAULT 'completed',
    created_at timestamptz DEFAULT now()
);
ALTER TABLE public.module_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own purchases" ON public.module_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own purchases" ON public.module_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Affiliate/referral system
CREATE TABLE IF NOT EXISTS public.referral_tracking (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id uuid NOT NULL,
    referred_id uuid,
    referral_code varchar(50) NOT NULL,
    status varchar(50) DEFAULT 'clicked',
    reward_granted boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);
ALTER TABLE public.referral_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own referrals" ON public.referral_tracking FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Anyone can insert referral tracking" ON public.referral_tracking FOR INSERT WITH CHECK (true);

-- Gift certificates
CREATE TABLE IF NOT EXISTS public.gift_certificates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    purchaser_id uuid NOT NULL,
    recipient_name varchar(255),
    recipient_email varchar(255),
    sender_name varchar(255),
    message text,
    amount numeric(10,2) NOT NULL,
    code varchar(50) UNIQUE NOT NULL,
    redeemed_by uuid,
    redeemed_at timestamptz,
    delivery_date date,
    status varchar(50) DEFAULT 'active',
    created_at timestamptz DEFAULT now()
);
ALTER TABLE public.gift_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own gift certs" ON public.gift_certificates FOR SELECT USING (auth.uid() = purchaser_id OR auth.uid() = redeemed_by);
CREATE POLICY "Users insert gift certs" ON public.gift_certificates FOR INSERT WITH CHECK (auth.uid() = purchaser_id);
