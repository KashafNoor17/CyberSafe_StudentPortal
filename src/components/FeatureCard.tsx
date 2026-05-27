import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  gradient?: 'blue' | 'teal' | 'purple' | 'green' | 'orange';
}

const gradientClasses = {
  blue: 'from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10',
  teal: 'from-secondary/10 to-secondary/5 hover:from-secondary/15 hover:to-secondary/10',
  purple: 'from-accent/10 to-accent/5 hover:from-accent/15 hover:to-accent/10',
  green: 'from-success/10 to-success/5 hover:from-success/15 hover:to-success/10',
  orange: 'from-warning/10 to-warning/5 hover:from-warning/15 hover:to-warning/10',
};

const iconClasses = {
  blue: 'text-primary bg-primary/10',
  teal: 'text-secondary bg-secondary/10',
  purple: 'text-accent bg-accent/10',
  green: 'text-success bg-success/10',
  orange: 'text-warning bg-warning/10',
};

export function FeatureCard({ icon: Icon, title, description, href, gradient = 'blue' }: FeatureCardProps) {
  return (
    <Link 
      to={href}
      className={`group block p-6 rounded-xl bg-gradient-to-br ${gradientClasses[gradient]} border border-border/50 card-glow transition-all duration-300`}
    >
      <div className={`w-12 h-12 rounded-lg ${iconClasses[gradient]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </Link>
  );
}
