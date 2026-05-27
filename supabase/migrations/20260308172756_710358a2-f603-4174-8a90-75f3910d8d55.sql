
-- Languages table
CREATE TABLE IF NOT EXISTS public.languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    native_name VARCHAR(50),
    flag_emoji VARCHAR(10),
    is_rtl BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Translation keys
CREATE TABLE IF NOT EXISTS public.translation_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    module VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Translations
CREATE TABLE IF NOT EXISTS public.translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id UUID REFERENCES public.translation_keys(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    translated_text TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    translated_by UUID,
    reviewed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(key_id, language_code)
);

-- Translation glossary
CREATE TABLE IF NOT EXISTS public.translation_glossary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term VARCHAR(255) NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    translation TEXT NOT NULL,
    context_notes TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(term, language_code)
);

-- Translation memory
CREATE TABLE IF NOT EXISTS public.translation_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_text TEXT NOT NULL,
    source_language VARCHAR(10) DEFAULT 'en',
    target_language VARCHAR(10) NOT NULL,
    target_text TEXT NOT NULL,
    usage_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_used TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Regional community hubs
CREATE TABLE IF NOT EXISTS public.regional_hubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_code VARCHAR(10) NOT NULL,
    region_name VARCHAR(100) NOT NULL,
    flag_emoji VARCHAR(10),
    description TEXT,
    language_code VARCHAR(10) DEFAULT 'en',
    member_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(region_code)
);

-- Regional hub members
CREATE TABLE IF NOT EXISTS public.regional_hub_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hub_id UUID REFERENCES public.regional_hubs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(hub_id, user_id)
);

-- Community translator applications
CREATE TABLE IF NOT EXISTS public.translator_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    languages TEXT[] NOT NULL,
    motivation TEXT,
    sample_translation TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_glossary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_hub_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translator_applications ENABLE ROW LEVEL SECURITY;

-- RLS: languages and glossary are public-read
CREATE POLICY "Languages are readable by everyone" ON public.languages FOR SELECT USING (true);
CREATE POLICY "Translation keys readable by authenticated" ON public.translation_keys FOR SELECT TO authenticated USING (true);
CREATE POLICY "Translations readable by everyone" ON public.translations FOR SELECT USING (true);
CREATE POLICY "Translations insertable by authenticated" ON public.translations FOR INSERT TO authenticated WITH CHECK (translated_by = auth.uid());
CREATE POLICY "Glossary readable by everyone" ON public.translation_glossary FOR SELECT USING (true);
CREATE POLICY "Translation memory readable by authenticated" ON public.translation_memory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Translation memory insertable by authenticated" ON public.translation_memory FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Regional hubs readable by everyone" ON public.regional_hubs FOR SELECT USING (true);
CREATE POLICY "Hub members readable by authenticated" ON public.regional_hub_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Hub members can join" ON public.regional_hub_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Hub members can leave" ON public.regional_hub_members FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Translator apps insertable by authenticated" ON public.translator_applications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Translator apps readable by own user" ON public.translator_applications FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Seed languages
INSERT INTO public.languages (code, name, native_name, flag_emoji, is_rtl, sort_order) VALUES
('en', 'English', 'English', '🇺🇸', false, 1),
('es', 'Spanish', 'Español', '🇪🇸', false, 2),
('fr', 'French', 'Français', '🇫🇷', false, 3),
('de', 'German', 'Deutsch', '🇩🇪', false, 4),
('ur', 'Urdu', 'اردو', '🇵🇰', true, 5),
('ar', 'Arabic', 'العربية', '🇸🇦', true, 6),
('zh', 'Chinese', '中文', '🇨🇳', false, 7),
('hi', 'Hindi', 'हिन्दी', '🇮🇳', false, 8),
('pt', 'Portuguese', 'Português', '🇧🇷', false, 9),
('ru', 'Russian', 'Русский', '🇷🇺', false, 10),
('he', 'Hebrew', 'עברית', '🇮🇱', true, 11),
('ja', 'Japanese', '日本語', '🇯🇵', false, 12),
('ko', 'Korean', '한국어', '🇰🇷', false, 13)
ON CONFLICT (code) DO NOTHING;

-- Seed regional hubs
INSERT INTO public.regional_hubs (region_code, region_name, flag_emoji, description, language_code) VALUES
('us', 'United States', '🇺🇸', 'Connect with US cybersecurity students', 'en'),
('gb', 'United Kingdom', '🇬🇧', 'UK cybersecurity community', 'en'),
('pk', 'Pakistan', '🇵🇰', 'پاکستانی سائبر سیکیورٹی کمیونٹی', 'ur'),
('sa', 'Saudi Arabia', '🇸🇦', 'مجتمع الأمن السيبراني السعودي', 'ar'),
('in', 'India', '🇮🇳', 'Indian cybersecurity community', 'hi'),
('de', 'Germany', '🇩🇪', 'Deutsche Cybersicherheits-Community', 'de'),
('fr', 'France', '🇫🇷', 'Communauté cybersécurité française', 'fr'),
('es', 'Spain', '🇪🇸', 'Comunidad española de ciberseguridad', 'es'),
('ca', 'Canada', '🇨🇦', 'Canadian cybersecurity community', 'en'),
('ae', 'UAE', '🇦🇪', 'مجتمع الأمن السيبراني الإماراتي', 'ar')
ON CONFLICT (region_code) DO NOTHING;

-- Seed glossary for key cybersecurity terms
INSERT INTO public.translation_glossary (term, language_code, translation, context_notes, category) VALUES
('Password', 'ur', 'پاس ورڈ', 'Always use this translation', 'security'),
('Two-Factor Authentication', 'ur', 'دو مرحلہ توثیق', 'Technical term', 'security'),
('Phishing', 'ur', 'فشنگ', 'Keep as loanword', 'security'),
('Firewall', 'ur', 'فائر وال', 'Keep as loanword', 'security'),
('Encryption', 'ur', 'خفیہ کاری', 'Technical term', 'security'),
('Malware', 'ur', 'میل ویئر', 'Keep as loanword', 'security'),
('Password', 'ar', 'كلمة المرور', 'Standard translation', 'security'),
('Two-Factor Authentication', 'ar', 'المصادقة الثنائية', 'Technical term', 'security'),
('Phishing', 'ar', 'التصيد الاحتيالي', 'Standard translation', 'security'),
('Firewall', 'ar', 'جدار الحماية', 'Standard translation', 'security'),
('Encryption', 'ar', 'التشفير', 'Standard translation', 'security'),
('Malware', 'ar', 'البرمجيات الخبيثة', 'Standard translation', 'security')
ON CONFLICT (term, language_code) DO NOTHING;
