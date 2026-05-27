import { Link } from 'react-router-dom';
import { Shield, Mail, Github, Twitter, Linkedin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { T } from '@/components/T';

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:contact@cybersafe.edu', label: 'Email' },
];

export function Footer() {
  const { t } = useTranslation();

  const learnLinks = [
    { label: 'Modules', href: '/modules' },
    { label: 'Quiz', href: '/quiz' },
    { label: 'Password Checker', href: '/password-checker' },
    { label: 'Weekly Tips', href: '/tips' },
    { label: 'Leaderboard', href: '/leaderboard' },
  ];

  const communityLinks = [
    { label: 'Community', href: '/community' },
    { label: 'Blog', href: '/blog' },
    { label: 'Reviews', href: '/reviews' },
    { label: 'AI Detector', href: '/ai-detector' },
    { label: 'Verify Certificate', href: '/verify' },
  ];

  const platformLinks = [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Accessibility', href: '/accessibility' },
    { label: 'FAQ', href: '/faq' },
    { label: 'User Guide', href: '/guide' },
  ];

  return (
    <footer className="bg-card border-t border-border relative overflow-hidden" role="contentinfo">
      <div className="absolute inset-0 grid-pattern opacity-5" aria-hidden="true" />
      
      <div className="container mx-auto px-4 py-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl mb-4 group" aria-label="CyberSafe Home">
              <div className="w-10 h-10 rounded-lg cyber-gradient flex items-center justify-center" aria-hidden="true">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="cyber-gradient-text">{t('footer.brand')}</span>
            </Link>
            <p className="text-muted-foreground max-w-md mb-6">
              {t('footer.brandDesc')}
            </p>
            <div className="flex items-center gap-3" role="list" aria-label="Social media links">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all min-h-[44px] min-w-[44px]"
                  aria-label={`Follow us on ${social.label}`}
                  role="listitem"
                >
                  <social.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Learn */}
          <nav aria-label="Learn">
            <h3 className="font-semibold mb-4 font-display text-foreground"><T>Learn</T></h3>
            <ul className="space-y-2">
              {learnLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    <T>{link.label}</T>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Community */}
          <nav aria-label="Community">
            <h3 className="font-semibold mb-4 font-display text-foreground"><T>Community</T></h3>
            <ul className="space-y-2">
              {communityLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    <T>{link.label}</T>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Platform */}
          <nav aria-label="Platform">
            <h3 className="font-semibold mb-4 font-display text-foreground"><T>Platform</T></h3>
            <ul className="space-y-2">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    <T>{link.label}</T>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-center items-center gap-4">
          <p className="text-sm text-muted-foreground text-center">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
