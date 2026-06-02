import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AIChatbot } from "@/components/AIChatbot";
import { AccessibilitySettings } from "@/components/AccessibilitySettings";

import { PageLoader } from "@/components/PageLoader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MobileOfflineBanner } from "@/components/MobileOfflineBanner";
import { BackToTop } from "@/components/BackToTop";
// Eager load the landing page for fast FCP
import Index from "./pages/Index";

// Lazy load all other routes for code splitting
const Auth = lazy(() => import("./pages/Auth"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Modules = lazy(() => import("./pages/Modules"));
const ModuleDetail = lazy(() => import("./pages/ModuleDetail"));
const Quiz = lazy(() => import("./pages/Quiz"));
const QuizDetail = lazy(() => import("./pages/QuizDetail"));
const PasswordChecker = lazy(() => import("./pages/PasswordChecker"));
const WeeklyTips = lazy(() => import("./pages/WeeklyTips"));
const Certificate = lazy(() => import("./pages/Certificate"));
const CertificateVerify = lazy(() => import("./pages/CertificateVerify"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const AIPhishingDetector = lazy(() => import("./pages/AIPhishingDetector"));
const Profile = lazy(() => import("./pages/Profile"));
const Community = lazy(() => import("./pages/Community"));
const ForumCategory = lazy(() => import("./pages/ForumCategory"));
const ForumPost = lazy(() => import("./pages/ForumPost"));
const NewForumPost = lazy(() => import("./pages/NewForumPost"));
const CommunityGuidelines = lazy(() => import("./pages/CommunityGuidelines"));
const Learn = lazy(() => import("./pages/Learn"));
const Badges = lazy(() => import("./pages/Badges"));
const Accessibility = lazy(() => import("./pages/Accessibility"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const CookiesPage = lazy(() => import("./pages/Cookies"));
const Guide = lazy(() => import("./pages/Guide"));
const About = lazy(() => import("./pages/About"));
const SecurityScore = lazy(() => import("./pages/SecurityScore"));
const BreachAlerts = lazy(() => import("./pages/BreachAlerts"));
const PasswordHealth = lazy(() => import("./pages/PasswordHealth"));
const IncidentResponse = lazy(() => import("./pages/IncidentResponse"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min cache
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/** Redirect unauthenticated users to /auth */
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  return children;
};

/** Scroll to top on every route change */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

/** Prefetch critical routes after initial paint */
const RoutePrefetcher = () => {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === "/") {
      const timer = setTimeout(() => {
        import("./pages/Auth");
        import("./pages/Dashboard");
        import("./pages/Modules");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);
  return null;
};

/** Hide chatbot and accessibility widgets on the landing page */
const ConditionalGlobalUI = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  if (isLandingPage) return null;
  return (
    <>
      <AIChatbot />
      <AccessibilitySettings />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <ScrollToTop />
            <RoutePrefetcher />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/password-checker" element={<PasswordChecker />} />
                <Route path="/tips" element={<WeeklyTips />} />
                <Route path="/verify" element={<CertificateVerify />} />
                <Route path="/verify/:verificationId" element={<CertificateVerify />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/about" element={<About />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/cookies" element={<CookiesPage />} />
                <Route path="/guide" element={<Guide />} />
                <Route path="/accessibility" element={<Accessibility />} />
                <Route path="/community/guidelines" element={<CommunityGuidelines />} />
                <Route path="/learn" element={<PrivateRoute><Learn /></PrivateRoute>} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/modules" element={<PrivateRoute><Modules /></PrivateRoute>} />
                <Route path="/modules/:slug" element={<PrivateRoute><ModuleDetail /></PrivateRoute>} />
                <Route path="/quiz" element={<PrivateRoute><Quiz /></PrivateRoute>} />
                <Route path="/quiz/:quizId" element={<PrivateRoute><QuizDetail /></PrivateRoute>} />
                <Route path="/certificate" element={<PrivateRoute><Certificate /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/community" element={<PrivateRoute><Community /></PrivateRoute>} />
                <Route path="/community/category/:id" element={<PrivateRoute><ForumCategory /></PrivateRoute>} />
                <Route path="/community/post/:id" element={<PrivateRoute><ForumPost /></PrivateRoute>} />
                <Route path="/community/new-post" element={<PrivateRoute><NewForumPost /></PrivateRoute>} />
                <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
                <Route path="/badges" element={<PrivateRoute><Badges /></PrivateRoute>} />
                <Route path="/security-score" element={<PrivateRoute><SecurityScore /></PrivateRoute>} />
                <Route path="/breach-alerts" element={<PrivateRoute><BreachAlerts /></PrivateRoute>} />
                <Route path="/password-health" element={<PrivateRoute><PasswordHealth /></PrivateRoute>} />
                <Route path="/incident-response" element={<PrivateRoute><IncidentResponse /></PrivateRoute>} />
                <Route path="/ai-detector" element={<PrivateRoute><AIPhishingDetector /></PrivateRoute>} />
                <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <MobileOfflineBanner />
            <MobileBottomNav />
            <ConditionalGlobalUI />
            <BackToTop />
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

