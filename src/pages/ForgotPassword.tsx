import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { T } from '@/components/T';

const emailSchema = z.string().trim().email('Please enter a valid email address');

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const { data, error: resetError } = await supabase.functions.invoke('send-password-reset', {
        body: { 
          email: email.toLowerCase().trim(),
          redirectTo: `${window.location.origin}/auth?mode=reset`
        }
      });

      if (resetError || data?.error) throw resetError || new Error(data?.error);

      setSent(true);
      toast({
        title: 'Check your email',
        description: 'If an account exists, we sent a password reset link.',
      });
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('Password reset error:', err);
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
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
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold mb-2"><T>Check Your Email</T></h2>
              <p className="text-muted-foreground mb-6">
                <T>We've sent a password reset link to your email address</T>
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                <T>The link will expire in 1 hour. If you don't see the email, check your spam folder.</T>
              </p>
              <div className="space-y-3">
                <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
                  <T>Try a different email</T>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/auth?mode=login"><T>Back to Login</T></Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="p-4">
        <Link to="/auth?mode=login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span><T>Back to Login</T></span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md card-glow animate-scale-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl"><T>Forgot Password?</T></CardTitle>
            <CardDescription>
              <T>Enter your email and we'll send you a link to reset your password</T>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email"><T>Email Address</T></Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <T>Sending...</T>
                  </>
                ) : (
                  <T>Send Reset Link</T>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                <T>Remember your password?</T>{' '}
                <Link to="/auth?mode=login" className="text-primary hover:underline font-medium">
                  <T>Sign in</T>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
