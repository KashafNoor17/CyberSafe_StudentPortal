import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main id="main-content" className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold font-display mb-8">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance</h2>
            <p>By accessing CyberSafe Student Portal you agree to these Terms of Service. If you do not agree, please do not use the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Account Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. You must be at least 13 years old to create an account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Acceptable Use</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the platform for personal educational purposes only</li>
              <li>Do not attempt to disrupt services, exploit vulnerabilities, or access other users' data</li>
              <li>Do not post offensive, misleading, or infringing content in community forums</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Intellectual Property</h2>
            <p>All course content, design, and branding are the property of CyberSafe. Certificates are issued for personal verification and may not be altered or forged.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Limitation of Liability</h2>
            <p>CyberSafe is provided "as is" without warranty. We are not liable for any damages arising from the use of the platform or reliance on its content.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Changes</h2>
            <p>We may update these terms periodically. Continued use after changes constitutes acceptance of the revised terms.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
