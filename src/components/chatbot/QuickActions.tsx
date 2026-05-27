import { Lightbulb, BookOpen, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onAction: (action: string) => void;
  disabled?: boolean;
  context?: string;
}

export function QuickActions({ onAction, disabled, context }: QuickActionsProps) {
  const actions = [
    {
      label: 'Explain this',
      icon: Lightbulb,
      message: context 
        ? `Can you explain the key concepts of ${context} in simple terms?`
        : 'Can you explain the current topic in simple terms?'
    },
    {
      label: 'Give example',
      icon: BookOpen,
      message: context
        ? `Give me a real-world example related to ${context}`
        : 'Give me a real-world example of this concept'
    },
    {
      label: 'Quiz me',
      icon: HelpCircle,
      message: context
        ? `Ask me a quick quiz question about ${context}`
        : 'Ask me a quick quiz question to test my knowledge'
    }
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          size="sm"
          className="text-xs h-7 px-2"
          disabled={disabled}
          onClick={() => onAction(action.message)}
        >
          <action.icon className="h-3 w-3 mr-1" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
