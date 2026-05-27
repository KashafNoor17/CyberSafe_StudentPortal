import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { T } from '@/components/T';

const faqs = [
  { q: 'What is CyberSafe?', a: 'CyberSafe is a free, interactive cybersecurity education platform designed for students. It offers learning modules, quizzes, badges, and a certificate programme.' },
  { q: 'Is CyberSafe free to use?', a: 'Yes. All learning modules, quizzes, and the certificate programme are completely free.' },
  { q: 'How do I earn a certificate?', a: 'Complete all learning modules and pass the phishing quiz with at least 70 %. Your certificate will then be available on the Certificate page.' },
  { q: 'Can I verify a certificate?', a: 'Yes. Visit the Certificate Verification page and enter the certificate number or verification ID.' },
  { q: 'How does the badge system work?', a: 'Badges are awarded automatically when you reach milestones—such as completing your first module, scoring 100 % on the quiz, or earning enough points.' },
  { q: 'Is my data safe?', a: 'We use row-level security, encrypted connections, and follow industry best practices. See our Privacy Policy for full details.' },
  { q: 'How do I reset my password?', a: 'Click "Forgot password?" on the login page and follow the email instructions.' },
  { q: 'Can I use CyberSafe on my phone?', a: 'Absolutely. The platform is fully responsive and works on all modern mobile browsers.' },
  { q: 'How do I report a bug or suggest a feature?', a: 'Use the Feedback button on the right side of any page, or visit the community forum.' },
  { q: 'Who can I contact for support?', a: 'Email us at support@cybersafe-edu.com or visit our Contact page.' },
];

export default function FAQ() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main id="main-content" className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold font-display mb-2"><T>Frequently Asked Questions</T></h1>
        <p className="text-muted-foreground mb-8"><T>Find answers to the most common questions about CyberSafe.</T></p>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-lg px-4">
              <AccordionTrigger className="text-left font-medium"><T>{faq.q}</T></AccordionTrigger>
              <AccordionContent className="text-muted-foreground"><T>{faq.a}</T></AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
      <Footer />
    </div>
  );
}
