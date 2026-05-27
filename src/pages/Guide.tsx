import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Award, Shield, Users, Brain, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  { icon: BookOpen, title: '1. Start Learning', desc: 'Browse learning modules covering password security, phishing, social media safety, and more. Each module takes 10-20 minutes.', link: '/modules' },
  { icon: Brain, title: '2. Take Quizzes', desc: 'Test your knowledge with interactive quizzes at the end of each module and the main phishing detection quiz.', link: '/quiz' },
  { icon: Trophy, title: '3. Earn Badges', desc: 'Unlock badges as you reach milestones — first module, perfect quiz score, and more. View them on your profile.', link: '/badges' },
  { icon: Award, title: '4. Get Certified', desc: 'Complete all modules and pass the quiz with 70 %+ to earn your CyberSafe Certificate with a unique verification ID.', link: '/certificate' },
  { icon: Users, title: '5. Join the Community', desc: 'Ask questions, share tips, and help others in the community forum. Earn points for participation.', link: '/community' },
  { icon: Shield, title: '6. Stay Updated', desc: 'Check weekly tips, read the blog, and use the AI Phishing Detector to stay ahead of threats.', link: '/tips' },
];

export default function Guide() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main id="main-content" className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold font-display mb-2">User Guide</h1>
        <p className="text-muted-foreground mb-8">Everything you need to know to get the most out of CyberSafe.</p>

        <div className="grid sm:grid-cols-2 gap-6">
          {steps.map(({ icon: Icon, title, desc, link }) => (
            <Link to={link} key={title} className="group">
              <Card className="border-border/50 h-full hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-semibold mb-2 group-hover:text-primary transition-colors">{title}</h2>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
