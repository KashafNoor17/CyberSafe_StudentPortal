import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Award, CheckCircle, XCircle, Search, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

interface CertificateData {
  certificate_number: string;
  verification_id: string;
  issued_at: string;
  student_name: string;
  is_valid: boolean;
}

export default function CertificateVerify() {
  const { verificationId } = useParams<{ verificationId: string }>();
  const [searchParams] = useSearchParams();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchInput, setSearchInput] = useState(verificationId || searchParams.get('id') || '');

  useEffect(() => {
    if (verificationId || searchParams.get('id')) {
      handleSearch();
    }
  }, [verificationId]);

  const handleSearch = async () => {
    const idToSearch = searchInput.trim().toUpperCase();
    if (!idToSearch || idToSearch.length < 5) return;

    setLoading(true);
    setSearched(true);
    setCertificate(null);

    try {
      // Use secure RPC function for certificate verification
      const { data, error } = await supabase.rpc('verify_certificate', {
        p_verification_id: idToSearch
      });

      if (error) throw error;

      // The RPC returns an array with one row if found
      if (data && data.length > 0) {
        const cert = data[0];
        setCertificate({
          certificate_number: cert.certificate_number,
          verification_id: cert.verification_id || '',
          issued_at: cert.issued_at,
          student_name: cert.student_name,
          is_valid: cert.is_valid
        });
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error verifying certificate:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-display mb-2">
            Certificate Verification
          </h1>
          <p className="text-muted-foreground">
            Verify the authenticity of a CyberSafe certificate
          </p>
        </div>

        {/* Search */}
        <Card className="card-cyber mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Input
                placeholder="Enter Certificate ID (e.g., CYBER-XXXXXXXX)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading || searchInput.trim().length < 5} className="cyber-gradient">
                {loading ? 'Verifying...' : 'Verify'}
                <Search className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {searched && !loading && (
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {certificate ? (
              <Card className="card-cyber border-success/30">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 rounded-full bg-success/10 mx-auto flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                  <CardTitle className="text-success">Certificate Verified</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-success/5 border border-success/20 rounded-lg p-6">
                    <div className="text-center mb-6">
                      <Award className="h-12 w-12 text-primary mx-auto mb-2" />
                      <h3 className="text-xl font-bold">CyberSafe Awareness Certificate</h3>
                    </div>
                    
                    <div className="grid gap-4">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-muted-foreground">Student Name</span>
                        <span className="font-semibold">{certificate.student_name}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-muted-foreground">Certificate Number</span>
                        <span className="font-mono text-sm">{certificate.certificate_number}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-muted-foreground">Verification ID</span>
                        <span className="font-mono text-sm">{certificate.verification_id}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">Issue Date</span>
                        <span className="font-medium">
                          {new Date(certificate.issued_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="card-cyber border-destructive/30">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 mx-auto flex items-center justify-center mb-4">
                    <XCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <CardTitle className="text-destructive">Certificate Not Found</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    No certificate found with the provided ID. Please check the ID and try again.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}