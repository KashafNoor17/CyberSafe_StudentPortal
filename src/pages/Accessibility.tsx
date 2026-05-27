import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Shield, Keyboard, Eye, Monitor, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Accessibility() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main id="main-content" className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Accessibility Statement</h1>
              <p className="text-muted-foreground">Our commitment to digital inclusion</p>
            </div>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section aria-labelledby="commitment-heading">
            <h2 id="commitment-heading" className="text-xl font-semibold mb-3">Our Commitment</h2>
            <p className="text-muted-foreground leading-relaxed">
              CyberSafe is committed to ensuring digital accessibility for people of all abilities. 
              We continually improve the user experience for everyone and apply the relevant accessibility 
              standards to achieve WCAG 2.1 Level AA conformance.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Keyboard className="h-5 w-5 text-primary" aria-hidden="true" />
                  Keyboard Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>All interactive elements are keyboard accessible:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Tab</kbd> — Move between elements</li>
                  <li><kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> / <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Space</kbd> — Activate buttons</li>
                  <li><kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Escape</kbd> — Close dialogs and menus</li>
                  <li>Skip-to-content link at the top of every page</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="h-5 w-5 text-primary" aria-hidden="true" />
                  Visual Accessibility
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Visual accommodations include:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Minimum 4.5:1 color contrast ratio</li>
                  <li>Adjustable text size (75%–150%)</li>
                  <li>High contrast mode</li>
                  <li>Dyslexia-friendly font option</li>
                  <li>Reduced motion support</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Monitor className="h-5 w-5 text-primary" aria-hidden="true" />
                  Screen Reader Support
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Assistive technology features:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Semantic HTML with proper heading hierarchy</li>
                  <li>ARIA landmarks for page regions</li>
                  <li>ARIA labels on all icon-only buttons</li>
                  <li>Live regions for dynamic content updates</li>
                  <li>Alt text on all meaningful images</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5 text-primary" aria-hidden="true" />
                  Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>We welcome your feedback on accessibility:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Use the accessibility settings panel (gear icon, bottom-left)</li>
                  <li>Report issues via the Community forums</li>
                  <li>Email us at contact@cybersafe.edu</li>
                </ul>
                <p className="mt-2">We aim to respond to feedback within 5 business days.</p>
              </CardContent>
            </Card>
          </div>

          <section aria-labelledby="standards-heading">
            <h2 id="standards-heading" className="text-xl font-semibold mb-3">Standards</h2>
            <p className="text-muted-foreground leading-relaxed">
              This site targets conformance with WCAG 2.1 Level AA. These guidelines explain 
              how to make web content more accessible. Conformance with these guidelines helps 
              make the web more user-friendly for everyone.
            </p>
          </section>

          <section aria-labelledby="limitations-heading">
            <h2 id="limitations-heading" className="text-xl font-semibold mb-3">Known Limitations</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Some third-party embedded content may not be fully accessible</li>
              <li>PDF certificates are generated as images and may require alt text improvements</li>
              <li>Complex data visualizations (charts) provide limited screen reader descriptions</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
