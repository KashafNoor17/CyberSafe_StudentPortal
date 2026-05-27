import { useState, useRef } from 'react';
import { Award, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import html2canvas from 'html2canvas';

interface ModuleCertificateProps {
  moduleTitle: string;
  isCompleted: boolean;
  completedDate?: string;
}

export function ModuleCertificate({ moduleTitle, isCompleted, completedDate }: ModuleCertificateProps) {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  if (!isCompleted || !user) return null;

  const certId = `MOD-${Date.now().toString(36).toUpperCase()}`;
  const displayDate = completedDate
    ? new Date(completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      certRef.current.style.display = 'block';
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      certRef.current.style.display = 'none';

      const link = document.createElement('a');
      link.download = `CyberSafe-${moduleTitle.replace(/\s+/g, '-')}-Certificate.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // silent
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    const text = `I just completed the "${moduleTitle}" module on CyberSafe Education! 🛡️`;
    if (navigator.share) {
      navigator.share({ title: 'Module Certificate', text });
    } else {
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <>
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Module Certificate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Congratulations! You've earned a certificate for completing <strong>{moduleTitle}</strong>.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleDownload} disabled={downloading} size="sm">
              <Download className="h-4 w-4 mr-1" />
              {downloading ? 'Generating...' : 'Download'}
            </Button>
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden certificate for download */}
      <div ref={certRef} style={{ display: 'none', width: '900px', padding: '60px', fontFamily: 'Georgia, serif', background: '#fff' }}>
        <div style={{ border: '4px double #6366f1', padding: '50px', textAlign: 'center' }}>
          <div style={{ position: 'absolute' as const }} />
          <p style={{ fontSize: '14px', letterSpacing: '4px', color: '#6366f1', textTransform: 'uppercase' as const }}>CyberSafe Education</p>
          <h1 style={{ fontSize: '36px', margin: '20px 0', color: '#1e1b4b' }}>Certificate of Completion</h1>
          <div style={{ width: '80px', height: '3px', background: 'linear-gradient(to right, #6366f1, #8b5cf6)', margin: '0 auto 30px' }} />
          <p style={{ fontSize: '16px', color: '#6b7280' }}>This is to certify that</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e1b4b', margin: '16px 0' }}>{user.email}</p>
          <p style={{ fontSize: '16px', color: '#6b7280' }}>has successfully completed the</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#6366f1', margin: '16px 0', padding: '10px 20px', background: '#eef2ff', display: 'inline-block', borderRadius: '8px' }}>
            {moduleTitle}
          </p>
          <p style={{ fontSize: '16px', color: '#6b7280', marginTop: '8px' }}>module on {displayDate}</p>
          <div style={{ marginTop: '40px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>Certificate ID: {certId}</p>
            <div style={{ borderBottom: '1px solid #374151', width: '200px', margin: '30px auto 4px' }} />
            <p style={{ fontSize: '14px', color: '#4b5563' }}>CyberSafe Education Team</p>
          </div>
        </div>
      </div>
    </>
  );
}
