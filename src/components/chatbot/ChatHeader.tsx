import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onClose: () => void;
  context?: string;
}

export function ChatHeader({ onClose, context }: ChatHeaderProps) {
  return (
    <div className="px-4 md:px-6 py-4 border-b border-border bg-card flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-base">CyberSafe AI Assistant</h2>
          <p className="text-xs text-muted-foreground">
            {context ? `Helping with: ${context}` : 'Powered by AI'}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-10 w-10 min-h-[44px] min-w-[44px] rounded-full hover:bg-muted"
        aria-label="Close AI Assistant"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}
