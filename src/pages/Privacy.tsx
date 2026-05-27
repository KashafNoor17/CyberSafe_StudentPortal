import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main id="main-content" className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold font-display mb-8">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-sm dark:prose-invert space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <p>When you create an account we collect your name and email address. As you use CyberSafe we also record module progress, quiz scores, badges earned, and feedback you voluntarily submit.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Personalise your learning experience and track progress</li>
              <li>Issue certificates and display leaderboard rankings</li>
              <li>Improve platform content based on aggregated analytics</li>
              <li>Send transactional emails (password resets, certificate notifications)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Data Sharing</h2>
            <p>We do not sell or share your personal data with third parties for marketing. Data may be shared with service providers that help us operate the platform (hosting, email delivery) under strict data-processing agreements.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Retention</h2>
            <p>Your account data is retained as long as your account is active. You may request deletion at any time by contacting us at <a href="mailto:privacy@cybersafe-edu.com" className="text-primary hover:underline">privacy@cybersafe-edu.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
            <p>Under applicable data-protection laws you have the right to access, correct, or delete your personal data, restrict processing, and data portability. Contact us to exercise any of these rights.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Security</h2>
            <p>We use industry-standard encryption, row-level security policies, and regular audits to protect your data. No system is 100 % secure; if you suspect unauthorised access please notify us immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
            <p>For privacy-related inquiries contact <a href="mailto:privacy@cybersafe-edu.com" className="text-primary hover:underline">privacy@cybersafe-edu.com</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
