import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Cookies() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main id="main-content" className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold font-display mb-8">Cookie Policy</h1>

        <div className="space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold mb-3">What Are Cookies?</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help us remember your preferences and improve your experience.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Cookies We Use</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential cookies:</strong> Required for authentication and security. These cannot be disabled.</li>
              <li><strong>Preference cookies:</strong> Store your accessibility settings (font size, contrast mode, reduced motion).</li>
              <li><strong>Analytics cookies:</strong> Help us understand how users interact with the platform so we can improve it. These are anonymised.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Managing Cookies</h2>
            <p>You can clear or block cookies through your browser settings. Note that disabling essential cookies may prevent you from logging in.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact</h2>
            <p>Questions about our cookie practices? Email <a href="mailto:privacy@cybersafe-edu.com" className="text-primary hover:underline">privacy@cybersafe-edu.com</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
