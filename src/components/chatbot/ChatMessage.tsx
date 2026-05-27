import { useState } from 'react';
import { Bot, User, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  interactionId?: string;
}

export function ChatMessage({ role, content, interactionId }: ChatMessageProps) {
  const { user } = useAuth();
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);

  const submitFeedback = async (helpful: boolean) => {
    if (!user || feedbackGiven !== null) return;
    setFeedbackGiven(helpful);

    if (interactionId) {
      await supabase.from('ai_feedback').insert({
        interaction_id: interactionId,
        user_id: user.id,
        helpful,
        user_rating: helpful ? 5 : 2,
      });
    }
  };

  return (
    <div className={`flex gap-3 ${role === 'user' ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        role === 'user' 
          ? 'bg-primary/20' 
          : 'cyber-gradient'
      }`}>
        {role === 'user' ? (
          <User className="h-4 w-4 text-primary" />
        ) : (
          <Bot className="h-4 w-4 text-primary-foreground" />
        )}
      </div>
      <div className="max-w-[80%] space-y-1">
        <div className={`p-3 rounded-2xl text-sm ${
          role === 'user'
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-muted rounded-tl-sm'
        }`}>
          {role === 'assistant' ? (
            <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mt-1 [&>ul]:mb-2">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <span className="whitespace-pre-wrap">{content}</span>
          )}
        </div>
        {role === 'assistant' && user && content.length > 20 && (
          <div className="flex items-center gap-0.5 pl-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-5 w-5 ${feedbackGiven === true ? 'text-green-500' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => submitFeedback(true)}
              disabled={feedbackGiven !== null}
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-5 w-5 ${feedbackGiven === false ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => submitFeedback(false)}
              disabled={feedbackGiven !== null}
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
