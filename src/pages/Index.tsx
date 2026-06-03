import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, CheckCircle, ArrowRight, Lock, AlertTriangle,
  Menu, X, ArrowUp,
  UserPlus, BookOpen, Award, Key, Bot, BarChart3, Lightbulb, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { T } from '@/components/T';
import { Footer } from '@/components/Footer';
import { FreeToolsSection } from '@/components/FreeToolsSection';



/* ── Landing Header ─────────────────────────────────────── */
function LandingHeader() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Home', id: 'hero' },
    { label: 'Modules', id: 'modules' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Tools', id: 'tools' },
    { label: 'Badges', id: 'badges' },
    { label: 'Community', id: 'community' },
    { label: 'Get Started', id: 'get-started' },
  ];

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to content
      </a>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-lg'
            : 'bg-transparent'
        }`}
        role="banner"
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 md:h-20 items-center justify-between">
            {/* Logo */}
            <button onClick={() => scrollTo('hero')} className="flex items-center gap-2 font-display font-bold text-lg md:text-xl" aria-label="CyberSafe Student Portal Home">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-foreground hidden sm:inline">CyberSafe</span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  <Link to="/dashboard">Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
                    <Link to="/auth?mode=login">Sign In</Link>
                  </Button>
                  <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    <Link to="/auth?mode=signup">Get Started Now</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              className="lg:hidden w-11 h-11 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <nav className="lg:hidden pb-6 border-t border-border/30 pt-4 animate-fade-in" aria-label="Mobile navigation">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    className="px-4 py-3 rounded-lg text-left text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors min-h-[44px]"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="h-px bg-border/30 my-2" />
                {user ? (
                  <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mx-4">
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Go to Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Link to="/auth?mode=login" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-muted-foreground hover:text-foreground min-h-[44px] flex items-center">Sign In</Link>
                    <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mx-4 mt-2">
                      <Link to="/auth?mode=signup" onClick={() => setMobileOpen(false)}>Get Started Now</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
}

/* ── Main Landing Page ──────────────────────────────────── */
export default function Index() {
  const { user } = useAuth();

  // Preserve existing stats functionality
  const [stats, setStats] = useState({ totalUsers: 0, passRate: 0, totalModules: 0 });
  const [loading, setLoading] = useState(true);
  const [heroStats, setHeroStats] = useState({ students: 2400, certificates: 1800 });
  const [quizCount, setQuizCount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [{ count: studentsCount }, { count: certsCount }] = await Promise.all([
          supabase.from('profiles_public').select('*', { count: 'exact', head: true }),
          supabase.from('certificates').select('*', { count: 'exact', head: true }),
        ]);
        setHeroStats({
          students: studentsCount && studentsCount >= 100 ? studentsCount : 100,
          certificates: certsCount && certsCount >= 50 ? certsCount : 50,
        });
      } catch {
        /* keep fallback */
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { count: usersCount } = await supabase
          .from('profiles_public')
          .select('*', { count: 'exact', head: true });
        const { count: modulesCount } = await supabase
          .from('learning_modules')
          .select('*', { count: 'exact', head: true });
        const { data: quizResults } = await supabase
          .from('quiz_results')
          .select('score, total_questions');
        const { count: quizResultsCount } = await supabase
          .from('quiz_results')
          .select('*', { count: 'exact', head: true });
        setQuizCount(quizResultsCount);

        let passRate = 0;
        if (quizResults && quizResults.length > 0) {
          const passed = quizResults.filter((q) => q.score / q.total_questions >= 0.7).length;
          passRate = Math.round((passed / quizResults.length) * 100);
        }
        setStats({ totalUsers: usersCount || 0, passRate, totalModules: modulesCount || 0 });
      } catch {
        /* silently fail */
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingHeader />

      <main id="main-content" className="flex-1">
        {/* ── Hero Section ──────────────────────────────── */}
        <section id="hero" className="relative overflow-hidden pt-24 md:pt-32 pb-20 md:pb-28">
          <div className="absolute inset-0 grid-pattern opacity-[0.03]" aria-hidden="true" />
          <div className="absolute top-1/3 left-1/4 w-[min(600px,100vw)] h-[min(600px,100vw)] bg-primary/10 rounded-full blur-[120px]" aria-hidden="true" />

          <div className="container mx-auto px-4 relative">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* LEFT COLUMN */}
              <div className="flex flex-col">
                <div className="border border-primary/30 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full w-fit mb-6 inline-flex items-center gap-1.5">
                  <span aria-hidden="true">🎓</span>
                  <T>Trusted by GCUF Students</T>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold leading-tight text-foreground">
                  <span className="block"><T>Learn Cybersecurity.</T></span>
                  <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    <T>Stay Protected.</T>
                  </span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-lg mt-4">
                  <T>Master password security, phishing detection, and privacy protection through interactive lessons, real-world quizzes, and hands-on exercises. Built for students at Government College University Faisalabad.</T>
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  {user ? (
                    <>
                      <Link to="/dashboard" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold text-base transition-colors inline-flex items-center gap-2">
                        <T>Continue Learning</T> <ArrowRight className="h-5 w-5" />
                      </Link>
                      <Link to="/dashboard" className="border border-border hover:border-primary/50 hover:bg-primary/10 text-foreground px-8 py-3 rounded-xl font-semibold text-base transition-colors inline-flex items-center">
                        <T>View My Progress</T>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/auth?mode=signup" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold text-base transition-colors inline-flex items-center gap-2">
                        <T>Start Learning Free</T> <ArrowRight className="h-5 w-5" />
                      </Link>
                      <Link to="/modules" className="border border-border hover:border-primary/50 hover:bg-primary/10 text-foreground px-8 py-3 rounded-xl font-semibold text-base transition-colors inline-flex items-center">
                        <T>Browse Modules</T>
                      </Link>
                    </>
                  )}
                </div>
                {!user && (
                  <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" /> <T>Free to join</T></span>
                    <span className="inline-flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" /> <T>No credit card</T></span>
                    <span className="inline-flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" /> <T>Earn a certificate</T></span>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN — Dashboard mockup */}
              <div className="hidden md:block">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">
                  {/* Top bar */}
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <div className="w-3 h-3 rounded-full bg-warning" />
                      <div className="w-3 h-3 rounded-full bg-success" />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground ml-2">cybersafe-dashboard</span>
                  </div>

                  {/* Row 1: Learning Progress */}
                  <div className="mb-6">
                    <div className="text-sm text-foreground mb-2">📚 <T>Learning Progress</T></div>
                    <div className="bg-muted rounded-full h-2 overflow-hidden">
                      <div className="bg-primary w-2/3 h-full rounded-full" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-2"><T>2/3 Modules Complete</T></div>
                  </div>

                  {/* Row 2: Score */}
                  <div className="mb-6">
                    <div className="text-sm text-foreground mb-1">🏆 <T>Your Score</T></div>
                    <div className="text-3xl font-bold text-primary">850 <span className="text-lg"><T>pts</T></span></div>
                  </div>

                  {/* Row 3: Badges */}
                  <div className="mb-6">
                    <div className="flex gap-2 mb-2 text-2xl" aria-hidden="true">
                      <span>🥇</span><span>🔐</span><span>🎣</span>
                    </div>
                    <div className="text-xs text-muted-foreground"><T>Badges Earned: 3</T></div>
                  </div>

                  {/* Row 4: Continue button */}
                  <div className="bg-primary/20 text-primary text-xs px-3 py-2 rounded-lg w-fit inline-flex items-center gap-1">
                    <T>Continue Learning</T> <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Why This Matters Section ──────────────────── */}
        <section id="why" className="bg-muted/30 border-y border-border py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20 text-xs font-medium mb-4">
                <T>Why This Matters</T>
              </div>
              <h2 className="text-3xl font-bold text-center text-foreground">
                <T>Students Are the #1 Target.</T>
              </h2>
              <p className="text-muted-foreground text-center max-w-2xl mx-auto mt-3">
                <T>Cybercriminals specifically target university students because they assume you won't notice. Here's what the data says:</T>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
                <div className="text-2xl" aria-hidden="true">🔓</div>
                <div className="text-5xl font-bold text-destructive mt-2">70%</div>
                <div className="text-sm text-muted-foreground mt-2">
                  <T>of students reuse the same password across multiple accounts</T>
                </div>
              </div>
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
                <div className="text-2xl" aria-hidden="true">🎣</div>
                <div className="text-5xl font-bold text-warning mt-2">#1</div>
                <div className="text-sm text-muted-foreground mt-2">
                  <T>Universities are the top target for phishing email campaigns globally</T>
                </div>
              </div>
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
                <div className="text-2xl" aria-hidden="true">⏱️</div>
                <div className="text-5xl font-bold text-warning mt-2">3 min</div>
                <div className="text-sm text-muted-foreground mt-2">
                  <T>is how long it takes to crack a common 8-character password</T>
                </div>
              </div>
            </div>

            <div className="text-center mt-10">
              <p className="text-muted-foreground">
                <T>Don't let a hack ruin your thesis, your email, or your future.</T>
              </p>
              <Link to="/modules" className="mt-4 inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold transition-colors">
                <T>Learn to Protect Yourself</T> <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Services Section ──────────────────────────── */}
        <section id="modules" className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-border bg-muted text-xs font-medium text-muted-foreground mb-4">
                <T>What You'll Learn</T>
              </div>
              <h2 className="text-4xl font-bold text-foreground">
                <T>Three Modules. Real Skills.</T>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-center mt-3">
                <T>Each module combines reading, hands-on exercises, and a quiz — so you actually build skills, not just read about them.</T>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  Icon: Shield, iconBg: 'bg-primary/20', iconColor: 'text-primary',
                  module: 'Module 01', title: 'Password Security',
                  desc: 'Learn why most passwords fail, how attackers crack them, and how to build credentials that actually hold up.',
                  skills: ['Entropy basics', 'Password managers', '2FA setup'],
                },
                {
                  Icon: AlertTriangle, iconBg: 'bg-accent/20', iconColor: 'text-accent',
                  module: 'Module 02', title: 'Phishing Detection',
                  desc: 'Identify fake emails, malicious links, and social engineering attacks before they trick you. Includes a real email classifier exercise.',
                  skills: ['Email analysis', 'URL inspection', 'Sender verification'],
                },
                {
                  Icon: Lock, iconBg: 'bg-success/20', iconColor: 'text-success',
                  module: 'Module 03', title: 'Social Media Safety',
                  desc: 'Understand how oversharing puts you at risk, how to lock down privacy settings, and how to spot social engineering on Instagram, Facebook, and Twitter.',
                  skills: ['Privacy settings', 'Oversharing risks', 'Account security'],
                },
              ].map((m) => (
                <Link
                  key={m.title}
                  to="/modules"
                  className="rounded-2xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer flex flex-col group"
                >
                  <div className={`${m.iconBg} p-3 rounded-xl w-fit`}>
                    <m.Icon className={`h-6 w-6 ${m.iconColor}`} />
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-4"><T>{m.module}</T></div>
                  <h3 className="text-xl font-bold text-foreground mt-1"><T>{m.title}</T></h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2"><T>{m.desc}</T></p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {m.skills.map((s) => (
                      <span key={s} className="rounded-full bg-muted text-xs px-3 py-1 text-muted-foreground">
                        <T>{s}</T>
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-border flex gap-3">
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <span aria-hidden="true">🧪</span> <T>Exercise</T>
                    </span>
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <span aria-hidden="true">📝</span> <T>Quiz</T>
                    </span>
                  </div>
                  <div className="text-sm text-primary group-hover:translate-x-1 transition-transform mt-2 inline-flex items-center gap-1">
                    <T>Start Module</T> <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Link to="/modules" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-foreground hover:bg-muted font-semibold transition-colors">
                <T>View All Modules</T> <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>


        {/* ── Value Proposition Section ──────────────────── */}
        <section id="how-it-works" className="bg-muted/20 border-y border-border py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-border bg-muted text-xs font-medium text-muted-foreground mb-4">
                <T>Simple Process</T>
              </div>
              <h2 className="text-4xl font-bold text-foreground">
                <T>From Zero to Certified in 3 Steps</T>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mt-3">
                <T>No prior experience needed. Just follow the path.</T>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-6 md:gap-4 items-start max-w-5xl mx-auto">
              {/* Step 1 */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">1</div>
                <UserPlus size={32} className="text-primary mx-auto mt-4" />
                <h3 className="text-xl font-bold text-center text-foreground mt-3"><T>Create Your Account</T></h3>
                <p className="text-muted-foreground text-center text-sm mt-2">
                  <T>Sign up free in under 30 seconds. No credit card, no downloads — just your email address.</T>
                </p>
                <Link to="/auth?mode=login" className="text-primary text-xs text-center mt-3 block hover:underline">
                  <T>Already have an account? Log in →</T>
                </Link>
              </div>

              <div className="text-2xl text-muted-foreground hidden md:flex items-center justify-center self-center" aria-hidden="true">→</div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">2</div>
                <BookOpen size={32} className="text-primary mx-auto mt-4" />
                <h3 className="text-xl font-bold text-center text-foreground mt-3"><T>Learn & Practice</T></h3>
                <p className="text-muted-foreground text-center text-sm mt-2">
                  <T>Work through interactive modules at your own pace. Read the content, complete hands-on exercises, and quiz yourself at the end of each module.</T>
                </p>
                <div className="text-muted-foreground text-xs text-center mt-3">
                  <T>3 modules • Exercises included • Self-paced</T>
                </div>
              </div>

              <div className="text-2xl text-muted-foreground hidden md:flex items-center justify-center self-center" aria-hidden="true">→</div>

              {/* Step 3 */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">3</div>
                <Award size={32} className="text-primary mx-auto mt-4" />
                <h3 className="text-xl font-bold text-center text-foreground mt-3"><T>Earn Your Certificate</T></h3>
                <p className="text-muted-foreground text-center text-sm mt-2">
                  <T>Complete all 3 modules and pass their quizzes. Download your verified digital certificate featuring a unique QR code for verification.</T>
                </p>
                <div className="text-xs text-center mt-3 flex flex-wrap gap-2 justify-center">
                  <span className="rounded-full bg-muted text-muted-foreground px-3 py-1"><T>📤 Shareable</T></span>
                  <span className="rounded-full bg-muted text-muted-foreground px-3 py-1"><T>🔍 Verifiable</T></span>
                </div>
              </div>
            </div>

            <div className="text-center mt-10">
              <Link to="/auth?mode=signup" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold transition-colors">
                <T>Get Started Now</T> <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Free Tools Section ────────────────────────── */}
        <section id="tools" className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
              {/* LEFT COLUMN */}
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 text-xs font-medium mb-4">
                  <T>No Login Required</T>
                </div>
                <h2 className="text-4xl font-bold text-foreground">
                  <T>Try Our Free Security Tools</T>
                </h2>
                <p className="text-muted-foreground mt-4 max-w-sm">
                  <T>These tools work instantly — no account needed. Test your passwords, detect phishing attempts, and check your security score right now.</T>
                </p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <T>Instant results, no signup</T>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <T>Built with real security logic</T>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <T>Used by 2,400+ students</T>
                  </li>
                </ul>
                <Link to="/auth?mode=signup" className="mt-8 inline-flex items-center gap-2 border border-border hover:border-primary text-foreground px-6 py-3 rounded-xl font-semibold transition-colors">
                  <T>Unlock Full Platform</T> <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* RIGHT COLUMN — Vertical Tools List */}
              <div className="w-full">
                <FreeToolsSection layout="vertical" />
              </div>
            </div>
          </div>
        </section>



        {/* ── Social Proof: Stats + Testimonials ────────── */}
        <section id="social-proof" className="bg-primary/10 border-y border-primary/20 py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center md:border-r md:border-border md:last:border-0">
                <div className="text-2xl" aria-hidden="true">🎓</div>
                <div className="text-4xl font-bold text-primary mt-1">
                  {loading ? '...' : `${(heroStats.students >= 100 ? heroStats.students : 100).toLocaleString()}+`}
                </div>
                <div className="text-sm text-muted-foreground mt-1"><T>Students Enrolled</T></div>
              </div>
              <div className="text-center md:border-r md:border-border md:last:border-0">
                <div className="text-2xl" aria-hidden="true">📚</div>
                <div className="text-4xl font-bold text-primary mt-1">3</div>
                <div className="text-sm text-muted-foreground mt-1"><T>Interactive Modules</T></div>
              </div>
              <div className="text-center md:border-r md:border-border md:last:border-0">
                <div className="text-2xl" aria-hidden="true">🏆</div>
                <div className="text-4xl font-bold text-primary mt-1">
                  {loading ? '...' : `${(heroStats.certificates >= 50 ? heroStats.certificates : 50).toLocaleString()}+`}
                </div>
                <div className="text-sm text-muted-foreground mt-1"><T>Certificates Issued</T></div>
              </div>
              <div className="text-center md:border-r md:border-border md:last:border-0">
                <div className="text-2xl" aria-hidden="true">📝</div>
                <div className="text-4xl font-bold text-primary mt-1">
                  {loading ? '...' : `${(quizCount !== null && quizCount > 0 ? quizCount : 5200).toLocaleString()}+`}
                </div>
                <div className="text-sm text-muted-foreground mt-1"><T>Quizzes Completed</T></div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 text-xs font-medium mb-4">
                <T>Student Reviews</T>
              </div>
              <h2 className="text-4xl font-bold text-foreground">
                <T>What Students Are Saying</T>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-6xl mx-auto">
              {[
                {
                  stars: '★★★★★',
                  quote: 'The phishing simulator caught me completely off guard. Now I can spot fake university emails instantly. This should be mandatory for every student.',
                  initials: 'SK', name: 'Sarah K.', role: 'Computer Science, Year 3',
                  avatarBg: 'bg-primary/20', avatarText: 'text-primary',
                },
                {
                  stars: '★★★★★',
                  quote: 'I had no idea how weak my passwords were. After the Password Security module, I set up a password manager and 2FA on everything. Game changer.',
                  initials: 'MR', name: 'Muhammad R.', role: 'Software Engineering, Year 2',
                  avatarBg: 'bg-success/20', avatarText: 'text-success',
                },
                {
                  stars: '★★★★☆',
                  quote: 'The AI phishing detector is honestly scary accurate. I tested it with a real suspicious email and it flagged every single red flag perfectly.',
                  initials: 'AN', name: 'Ayesha N.', role: 'Information Technology, Year 4',
                  avatarBg: 'bg-accent/20', avatarText: 'text-accent',
                },
              ].map((t) => (
                <div key={t.name} className="rounded-2xl border border-border bg-card p-6">
                  <div className="text-warning text-lg" aria-hidden="true">{t.stars}</div>
                  <p className="text-sm text-foreground leading-relaxed mt-3">
                    <T>{t.quote}</T>
                  </p>
                  <div className="flex items-center gap-3 mt-5">
                    <div className={`w-10 h-10 rounded-full ${t.avatarBg} flex items-center justify-center font-bold ${t.avatarText}`}>
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{t.name}</div>
                      <div className="text-xs text-muted-foreground"><T>{t.role}</T></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Community Teaser Section ──────────────────── */}
        <section id="community" className="py-16">
          <div className="container mx-auto px-4 max-w-5xl mx-auto">
            {/* Heading */}
            <div className="text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 text-xs font-medium mb-4">
                <T>Active Community</T>
              </div>
              <h2 className="text-4xl font-bold text-foreground">
                <T>Join the Conversation</T>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-center mt-3">
                <T>Thousands of students are already discussing cybersecurity, sharing tips, and helping each other stay safe online.</T>
              </p>
            </div>

            {/* 3 Forum Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
              {/* Card 1 */}
              <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:bg-primary/5 transition-all flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/20 text-primary font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center">
                    <T>AK</T>
                  </div>
                  <span className="text-sm font-medium text-foreground"><T>Ali K.</T></span>
                  <span className="text-xs text-muted-foreground ml-auto"><T>2 hours ago</T></span>
                </div>
                <div className="font-semibold text-foreground"><T>How do I tell if an email is a phishing attempt?</T></div>
                <span className="text-xs rounded-full bg-warning/20 text-warning px-2 py-0.5 w-fit">
                  <T>Phishing Detection</T>
                </span>
                <div className="text-xs text-muted-foreground flex gap-4">
                  <span><T>💬 24 replies</T></span>
                  <span><T>👍 47 upvotes</T></span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:bg-primary/5 transition-all flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="bg-success/20 text-success font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center">
                    <T>MR</T>
                  </div>
                  <span className="text-sm font-medium text-foreground"><T>Maria R.</T></span>
                  <span className="text-xs text-muted-foreground ml-auto"><T>5 hours ago</T></span>
                </div>
                <div className="font-semibold text-foreground"><T>Best free password manager for students in 2026?</T></div>
                <span className="text-xs rounded-full bg-primary/20 text-primary px-2 py-0.5 w-fit">
                  <T>Password Security</T>
                </span>
                <div className="text-xs text-muted-foreground flex gap-4">
                  <span><T>💬 18 replies</T></span>
                  <span><T>👍 31 upvotes</T></span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:bg-primary/5 transition-all flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="bg-accent/20 text-accent font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center">
                    <T>HN</T>
                  </div>
                  <span className="text-sm font-medium text-foreground"><T>Hassan N.</T></span>
                  <span className="text-xs text-muted-foreground ml-auto"><T>1 day ago</T></span>
                </div>
                <div className="font-semibold text-foreground"><T>Just earned my Certified CyberGuardian certificate! 🎓 Here's how I did it.</T></div>
                <span className="text-xs rounded-full bg-success/20 text-success px-2 py-0.5 w-fit">
                  <T>General</T>
                </span>
                <div className="text-xs text-muted-foreground flex gap-4">
                  <span><T>💬 52 replies</T></span>
                  <span><T>👍 89 upvotes</T></span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mt-8">
              <Link to="/community" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold transition-colors">
                <T>Join the Forum</T> <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/blog" className="inline-flex items-center gap-2 border border-border hover:border-primary hover:bg-primary/5 text-foreground px-6 py-3 rounded-xl font-semibold transition-colors">
                <T>Read the Blog</T>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Final CTA (Get Started) ───────────────────── */}
        <section id="get-started" className="py-24">
          <div className="container mx-auto px-4">
            <div className="rounded-3xl bg-primary/10 border border-primary/30 p-12 md:p-20 text-center max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                <T>Ready to Become Cyber-Aware?</T>
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto mt-4">
                <T>Join students at Government College University Faisalabad already learning to protect themselves online. Free, interactive, and certified.</T>
              </p>
              <div className="mt-10 flex flex-wrap gap-4 justify-center">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 rounded-xl font-semibold text-base transition-colors inline-flex items-center gap-2"
                  >
                    <T>Go to Dashboard</T> <ArrowRight className="h-5 w-5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/auth?mode=signup"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 rounded-xl font-semibold text-base transition-colors inline-flex items-center gap-2"
                    >
                      <T>Create Free Account</T> <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link
                      to="/modules"
                      className="border border-border hover:border-primary text-foreground px-10 py-4 rounded-xl text-base transition-colors inline-flex items-center"
                    >
                      <T>Browse Modules</T>
                    </Link>
                  </>
                )}
              </div>
              <p className="mt-6 text-xs text-muted-foreground">
                <T>No credit card required · No downloads · Start in 30 seconds</T>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />


    </div>
  );
}
