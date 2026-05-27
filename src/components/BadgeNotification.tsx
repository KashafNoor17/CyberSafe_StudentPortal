import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { 
  Trophy, Zap, BookOpen, ShieldCheck, Award, Lock, Medal, 
  Star, Crown, MessageCircle, LucideIcon 
} from 'lucide-react';
import { T } from '@/components/T';

interface BadgeNotificationProps {
  badge: {
    name: string;
    description: string;
    icon: string;
    category: string;
  } | null;
  onClose: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  'trophy': Trophy,
  'zap': Zap,
  'book-open': BookOpen,
  'shield-check': ShieldCheck,
  'award': Award,
  'lock': Lock,
  'medal': Medal,
  'star': Star,
  'crown': Crown,
  'message-circle': MessageCircle,
};

const categoryColors: Record<string, string> = {
  learning: 'from-primary to-primary/70',
  quiz: 'from-secondary to-secondary/70',
  tools: 'from-accent to-accent/70',
  achievement: 'from-warning to-warning/70',
  milestone: 'from-success to-success/70',
  community: 'from-pink-500 to-pink-500/70',
};

export function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (badge) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [badge, onClose]);

  if (!badge) return null;

  const Icon = iconMap[badge.icon] || Trophy;
  const colorClass = categoryColors[badge.category] || categoryColors.achievement;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          className="fixed top-20 right-4 z-50 max-w-sm"
        >
          <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            <div className={`h-1 bg-gradient-to-r ${colorClass}`} />
            <div className="p-4">
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg badge-glow`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🎉</span>
                    <span className="text-sm font-medium text-muted-foreground"><T>New Badge Earned!</T></span>
                  </div>
                  <h4 className="font-bold text-foreground"><T>{badge.name}</T></h4>
                  <p className="text-sm text-muted-foreground"><T>{badge.description}</T></p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}