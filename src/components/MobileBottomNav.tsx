import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Trophy, Users, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { T } from '@/components/T';

const tabs = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Learn', href: '/modules', icon: BookOpen },
  { label: 'Achieve', href: '/badges', icon: Trophy },
  { label: 'Social', href: '/community', icon: Users },
  { label: 'Profile', href: '/profile', icon: User },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] rounded-lg transition-all active:scale-95 ${
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <tab.icon className={`h-5 w-5 transition-transform ${active ? 'scale-110' : ''}`} aria-hidden="true" />
              <span className="text-[10px] font-medium leading-tight"><T>{tab.label}</T></span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}