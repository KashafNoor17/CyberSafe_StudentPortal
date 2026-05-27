import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Award, Search, Download, Trash2, RefreshCw, ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Certificate {
  id: string;
  user_id: string;
  certificate_number: string;
  verification_id: string;
  issued_at: string;
  is_verified: boolean;
  user_name?: string;
  user_email?: string;
}

export function CertificateManagement() {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data: certsData } = await supabase
        .from('certificates')
        .select('*')
        .order('issued_at', { ascending: false });

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, name, email');

      if (certsData) {
        const certsWithUsers = certsData.map(cert => {
          const profile = profilesData?.find(p => p.user_id === cert.user_id);
          return {
            ...cert,
            user_name: profile?.name || 'Unknown',
            user_email: profile?.email || ''
          };
        });
        setCertificates(certsWithUsers);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeCertificate = async (certId: string) => {
    if (!confirm('Revoke this certificate? It will no longer be valid.')) return;

    try {
      const { error } = await supabase
        .from('certificates')
        .update({ is_verified: false })
        .eq('id', certId);

      if (error) throw error;
      toast({ title: 'Certificate revoked' });
      fetchCertificates();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error revoking certificate' });
    }
  };

  const handleReinstateAll = async (certId: string) => {
    try {
      const { error } = await supabase
        .from('certificates')
        .update({ is_verified: true })
        .eq('id', certId);

      if (error) throw error;
      toast({ title: 'Certificate reinstated' });
      fetchCertificates();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error reinstating certificate' });
    }
  };

  const exportCertificates = () => {
    const csvContent = [
      ['Certificate Number', 'User Name', 'Email', 'Issued Date', 'Verified', 'Verification ID'].join(','),
      ...certificates.map(c => [
        c.certificate_number,
        c.user_name,
        c.user_email,
        new Date(c.issued_at).toLocaleDateString(),
        c.is_verified ? 'Yes' : 'No',
        c.verification_id
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificates-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Certificates exported' });
  };

  const filteredCertificates = certificates.filter(c =>
    c.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.certificate_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certificate Management
            </CardTitle>
            <CardDescription>{certificates.length} certificates issued</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search certificates..."
                className="pl-9 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={exportCertificates} title="Export CSV">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {filteredCertificates.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No certificates found</p>
          ) : (
            filteredCertificates.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-medium">{cert.certificate_number}</span>
                    <Badge variant={cert.is_verified ? 'default' : 'destructive'}>
                      {cert.is_verified ? 'Valid' : 'Revoked'}
                    </Badge>
                  </div>
                  <p className="text-sm">{cert.user_name}</p>
                  <p className="text-xs text-muted-foreground">{cert.user_email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Issued {formatDistanceToNow(new Date(cert.issued_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(`/verify/${cert.verification_id}`, '_blank')}
                    title="View verification page"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  {cert.is_verified ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleRevokeCertificate(cert.id)}
                      title="Revoke certificate"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-success"
                      onClick={() => handleReinstateAll(cert.id)}
                      title="Reinstate certificate"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
