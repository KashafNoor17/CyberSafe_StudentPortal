import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Shield, Target, Heart } from 'lucide-react';
import { T } from '@/components/T';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main id="main-content" className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold font-display mb-6"><T>About CyberSafe</T></h1>

        <p className="text-lg text-muted-foreground mb-10"><T>CyberSafe Student Portal is a free, interactive platform that teaches essential cybersecurity skills to students of all levels — from recognising phishing emails to creating strong passwords and protecting personal data online.</T></p>

        <div className="space-y-8">
          {[
            { icon: Target, title: 'Our Mission', text: 'Empower every student with the knowledge and practical skills to navigate the digital world safely and confidently.' },
            { icon: Shield, title: 'What We Offer', text: 'Interactive learning modules, real-world quizzes, AI-powered phishing detection, achievement badges, verifiable certificates, and a supportive community forum — all completely free.' },
            { icon: Heart, title: 'Our Values', text: 'Accessibility, privacy, and inclusion are at the core of everything we build. The platform meets WCAG 2.1 AA standards and never sells user data.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2"><T>{title}</T></h2>
                <p className="text-muted-foreground"><T>{text}</T></p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
