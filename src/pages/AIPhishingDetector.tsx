import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Search, Sparkles, Mail, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { FreeToolsSection } from '@/components/FreeToolsSection';

interface AnalysisResult {
  verdict: 'safe' | 'suspicious' | 'phishing';
  confidence: number;
  reasons: string[];
  suspiciousElements: string[];
}

export default function AIPhishingDetector() {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeContent = async () => {
    if (!content.trim() || loading) return;

    // Check content length for security
    if (content.length > 10000) {
      setResult({
        verdict: 'suspicious',
        confidence: 50,
        reasons: ['Content exceeds maximum length for analysis'],
        suspiciousElements: ['Content too long to analyze fully']
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Try AI-powered analysis first (requires auth)
      if (user) {
        const response = await supabase.functions.invoke('analyze-phishing', {
          body: { content: content.trim() }
        });

        if (!response.error && response.data) {
          setResult(response.data);
          return;
        }
      }
      
      // Fallback to rule-based analysis
      setResult(performRuleBasedAnalysis(content));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Analysis error:', error);
      }
      // Fallback to rule-based analysis
      setResult(performRuleBasedAnalysis(content));
    } finally {
      setLoading(false);
    }
  };

  // Rule-based fallback analysis
  const performRuleBasedAnalysis = (text: string): AnalysisResult => {
    const suspiciousElements: string[] = [];
    let phishingScore = 0;

    // Check for suspicious patterns
    const patterns = [
      { regex: /urgent|immediately|act now|limited time/gi, reason: 'Urgency language detected', weight: 2 },
      { regex: /click here|click below|click this link/gi, reason: 'Generic click prompts', weight: 2 },
      { regex: /verify your (account|identity|password)/gi, reason: 'Account verification request', weight: 3 },
      { regex: /suspended|blocked|disabled/gi, reason: 'Threatening account status', weight: 3 },
      { regex: /password|login|credentials|ssn|social security/gi, reason: 'Sensitive data request', weight: 3 },
      { regex: /winner|congratulations|selected|lottery|prize/gi, reason: 'Too good to be true offer', weight: 3 },
      { regex: /http:\/\/[^\s]+/gi, reason: 'Unsecured HTTP link', weight: 2 },
      { regex: /bit\.ly|tinyurl|goo\.gl|t\.co/gi, reason: 'Shortened URL detected', weight: 2 },
      { regex: /@(?!gmail|outlook|yahoo|hotmail)[a-z0-9]+\.[a-z]{2,}/gi, reason: 'Unusual email domain', weight: 2 },
      { regex: /dear (customer|user|member|valued)/gi, reason: 'Generic greeting', weight: 1 },
      { regex: /\$\d+[,\d]*|\d+\s*(dollars|usd|gbp|eur)/gi, reason: 'Money mentioned', weight: 1 },
      { regex: /within \d+ (hour|day|minute)/gi, reason: 'Artificial deadline', weight: 2 },
    ];

    patterns.forEach(({ regex, reason, weight }) => {
      const matches = text.match(regex);
      if (matches) {
        phishingScore += weight;
        if (!suspiciousElements.includes(reason)) {
          suspiciousElements.push(reason);
        }
      }
    });

    // Check for mismatched URLs (text says one thing, link goes elsewhere)
    const urlPattern = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)</gi;
    let match;
    while ((match = urlPattern.exec(text)) !== null) {
      const href = match[1].toLowerCase();
      const linkText = match[2].toLowerCase();
      if (!href.includes(linkText) && !linkText.includes(href)) {
        suspiciousElements.push('Mismatched link text and URL');
        phishingScore += 3;
      }
    }

    let verdict: 'safe' | 'suspicious' | 'phishing' = 'safe';
    let confidence = 95;

    if (phishingScore >= 8) {
      verdict = 'phishing';
      confidence = Math.min(95, 60 + phishingScore * 3);
    } else if (phishingScore >= 4) {
      verdict = 'suspicious';
      confidence = Math.min(90, 50 + phishingScore * 5);
    } else {
      confidence = Math.max(60, 95 - phishingScore * 10);
    }

    const reasons = verdict === 'safe' 
      ? ['No obvious phishing indicators detected', 'Content appears legitimate'] 
      : suspiciousElements;

    return { verdict, confidence, reasons, suspiciousElements };
  };

  const getVerdictStyles = (verdict: string) => {
    switch (verdict) {
      case 'safe':
        return {
          bg: 'bg-success/10',
          border: 'border-success/30',
          icon: <CheckCircle className="h-8 w-8 text-success" />,
          text: 'text-success',
          label: 'Likely Safe'
        };
      case 'suspicious':
        return {
          bg: 'bg-warning/10',
          border: 'border-warning/30',
          icon: <AlertTriangle className="h-8 w-8 text-warning" />,
          text: 'text-warning',
          label: 'Suspicious'
        };
      case 'phishing':
        return {
          bg: 'bg-destructive/10',
          border: 'border-destructive/30',
          icon: <AlertTriangle className="h-8 w-8 text-destructive" />,
          text: 'text-destructive',
          label: 'Likely Phishing'
        };
      default:
        return {
          bg: 'bg-muted',
          border: 'border-border',
          icon: <Search className="h-8 w-8 text-muted-foreground" />,
          text: 'text-muted-foreground',
          label: 'Unknown'
        };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl cyber-gradient flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">AI Phishing Detector</h1>
              <p className="text-muted-foreground">Paste any email or message to check if it's a phishing attempt</p>
            </div>
          </div>
        </div>

        {/* Auth notice */}
        {!user && (
          <Card className="card-cyber mb-6 border-primary/30 animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <LogIn className="h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Log in for AI-powered analysis. Using rule-based detection for guests.
                  </p>
                </div>
                <Link to="/auth?mode=login">
                  <Button variant="outline" size="sm">Log In</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input */}
          <Card className="card-cyber animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Message to Analyze
              </CardTitle>
              <CardDescription>
                Paste the email body, SMS, or any suspicious message
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Example:\n\nDear Valued Customer,\n\nYour account has been suspended due to suspicious activity. Click here immediately to verify your identity and restore access: http://bit.ly/verify-now\n\nFailure to act within 24 hours will result in permanent account deletion.\n\nBank Security Team`}
                rows={12}
                maxLength={10000}
                className="mb-4 font-mono text-sm"
              />
              <Button 
                onClick={analyzeContent}
                disabled={!content.trim() || loading}
                className="w-full cyber-gradient"
              >
                {loading ? 'Analyzing...' : 'Analyze Message'}
                <Shield className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Verdict Card */}
                <Card 
                  className={`card-cyber animate-scale-in ${getVerdictStyles(result.verdict).border}`}
                >
                  <CardContent className="pt-6">
                    <div className={`p-6 rounded-lg ${getVerdictStyles(result.verdict).bg} text-center`}>
                      <div className="mb-3">
                        {getVerdictStyles(result.verdict).icon}
                      </div>
                      <h3 className={`text-2xl font-bold font-display ${getVerdictStyles(result.verdict).text}`}>
                        {getVerdictStyles(result.verdict).label}
                      </h3>
                      <p className="text-muted-foreground mt-1">
                        {result.confidence}% confidence
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis Details */}
                {result.suspiciousElements.length > 0 && (
                  <Card className="card-cyber animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                        Suspicious Indicators
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.suspiciousElements.map((element, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2" />
                            <span className="text-sm text-muted-foreground">{element}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Tips */}
                <Card className="card-cyber border-primary/30 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Safety Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                        Never click links in suspicious emails
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                        Verify sender by contacting the company directly
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                        Check the actual URL before clicking
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                        Report phishing attempts to your email provider
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="card-cyber h-full flex items-center justify-center min-h-[300px]">
                <CardContent className="text-center">
                  <Shield className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Paste a message and click "Analyze" to check for phishing indicators
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        <FreeToolsSection layout="compact" />
      </main>

      <Footer />
    </div>
  );
}