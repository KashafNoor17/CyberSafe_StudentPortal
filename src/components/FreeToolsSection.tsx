import { Link } from 'react-router-dom';
import { Key, Bot, Lightbulb, ArrowRight } from 'lucide-react';
import { T } from '@/components/T';

interface FreeToolsSectionProps {
  layout?: 'full' | 'compact' | 'vertical';
}

export function FreeToolsSection({ layout = 'full' }: FreeToolsSectionProps) {
  const tools = [
    {
      title: 'Password Checker',
      description: 'Get an instant strength score and crack-time estimate for your password.',
      href: '/password-checker',
      icon: Key,
      color: 'text-primary bg-primary/10 border-primary/20',
      actionText: 'Check password',
    },
    {
      title: 'AI Phishing Detector',
      description: 'Paste any suspicious email or message. Our AI checks it for phishing indicators.',
      href: '/ai-detector',
      icon: Bot,
      color: 'text-accent bg-accent/10 border-accent/20',
      actionText: 'Analyze message',
    },
    {
      title: 'Weekly Security Tips',
      description: 'Fresh cybersecurity advice delivered every week. Practical and actionable tips.',
      href: '/tips',
      icon: Lightbulb,
      color: 'text-warning bg-warning/10 border-warning/20',
      actionText: 'Read tips',
    },
  ];

  if (layout === 'compact') {
    return (
      <div className="mt-12 pt-8 border-t border-border animate-fade-in">
        <h3 className="text-sm font-semibold mb-4 text-foreground font-display flex items-center gap-2">
          <span>🛠️</span> <T>Other Free Security Tools</T>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              to={tool.href}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card/50 hover:bg-primary/5 hover:border-primary/30 transition-all group"
            >
              <div className={`p-2 rounded-lg shrink-0 ${tool.color.split(' ')[0]} ${tool.color.split(' ')[1]}`}>
                <tool.icon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-foreground truncate"><T>{tool.title}</T></h4>
                <p className="text-[10px] text-muted-foreground truncate"><T>{tool.actionText}</T></p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (layout === 'vertical') {
    return (
      <div className="flex flex-col gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            to={tool.href}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group shadow-sm hover:shadow"
          >
            <div className={`p-2.5 rounded-xl border shrink-0 ${tool.color}`}>
              <tool.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm text-foreground mb-0.5 group-hover:text-primary transition-colors"><T>{tool.title}</T></h3>
              <p className="text-xs text-muted-foreground line-clamp-2"><T>{tool.description}</T></p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tools.map((tool) => (
        <Link
          key={tool.href}
          to={tool.href}
          className="rounded-xl border border-border bg-card p-6 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          <div className={`p-2.5 rounded-xl border w-fit ${tool.color}`}>
            <tool.icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground mb-1.5"><T>{tool.title}</T></h3>
            <p className="text-xs text-muted-foreground leading-relaxed"><T>{tool.description}</T></p>
          </div>
          <span className="text-xs text-primary font-medium mt-auto inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            <T>Try it free</T> <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      ))}
    </div>
  );
}
