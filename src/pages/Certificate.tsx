import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Download, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { CertificateTemplate, ShareCertificate } from '@/components/certificate';

interface Certificate {
  id: string;
  certificate_number: string;
  verification_id: string | null;
  issued_at: string;
}

export default function Certificate() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackActivity } = useActivityTracker();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isEligible, setIsEligible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  // Use the current origin so verification links work on any deployment
  const baseUrl = window.location.origin;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkEligibilityAndFetch();
    }
  }, [user]);

  const checkEligibilityAndFetch = async () => {
    try {
      // Check module completion
      const { data: modules } = await supabase
        .from('learning_modules')
        .select('id');
      
      const { data: completions } = await supabase
        .from('module_completions')
        .select('module_id')
        .eq('user_id', user!.id);

      const allModulesCompleted = modules?.length === completions?.length;

      // Check quiz score
      const { data: quizResult } = await supabase
        .from('quiz_results')
        .select('score, total_questions')
        .eq('user_id', user!.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const quizPassed = quizResult && (quizResult.score / quizResult.total_questions) >= 0.7;
      
      setIsEligible(allModulesCompleted && quizPassed);

      // Fetch existing certificate
      const { data: cert } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      setCertificate(cert);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error checking eligibility:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async () => {
    if (!isEligible || certificate) return;
    
    setGenerating(true);
    try {
      const { data, error } = await supabase.rpc('generate_certificate');

      if (error) throw error;
      
      const result = data as { success: boolean; certificate_number?: string; error?: string };
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate certificate');
      }

      // Check for new badges (Cyber Defender)
      await supabase.rpc('check_and_award_badges');

      // Refresh certificate data
      const { data: cert } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      setCertificate(cert);

      // Track certificate earned
      trackActivity('certificate_earned', undefined, {
        certificate_number: result.certificate_number,
      });

      toast({
        title: 'Certificate Generated!',
        description: 'Congratulations on your achievement!',
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error generating certificate:', error);
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate certificate.',
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadCertificate = () => {
    if (!certificateRef.current) return;
    
    import('html2canvas').then(({ default: html2canvas }) => {
      html2canvas(certificateRef.current!, {
        scale: 2,
        backgroundColor: '#ffffff'
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `CyberSafe-Certificate-${profile?.name || 'Student'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isEligible && !certificate) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
          <Card className="card-glow animate-scale-in">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">Certificate Locked</CardTitle>
              <CardDescription>
                Complete all requirements to unlock your certificate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                  <span>Complete all learning modules</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                  <span>Pass the phishing quiz with 70% or higher</span>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  const formattedDate = certificate 
    ? new Date(certificate.issued_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  const verificationId = certificate?.verification_id || certificate?.certificate_number || '';
  const verificationUrl = `${baseUrl}/verify/${verificationId}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <Award className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {certificate ? 'Your Certificate' : 'Claim Your Certificate'}
          </h1>
          <p className="text-muted-foreground">
            {certificate 
              ? 'Congratulations on completing the CyberSafe course!'
              : 'You\'ve met all the requirements. Generate your certificate now!'
            }
          </p>
        </div>

        {!certificate ? (
          <div className="text-center animate-scale-in">
            <Button size="lg" onClick={generateCertificate} disabled={generating} className="cyber-gradient">
              {generating ? 'Generating...' : 'Generate Certificate'}
              <Award className="ml-2 h-5 w-5" />
            </Button>
          </div>
        ) : (
          <>
            {/* Certificate Preview */}
            <div ref={certificateRef} className="mb-6 animate-scale-in">
              <CertificateTemplate 
                name={profile?.name || 'Student'}
                certificateNumber={certificate.certificate_number}
                verificationId={verificationId}
                issueDate={formattedDate}
                verificationUrl={verificationUrl}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Button size="lg" onClick={downloadCertificate} className="cyber-gradient">
                <Download className="mr-2 h-5 w-5" />
                Download Certificate
              </Button>
              
              <ShareCertificate 
                certificateNumber={certificate.certificate_number}
                verificationUrl={verificationUrl}
                studentName={profile?.name || 'Student'}
              />
            </div>

            {/* Verification Info */}
            <div className="mt-8 text-center text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <p>Others can verify your certificate at:</p>
              <a 
                href={verificationUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-mono text-xs break-all"
              >
                {verificationUrl}
              </a>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
