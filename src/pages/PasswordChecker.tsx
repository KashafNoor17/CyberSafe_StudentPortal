import { useState, useMemo } from 'react';
import { Lock, CheckCircle, XCircle, AlertTriangle, Info, Shield, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Progress } from '@/components/ui/progress';
import { T } from '@/components/T';

interface PasswordAnalysis {
  strength: 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
  entropy: number;
  crackTime: string;
  crackTimeSeconds: number;
  requirements: {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    specialChar: boolean;
    noRepeats: boolean;
    noSequential: boolean;
  };
  suggestions: string[];
}

// Calculate password entropy
function calculateEntropy(password: string): number {
  if (!password) return 0;
  
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[!@#$%^&*(),.?":{}|<>\-_=+\[\]\\\/`~;']/.test(password)) charsetSize += 32;
  
  if (charsetSize === 0) return 0;
  return password.length * Math.log2(charsetSize);
}

// Estimate crack time based on entropy
function estimateCrackTime(entropy: number): { time: string; seconds: number } {
  // Assuming 10 billion guesses per second (high-end GPU cluster)
  const guessesPerSecond = 10_000_000_000;
  const totalCombinations = Math.pow(2, entropy);
  const seconds = totalCombinations / guessesPerSecond / 2; // Average case is half
  
  if (seconds < 1) return { time: 'instantly', seconds: 0 };
  if (seconds < 60) return { time: `${Math.round(seconds)} seconds`, seconds };
  if (seconds < 3600) return { time: `${Math.round(seconds / 60)} minutes`, seconds };
  if (seconds < 86400) return { time: `${Math.round(seconds / 3600)} hours`, seconds };
  if (seconds < 2592000) return { time: `${Math.round(seconds / 86400)} days`, seconds };
  if (seconds < 31536000) return { time: `${Math.round(seconds / 2592000)} months`, seconds };
  if (seconds < 31536000 * 100) return { time: `${Math.round(seconds / 31536000)} years`, seconds };
  if (seconds < 31536000 * 1000) return { time: `${Math.round(seconds / 31536000)} centuries`, seconds };
  if (seconds < 31536000 * 1000000) return { time: `${Math.round(seconds / (31536000 * 1000))} millennia`, seconds };
  return { time: 'millions of years', seconds };
}

function analyzePassword(password: string): PasswordAnalysis {
  const entropy = calculateEntropy(password);
  const crackTimeResult = estimateCrackTime(entropy);
  
  const requirements = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>\-_=+\[\]\\\/`~;']/.test(password),
    noRepeats: !/(.)\1{2,}/.test(password),
    noSequential: !/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password),
  };

  const metCount = Object.values(requirements).filter(Boolean).length;
  let score = (metCount / 7) * 50;
  
  // Bonus for length
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 15;
  if (password.length >= 20) score += 10;
  
  // Bonus for entropy
  if (entropy >= 60) score += 10;
  
  // Penalty for patterns
  if (/^[a-z]+$/.test(password) || /^[A-Z]+$/.test(password)) score -= 20;
  if (/^[0-9]+$/.test(password)) score -= 30;

  score = Math.max(0, Math.min(100, score));

  const suggestions: string[] = [];
  if (!requirements.minLength) suggestions.push('Use at least 8 characters');
  if (!requirements.uppercase) suggestions.push('Add uppercase letters (A-Z)');
  if (!requirements.lowercase) suggestions.push('Add lowercase letters (a-z)');
  if (!requirements.number) suggestions.push('Include numbers (0-9)');
  if (!requirements.specialChar) suggestions.push('Add special characters (!@#$%^&*)');
  if (!requirements.noRepeats) suggestions.push('Avoid repeating characters (e.g., aaa)');
  if (!requirements.noSequential) suggestions.push('Avoid sequential patterns (e.g., 123, abc)');
  if (password.length < 12) suggestions.push('Consider using 12+ characters');
  if (password.length < 16 && password.length >= 12) suggestions.push('For maximum security, use 16+ characters');

  let strength: PasswordAnalysis['strength'] = 'very-weak';
  if (score >= 85) strength = 'very-strong';
  else if (score >= 70) strength = 'strong';
  else if (score >= 50) strength = 'medium';
  else if (score >= 30) strength = 'weak';

  return { 
    strength, 
    score, 
    entropy: Math.round(entropy * 10) / 10,
    crackTime: crackTimeResult.time,
    crackTimeSeconds: crackTimeResult.seconds,
    requirements, 
    suggestions 
  };
}

const strengthConfig = {
  'very-weak': { color: 'text-red-500', bg: 'bg-red-500', label: 'Very Weak', gradient: 'from-red-500 to-red-600' },
  'weak': { color: 'text-orange-500', bg: 'bg-orange-500', label: 'Weak', gradient: 'from-orange-500 to-orange-600' },
  'medium': { color: 'text-yellow-500', bg: 'bg-yellow-500', label: 'Medium', gradient: 'from-yellow-500 to-yellow-600' },
  'strong': { color: 'text-green-500', bg: 'bg-green-500', label: 'Strong', gradient: 'from-green-500 to-green-600' },
  'very-strong': { color: 'text-emerald-400', bg: 'bg-emerald-400', label: 'Very Strong', gradient: 'from-emerald-400 to-cyan-400' },
};

export default function PasswordChecker() {
  const [password, setPassword] = useState('');
  
  const analysis = useMemo(() => {
    if (!password.trim()) return null;
    return analyzePassword(password);
  }, [password]);

  const config = analysis ? strengthConfig[analysis.strength] : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center cyber-glow">
              <Lock className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold"><T>Password Strength Checker</T></h1>
              <p className="text-muted-foreground"><T>Analyze your password's security in real-time</T></p>
            </div>
          </div>
        </div>

        {/* Input Card */}
        <Card className="mb-6 card-glow animate-fade-in border-border/50" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <T>Enter a Password to Test</T>
            </CardTitle>
            <CardDescription>
              <T>Your password is analyzed locally and never sent to any server.</T>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Type your password here..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-lg font-mono"
              autoComplete="off"
            />
            
            {/* Live Strength Bar */}
            {analysis && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={config?.color}><T>{config?.label ?? ''}</T></span>
                  <span className="text-muted-foreground">{analysis.score}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ease-out bg-gradient-to-r ${config?.gradient}`}
                    style={{ width: `${analysis.score}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {analysis && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Entropy Card */}
              <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground"><T>Entropy</T></p>
                      <p className="text-2xl font-bold text-primary">{analysis.entropy} <T>bits</T></p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <T>Higher entropy = more random & secure</T>
                  </p>
                </CardContent>
              </Card>

              {/* Crack Time Card */}
              <Card className="border-border/50 bg-gradient-to-br from-secondary/5 to-secondary/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground"><T>Time to Crack</T></p>
                      <p className="text-2xl font-bold text-secondary"><T>{analysis.crackTime}</T></p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <T>Estimated using 10B guesses/sec</T>
                  </p>
                </CardContent>
              </Card>

              {/* Score Card */}
              <Card className={`border-border/50 bg-gradient-to-br ${config?.gradient?.replace('from-', 'from-').replace(' to-', '/5 to-')}/10`}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg ${config?.bg}/20 flex items-center justify-center`}>
                      <Shield className={`h-5 w-5 ${config?.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground"><T>Overall Score</T></p>
                      <p className={`text-2xl font-bold ${config?.color}`}>{analysis.score}/100</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <T>Based on length, complexity & patterns</T>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Visual Strength Meter */}
            <Card className="border-border/50 overflow-hidden">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <T>Strength Visualization</T>
                </h3>
                <div className="flex gap-1 h-8">
                  {[20, 40, 60, 80, 100].map((threshold, i) => (
                    <div 
                      key={threshold}
                      className={`flex-1 rounded transition-all duration-300 ${
                        analysis.score >= threshold 
                          ? `bg-gradient-to-r ${strengthConfig[
                              threshold <= 20 ? 'very-weak' :
                              threshold <= 40 ? 'weak' :
                              threshold <= 60 ? 'medium' :
                              threshold <= 80 ? 'strong' : 'very-strong'
                            ].gradient} cyber-glow`
                          : 'bg-muted/50'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span><T>Very Weak</T></span>
                  <span><T>Weak</T></span>
                  <span><T>Medium</T></span>
                  <span><T>Strong</T></span>
                  <span><T>Very Strong</T></span>
                </div>
              </CardContent>
            </Card>

            {/* Requirements Checklist */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <T>Security Requirements</T>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: 'minLength', label: 'At least 8 characters' },
                    { key: 'uppercase', label: 'Uppercase letter (A-Z)' },
                    { key: 'lowercase', label: 'Lowercase letter (a-z)' },
                    { key: 'number', label: 'Number (0-9)' },
                    { key: 'specialChar', label: 'Special character (!@#$%)' },
                    { key: 'noRepeats', label: 'No repeated characters' },
                    { key: 'noSequential', label: 'No sequential patterns' },
                  ].map(({ key, label }) => {
                    const met = analysis.requirements[key as keyof typeof analysis.requirements];
                    return (
                      <div 
                        key={key} 
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                          met ? 'bg-success/10 border border-success/20' : 'bg-muted/30 border border-border/50'
                        }`}
                      >
                        {met ? (
                          <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={`text-sm ${met ? 'text-foreground' : 'text-muted-foreground'}`}>
                          <T>{label}</T>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <Card className="border-warning/30 bg-warning/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <T>Improvement Suggestions</T>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-warning mt-1">→</span>
                        <T>{suggestion}</T>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  <T>Pro Tips</T>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <T>Use a unique password for each account</T>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <T>Consider using a password manager like Bitwarden or 1Password</T>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <T>Passphrases (multiple words) can be both strong and memorable</T>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <T>Enable two-factor authentication (2FA) whenever available</T>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <T>Never share your passwords with anyone</T>
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
