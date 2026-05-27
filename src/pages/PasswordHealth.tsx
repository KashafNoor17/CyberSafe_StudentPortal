import { useState, useMemo, useCallback } from 'react';
import { Lock, AlertTriangle, CheckCircle, Plus, Trash2, Shield, RefreshCw, Key } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface PasswordEntry {
  id: string;
  service: string;
  strength: 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
  ageMonths: number;
  isReused: boolean;
  issues: string[];
}

function analyzePasswordStrength(password: string): { strength: PasswordEntry['strength']; score: number; issues: string[] } {
  if (!password) return { strength: 'very-weak', score: 0, issues: ['Empty password'] };
  
  const issues: string[] = [];
  let score = 0;
  
  if (password.length >= 8) score += 15; else issues.push('Less than 8 characters');
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 10;
  if (/[A-Z]/.test(password)) score += 10; else issues.push('No uppercase letters');
  if (/[a-z]/.test(password)) score += 10; else issues.push('No lowercase letters');
  if (/[0-9]/.test(password)) score += 10; else issues.push('No numbers');
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15; else issues.push('No special characters');
  if (!/(.)\1{2,}/.test(password)) score += 5; else issues.push('Contains repeated characters');
  if (!/(?:123|abc|qwerty|password)/i.test(password)) score += 10; else issues.push('Contains common patterns');
  
  score = Math.min(100, score);
  
  let strength: PasswordEntry['strength'] = 'very-weak';
  if (score >= 85) strength = 'very-strong';
  else if (score >= 70) strength = 'strong';
  else if (score >= 50) strength = 'medium';
  else if (score >= 30) strength = 'weak';
  
  return { strength, score, issues };
}

function generateStrongPassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
  const array = new Uint8Array(20);
  crypto.getRandomValues(array);
  return Array.from(array, b => chars[b % chars.length]).join('');
}

const strengthColors: Record<string, string> = {
  'very-weak': 'text-red-500',
  weak: 'text-orange-500',
  medium: 'text-yellow-500',
  strong: 'text-green-500',
  'very-strong': 'text-emerald-400',
};

const strengthLabels: Record<string, string> = {
  'very-weak': 'Very Weak',
  weak: 'Weak',
  medium: 'Medium',
  strong: 'Strong',
  'very-strong': 'Very Strong',
};

export default function PasswordHealth() {
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [newService, setNewService] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

  const addEntry = useCallback(() => {
    if (!newService.trim() || !newPassword.trim()) return;
    if (newService.length > 100 || newPassword.length > 200) return;
    
    const analysis = analyzePasswordStrength(newPassword);
    const isReused = entries.some(e => e.score === analysis.score && e.strength === analysis.strength);
    
    setEntries(prev => [...prev, {
      id: crypto.randomUUID(),
      service: newService.trim().substring(0, 100),
      strength: analysis.strength,
      score: analysis.score,
      ageMonths: 0,
      isReused,
      issues: analysis.issues,
    }]);
    setNewService('');
    setNewPassword('');
  }, [newService, newPassword, entries]);

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const stats = useMemo(() => {
    if (entries.length === 0) return null;
    const weak = entries.filter(e => e.score < 50).length;
    const reused = entries.filter(e => e.isReused).length;
    const avgScore = Math.round(entries.reduce((s, e) => s + e.score, 0) / entries.length);
    return { weak, reused, avgScore, total: entries.length };
  }, [entries]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Key className="h-8 w-8 text-primary" />
            Password Health Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Analyze your passwords locally — nothing leaves your browser
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-fade-in">
            <Card className="border-border/50">
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Passwords</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-4 text-center">
                <p className={`text-2xl font-bold ${stats.avgScore >= 70 ? 'text-green-500' : stats.avgScore >= 50 ? 'text-yellow-500' : 'text-destructive'}`}>
                  {stats.avgScore}%
                </p>
                <p className="text-xs text-muted-foreground">Average Strength</p>
              </CardContent>
            </Card>
            <Card className={`border-border/50 ${stats.weak > 0 ? 'border-destructive/30' : ''}`}>
              <CardContent className="pt-4 text-center">
                <p className={`text-2xl font-bold ${stats.weak > 0 ? 'text-destructive' : 'text-green-500'}`}>{stats.weak}</p>
                <p className="text-xs text-muted-foreground">Weak Passwords</p>
              </CardContent>
            </Card>
            <Card className={`border-border/50 ${stats.reused > 0 ? 'border-orange-500/30' : ''}`}>
              <CardContent className="pt-4 text-center">
                <p className={`text-2xl font-bold ${stats.reused > 0 ? 'text-orange-500' : 'text-green-500'}`}>{stats.reused}</p>
                <p className="text-xs text-muted-foreground">Possibly Reused</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Password */}
        <Card className="mb-6 border-border/50 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Analyze a Password
            </CardTitle>
            <CardDescription>
              Enter a service name and password to check. Everything stays in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Service (e.g., Gmail)"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                maxLength={100}
                className="flex-1"
              />
              <Input
                type="text"
                placeholder="Password to check"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                maxLength={200}
                className="flex-1 font-mono"
                autoComplete="off"
              />
              <Button onClick={addEntry} disabled={!newService.trim() || !newPassword.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Password Generator */}
        <Card className="mb-6 border-primary/20 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Password Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                readOnly
                value={generatedPassword}
                placeholder="Click Generate to create a strong password"
                className="flex-1 font-mono text-sm"
              />
              <Button variant="outline" onClick={() => setGeneratedPassword(generateStrongPassword())}>
                Generate
              </Button>
              {generatedPassword && (
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPassword);
                  }}
                >
                  Copy
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Password List */}
        {entries.length > 0 ? (
          <div className="space-y-3 animate-fade-in">
            <h2 className="font-semibold text-lg">Your Passwords</h2>
            {entries.map((entry) => (
              <Card key={entry.id} className={`border-border/50 ${entry.score < 50 ? 'border-destructive/20' : ''}`}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{entry.service}</span>
                      {entry.isReused && (
                        <Badge variant="destructive" className="text-[10px]">Possibly Reused</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${strengthColors[entry.strength]}`}>
                        {strengthLabels[entry.strength]}
                      </span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeEntry(entry.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={entry.score} className="h-1.5 mb-2" />
                  {entry.issues.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.issues.map((issue, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] text-muted-foreground">
                          {issue}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">No passwords analyzed yet</h3>
              <p className="text-sm text-muted-foreground">
                Add a service and password above to start analyzing your password health.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="mt-6 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">Password Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Use a unique password for every account</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Use a password manager (Bitwarden, 1Password)</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Enable 2FA on all important accounts</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Change passwords every 90 days for sensitive accounts</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Use passphrases: 4+ random words are strong and memorable</li>
            </ul>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
