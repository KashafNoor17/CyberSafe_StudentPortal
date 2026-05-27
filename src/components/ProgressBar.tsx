import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  showLabel = true, 
  size = 'md',
  className 
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-muted-foreground">Progress</span>
          <span className="text-sm font-semibold text-primary">{percentage}%</span>
        </div>
      )}
      <div className={cn('w-full bg-muted rounded-full overflow-hidden', sizeClasses[size])}>
        <div 
          className={cn(
            "h-full cyber-gradient rounded-full transition-all duration-500 ease-out",
            document.documentElement.dir === 'rtl' ? 'ml-auto' : ''
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
