import { useState, useCallback } from 'react';
import { AlertTriangle, Shield, Search, CheckCircle, Bell, Mail, ExternalLink, Eye, KeyRound, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { T } from '@/components/T';

interface BreachResult {
  name: string;
  date: string;
  dataTypes: string[];
  description: string;
}

// Simulated breach database for educational purposes
const SIMULATED_BREACHES: BreachResult[] = [
  { name: 'ExampleCorp 2023', date: '2023-06-15', dataTypes: ['Email', 'Password hash'], description: 'A third-party vendor was compromised, exposing user credentials.' },
  { name: 'SocialApp Leak', date: '2022-11-20', dataTypes: ['Email', 'Username', 'IP Address'], description: 'An unsecured API endpoint leaked user profile data.' },
  { name: 'RetailStore Breach', date: '2024-01-10', dataTypes: ['Email', 'Payment info (partial)'], description: 'Point-of-sale malware captured customer information.' },
];

export default function BreachAlerts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<BreachResult[] | null>(null);
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  const checkEmail = useCallback(async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({ variant: 'destructive', title: 'Invalid email', description: 'Please enter a valid email address.' });
      return;
    }
    if (trimmed.length > 255) {
      toast({ variant: 'destructive', title: 'Email too long', description: 'Email must be under 255 characters.' });
      return;
    }

    setChecking(true);
    await new Promise(r => setTimeout(r, 1500));

    // Randomly pick 1 or 2 breaches from the simulated list
    const shuffled = [...SIMULATED_BREACHES].sort(() => Math.random() - 0.5);
    const count = Math.random() < 0.5 ? 1 : 2;
    const simulated = shuffled.slice(0, count);
    setResults(simulated);

    if (user) {
      await supabase.from('breach_checks').insert({
        user_id: user.id,
        email: trimmed,
        found_in_breaches: simulated.map(b => b.name),
      });
    }

    setChecking(false);
  }, [email, user, toast]);

  const acknowledgeAlert = useCallback(async (breachName: string) => {
    setAcknowledged(prev => new Set(prev).add(breachName));
    if (user) {
      await supabase.from('breach_alerts').insert({
        user_id: user.id,
        breach_name: breachName,
        affected_data: 'Email',
        acknowledged_at: new Date().toISOString(),
      });
    }
    toast({ title: 'Alert acknowledged', description: 'We recommend changing your password for this service.' });
  }, [user, toast]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        {/* Disclaimer Banner */}
        <Alert className="mb-6 border-warning/40 bg-warning/10 animate-fade-in">
          <Info className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm text-warning">
            <T>This is a simulated educational demo. Results shown are fictional examples for learning purposes only. For real breach checking, visit haveibeenpwned.com</T>
          </AlertDescription>
        </Alert>

        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <T>Breach Alerts</T>
          </h1>
          <p className="text-muted-foreground mt-1">
            <T>Check if your email has appeared in known data breaches</T>
          </p>
        </div>

        {/* Email Check */}
        <Card className="mb-6 border-border/50 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              <T>Check Your Email</T>
            </CardTitle>
            <CardDescription>
              <T>We'll check your email against known breach databases. This is an educational simulation.</T>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkEmail()}
                maxLength={255}
                className="flex-1"
                autoComplete="off"
              />
              <Button onClick={checkEmail} disabled={checking || !email.trim()} className="min-w-[100px]">
                {checking ? (
                  <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-1" /> <T>Check</T>
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              🔒 <T>Your email is not stored or shared. This is an educational simulation only.</T>
            </p>
          </CardContent>
        </Card>

        {/* Results */}
        {results !== null && (
          <div className="space-y-4 animate-fade-in">
            {results.length === 0 ? (
              <Card className="border-green-500/30 bg-green-500/5">
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
                  <h3 className="text-lg font-semibold"><T>No Breaches Found</T></h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    <T>Your email was not found in any known data breaches. Stay vigilant!</T>
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="border-destructive/30 bg-destructive/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-8 w-8 text-destructive shrink-0" />
                      <div>
                        <h3 className="font-semibold text-destructive">
                          <T>{`Found in ${results.length} breach${results.length > 1 ? 'es' : ''}`}</T>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          <T>Your email appeared in the following data breaches. We recommend changing your passwords.</T>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {results.map((breach) => (
                  <Card key={breach.name} className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-destructive" />
                          {breach.name}
                        </span>
                        <Badge variant="destructive" className="text-[10px]">{breach.date}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground"><T>{breach.description}</T></p>
                      <div className="flex flex-wrap gap-1">
                        {breach.dataTypes.map((dt) => (
                          <Badge key={dt} variant="secondary" className="text-xs"><T>{dt}</T></Badge>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-1">
                        {acknowledged.has(breach.name) ? (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" /> <T>Acknowledged</T>
                          </Badge>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => acknowledgeAlert(breach.name)}>
                            <Eye className="h-3 w-3 mr-1" /> <T>Acknowledge</T>
                          </Button>
                        )}
                        <Link to="/password-checker">
                          <Button size="sm" variant="ghost">
                            <T>Change Password</T> →
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {/* Recommendations */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-base"><T>Recommended Actions</T></CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <KeyRound className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <T>Change passwords for all affected services immediately</T>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <T>Enable two-factor authentication wherever possible</T>
                  </li>
                  <li className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <T>Monitor your email for suspicious activity</T>
                  </li>
                  <li className="flex items-start gap-2">
                    <ExternalLink className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <T>Use a password manager to generate unique passwords</T>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
