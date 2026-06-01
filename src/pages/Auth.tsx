import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { Shield, Mail, Lock, User, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { T } from '@/components/T';

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().trim().email('Please enter a valid email').max(255, 'Email is too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password is too long'),
});

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const resetSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password is too long'),
});

/** Client-side login attempt throttle: 5 attempts → 30-second lockout. */
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000; // 30 seconds

export default function Auth() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const isReset = mode === 'reset';
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Client-side rate limiting state
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockoutSecsLeft, setLockoutSecsLeft] = useState(0);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/dashboard';
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong with Google sign-in.',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  // Redirect already-authenticated users — but not when they land on the reset page
  // (they arrive from the email link and must be allowed to set a new password).
  // Redirect already-authenticated users (but not on reset page)
  useEffect(() => {
    if (user && !isReset) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, isReset]);

  useEffect(() => {
    setIsLogin(mode === 'login');
    setErrors({});
    // Clear lockout when switching modes
    setLoginAttempts(0);
    setLockedUntil(null);
  }, [mode]);

  // Countdown timer for lockout display
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setLoginAttempts(0);
        setLockoutSecsLeft(0);
        clearInterval(interval);
      } else {
        setLockoutSecsLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // ── Client-side lockout check ───────────────────────────────────────────
    if (isLogin && lockedUntil && Date.now() < lockedUntil) {
      toast({
        variant: 'destructive',
        title: 'Too Many Attempts',
        description: `Please wait ${lockoutSecsLeft} seconds before trying again.`,
      });
      return;
    }

    setLoading(true);

    try {
      // ── Reset-password mode ─────────────────────────────────────────────
      if (isReset) {
        const result = resetSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => { fieldErrors[String(err.path[0])] = err.message; });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.updateUser({ password: formData.password });
        if (error) {
          toast({
            variant: 'destructive',
            title: 'Password Reset Failed',
            description: error.message,
          });
        } else {
          setResetDone(true);
          toast({
            title: 'Password Updated!',
            description: 'Your password has been reset successfully.',
          });
        }
        setLoading(false);
        return;
      }

      // ── Login mode ──────────────────────────────────────────────────────
      if (isLogin) {
        const result = loginSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            fieldErrors[err.path[0]] = err.message;
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          // Increment attempt counter on failure
          const next = loginAttempts + 1;
          setLoginAttempts(next);
          if (next >= MAX_LOGIN_ATTEMPTS) {
            const until = Date.now() + LOCKOUT_MS;
            setLockedUntil(until);
            setLockoutSecsLeft(Math.ceil(LOCKOUT_MS / 1000));
            toast({
              variant: 'destructive',
              title: 'Account Temporarily Locked',
              description: `Too many failed attempts. Please wait ${LOCKOUT_MS / 1000} seconds.`,
            });
          } else {
            toast({
              variant: 'destructive',
              title: 'Login Failed',
              description: error.message === 'Invalid login credentials'
                ? `Invalid email or password. ${MAX_LOGIN_ATTEMPTS - next} attempt${MAX_LOGIN_ATTEMPTS - next === 1 ? '' : 's'} remaining.`
                : error.message,
            });
          }

        } else {
          toast({
            title: 'Welcome back!',
            description: 'You have successfully logged in.',
          });
          navigate(from, { replace: true });
        }
      } else {
        // ── Sign-up mode ────────────────────────────────────────────────
        const result = signupSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            fieldErrors[err.path[0]] = err.message;
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.name);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              variant: 'destructive',
              title: 'Account Exists',
              description: 'An account with this email already exists. Please login instead.',
            });
          } else {
            toast({
              variant: 'destructive',
              title: 'Signup Failed',
              description: error.message,
            });
          }
        } else {
          toast({
            title: 'Account Created!',
            description: 'Welcome to CyberSafe. Let\'s start learning!',
          });
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Reset-done success screen ─────────────────────────────────────────────
  if (isReset && resetDone) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <header className="p-4">
          <Link to="/auth?mode=login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span><T>Back to Login</T></span>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md card-glow animate-scale-in text-center">
            <CardContent className="pt-8 pb-8">
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2"><T>Password Reset!</T></h2>
              <p className="text-muted-foreground mb-6">
                <T>Your password has been updated successfully.</T>
              </p>
              <Button asChild className="w-full">
                <Link to="/auth?mode=login"><T>Sign In</T></Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span><T>Back to Home</T></span>
        </Link>
      </header>

      <main id="main-content" className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md card-glow animate-scale-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {isReset
                ? <T>Set New Password</T>
                : isLogin
                  ? <T>Welcome Back</T>
                  : <T>Create Account</T>}
            </CardTitle>
            <CardDescription>
              {isReset
                ? <T>Enter your new password below</T>
                : isLogin
                  ? <T>Sign in to continue your cybersecurity journey</T>
                  : <T>Join CyberSafe and start learning to stay safe online</T>
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && !isReset && (
                <div className="space-y-2">
                  <Label htmlFor="name"><T>Full Name</T></Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      className="pl-10"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      autoComplete="name"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                  </div>
                  {errors.name && <p id="name-error" className="text-sm text-destructive" role="alert">{errors.name}</p>}
                </div>
              )}

              {!isReset && (
                <div className="space-y-2">
                  <Label htmlFor="email"><T>Email</T></Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                  </div>
                  {errors.email && <p id="email-error" className="text-sm text-destructive" role="alert">{errors.email}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">
                  {isReset ? <T>New Password</T> : <T>Password</T>}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={
                      isReset
                        ? 'Enter your new password (min. 8 characters)'
                        : isLogin
                          ? 'Enter your password'
                          : 'Create a password (min. 8 characters)'
                    }
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent min-h-[44px] min-w-[44px]"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    )}
                  </Button>
                </div>
                {errors.password && <p id="password-error" className="text-sm text-destructive" role="alert">{errors.password}</p>}
                {isLogin && (
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    <T>Forgot your password?</T>
                  </Link>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading || googleLoading}>
                {loading
                  ? <T>Please wait...</T>
                  : isReset
                    ? <T>Set New Password</T>
                    : isLogin
                      ? <T>Sign In</T>
                      : <T>Create Account</T>}
              </Button>
            </form>

            {!isReset && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground"><T>Or continue with</T></span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={loading || googleLoading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  {googleLoading ? <T>Signing in...</T> : <T>Continue with Google</T>}
                </Button>

                <div className="mt-6 text-center text-sm">
                  {isLogin ? (
                    <p className="text-muted-foreground">
                      <T>Don't have an account?</T>{' '}
                      <Link to="/auth?mode=signup" className="text-primary hover:underline font-medium">
                        <T>Sign up</T>
                      </Link>
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      <T>Already have an account?</T>{' '}
                      <Link to="/auth?mode=login" className="text-primary hover:underline font-medium">
                        <T>Sign in</T>
                      </Link>
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
