import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { ChatMessage, QuickActions, ChatHeader } from '@/components/chatbot';
import { T } from '@/components/T';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  interactionId?: string;
}

const getContextFromRoute = (pathname: string): string | undefined => {
  if (pathname.includes('password')) return 'Password Security';
  if (pathname.includes('phishing')) return 'Phishing Detection';
  if (pathname.includes('social')) return 'Social Media Safety';
  if (pathname.includes('malware')) return 'Malware Protection';
  if (pathname.includes('quiz')) return 'Security Quiz';
  if (pathname.includes('modules')) return 'Learning Modules';
  if (pathname.includes('learn')) return 'Cybersecurity Learning';
  return undefined;
};

export function AIChatbot() {
  const { user } = useAuth();
  const location = useLocation();
  const context = getContextFromRoute(location.pathname);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `👋 Hi! I'm your CyberSafe AI Assistant. ${context ? `I see you're learning about ${context}. ` : ''}I can help you with:\n\n• Cybersecurity questions\n• Platform navigation\n• Learning recommendations\n• Security tips\n\nHow can I help you stay safe online today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (context && messages.length === 1) {
      setMessages([{
        role: 'assistant',
        content: `👋 Hi! I'm your CyberSafe AI Assistant. I see you're learning about **${context}**. I can help you understand concepts, provide examples, or quiz you on this topic!\n\nTry the quick actions below or ask me anything.`
      }]);
    }
  }, [context]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Lock body scroll & ESC to close
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    if (!user) {
      setMessages(prev => [...prev, 
        { role: 'user', content: textToSend },
        { role: 'assistant', content: "Please log in to use the AI assistant. This helps us provide personalized recommendations and keep the service secure." }
      ]);
      setInput('');
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setIsLoading(true);

    const startTime = Date.now();
    try {
      const response = await supabase.functions.invoke('ai-chat', {
        body: { 
          messages: [...messages, { role: 'user', content: textToSend }],
          context
        }
      });

      if (response.error) throw new Error(response.error.message || 'Failed to get response');

      const data = response.data;
      let interactionId: string | undefined;

      if (data?.content) {
        const latency = Date.now() - startTime;
        const { data: logged } = await supabase.from('ai_interactions').insert({
          user_id: user.id,
          interaction_type: 'chat',
          prompt: textToSend.slice(0, 500),
          response: (data.content as string).slice(0, 2000),
          latency_ms: latency,
          model_version: 'gemini-3-flash-preview',
        }).select('id').single();
        interactionId = logged?.id;

        setMessages(prev => [...prev, { role: 'assistant', content: data.content, interactionId }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I'm having trouble connecting right now. Please try again in a moment." 
        }]);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I encountered an error. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* FAB trigger — raised on mobile to clear bottom nav */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed right-4 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300 min-h-[44px] min-w-[44px] bg-primary hover:bg-primary/90 bottom-24 md:bottom-6 ${
          isOpen ? 'scale-0 pointer-events-none' : 'scale-100'
        }`}
        size="icon"
        aria-label="Open AI assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Full-screen modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" role="dialog" aria-modal="true" aria-label="CyberSafe AI Assistant">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          {/* Modal panel */}
          <div className="relative z-10 flex flex-col bg-card border border-border rounded-none sm:rounded-2xl shadow-2xl animate-scale-in
            w-full h-full
            sm:w-[90vw] sm:h-[85vh]
            lg:w-[800px] lg:h-[700px]
            sm:max-w-[90vw] sm:max-h-[90vh]
          ">
            {/* Header */}
            <ChatHeader onClose={() => setIsOpen(false)} context={context} />

            {/* Quick actions */}
            <div className="px-4 py-3 border-b border-border bg-muted/20">
              <QuickActions 
                onAction={(msg) => sendMessage(msg)} 
                disabled={isLoading || !user}
                context={context}
              />
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6" role="log" aria-label="Chat messages" aria-live="polite">
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((message, index) => (
                  <ChatMessage 
                    key={index} 
                    role={message.role} 
                    content={message.content}
                    interactionId={message.interactionId}
                  />
                ))}
                {isLoading && (
                  <div className="flex gap-3" aria-label="AI is thinking">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="bg-muted p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground"><T>AI is typing...</T></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Login prompt */}
            {!user && (
              <div className="px-4 pb-2">
                <Link to="/auth?mode=login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full min-h-[44px]">
                    <LogIn className="mr-2 h-4 w-4" />
                    <T>Log in for full AI features</T>
                  </Button>
                </Link>
              </div>
            )}

            {/* Input area */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-2 max-w-3xl mx-auto">
                <label htmlFor="ai-chat-input" className="sr-only">Type your message</label>
                <Input
                  id="ai-chat-input"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about cybersecurity..."
                  className="flex-1 bg-muted border-border"
                  disabled={isLoading}
                  autoComplete="off"
                />
                <Button 
                  onClick={() => sendMessage()} 
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="bg-primary hover:bg-primary/90 min-h-[44px] min-w-[44px] shrink-0"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
