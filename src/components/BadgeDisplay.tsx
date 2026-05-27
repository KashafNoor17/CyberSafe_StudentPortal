import { 
  Trophy, Zap, BookOpen, ShieldCheck, Award, Lock, Medal, 
  Star, Crown, MessageCircle, LucideIcon 
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earned_at?: string;
}

interface BadgeDisplayProps {
  badges: Badge[];
  showAll?: boolean;
  size?: 'sm' | 'md' | 'lg';
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

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function BadgeDisplay({ badges, showAll = false, size = 'md' }: BadgeDisplayProps) {
  const displayBadges = showAll ? badges : badges.slice(0, 6);

  return (
    <div className="flex flex-wrap gap-3">
      {displayBadges.map((badge) => {
        const Icon = iconMap[badge.icon] || Trophy;
        const isEarned = !!badge.earned_at;
        const colorClass = categoryColors[badge.category] || categoryColors.achievement;

        return (
          <Tooltip key={badge.id}>
            <TooltipTrigger asChild>
              <div
                className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-300 ${
                  isEarned
                    ? `bg-gradient-to-br ${colorClass} shadow-lg badge-glow cursor-pointer hover:scale-110`
                    : 'bg-muted text-muted-foreground opacity-40 cursor-default'
                }`}
              >
                <Icon className={`${iconSizes[size]} ${isEarned ? 'text-white' : ''}`} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px]">
              <p className="font-semibold">{badge.name}</p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
              {isEarned && badge.earned_at && (
                <p className="text-xs text-success mt-1">
                  Earned {new Date(badge.earned_at).toLocaleDateString()}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        );
      })}
      {!showAll && badges.length > 6 && (
        <div className={`${sizeClasses[size]} rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground`}>
          +{badges.length - 6}
        </div>
      )}
    </div>
  );
}
