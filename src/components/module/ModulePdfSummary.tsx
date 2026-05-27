import { useState, useRef } from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import html2canvas from 'html2canvas';

interface PdfSummaryData {
  key_concepts?: string[];
  key_terms?: Array<{ term: string; definition: string }>;
  best_practices?: string[];
  next_modules?: string[];
}

interface ModulePdfSummaryProps {
  moduleTitle: string;
  difficulty: string;
  pdfSummary: PdfSummaryData | null;
}

export function ModulePdfSummary({ moduleTitle, difficulty, pdfSummary }: ModulePdfSummaryProps) {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  if (!pdfSummary || Object.keys(pdfSummary).length === 0) return null;

  const handleDownload = async () => {
    if (!summaryRef.current) return;
    setGenerating(true);
    try {
      // Temporarily show the printable content
      summaryRef.current.style.display = 'block';
      const canvas = await html2canvas(summaryRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      summaryRef.current.style.display = 'none';

      const link = document.createElement('a');
      link.download = `${moduleTitle.replace(/\s+/g, '-')}-Summary.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // Fallback: open print dialog
      window.print();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Module Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pdfSummary.key_concepts && (
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">Key Concepts</h4>
              <ul className="space-y-1">
                {pdfSummary.key_concepts.map((concept, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    {concept}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pdfSummary.key_terms && (
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">Key Terms</h4>
              <dl className="space-y-2">
                {pdfSummary.key_terms.map((item, i) => (
                  <div key={i}>
                    <dt className="text-sm font-medium">{item.term}</dt>
                    <dd className="text-sm text-muted-foreground ml-4">{item.definition}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {pdfSummary.best_practices && (
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">Best Practices</h4>
              <ol className="space-y-1 list-decimal list-inside">
                {pdfSummary.best_practices.map((practice, i) => (
                  <li key={i} className="text-sm">{practice}</li>
                ))}
              </ol>
            </div>
          )}

          <Button onClick={handleDownload} disabled={generating} variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            {generating ? 'Generating...' : 'Download Summary'}
          </Button>
        </CardContent>
      </Card>

      {/* Hidden printable summary */}
      <div ref={summaryRef} style={{ display: 'none', width: '800px', padding: '40px', fontFamily: 'system-ui' }}>
        <div style={{ borderBottom: '3px solid #6366f1', paddingBottom: '16px', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e1b4b' }}>CyberSafe Module Summary</h1>
          <p style={{ fontSize: '18px', color: '#4338ca', marginTop: '4px' }}>{moduleTitle}</p>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Difficulty: {difficulty} • Date: {new Date().toLocaleDateString()}</p>
          {user && <p style={{ fontSize: '14px', color: '#6b7280' }}>Student: {user.email}</p>}
        </div>

        {pdfSummary.key_concepts && (
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', color: '#374151', marginBottom: '8px' }}>Key Concepts</h2>
            {pdfSummary.key_concepts.map((c, i) => (
              <p key={i} style={{ fontSize: '14px', marginLeft: '16px', marginBottom: '4px' }}>• {c}</p>
            ))}
          </div>
        )}

        {pdfSummary.key_terms && (
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', color: '#374151', marginBottom: '8px' }}>Key Terms</h2>
            {pdfSummary.key_terms.map((t, i) => (
              <p key={i} style={{ fontSize: '14px', marginLeft: '16px', marginBottom: '4px' }}>
                <strong>{t.term}:</strong> {t.definition}
              </p>
            ))}
          </div>
        )}

        {pdfSummary.best_practices && (
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', color: '#374151', marginBottom: '8px' }}>Best Practices</h2>
            {pdfSummary.best_practices.map((p, i) => (
              <p key={i} style={{ fontSize: '14px', marginLeft: '16px', marginBottom: '4px' }}>{i + 1}. {p}</p>
            ))}
          </div>
        )}

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '24px' }}>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>Generated by CyberSafe Education Platform</p>
        </div>
      </div>
    </>
  );
}
