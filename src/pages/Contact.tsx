import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, Clock, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { T } from '@/components/T';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    const { error } = await supabase.from('feedback').insert({
      message: `[Contact] ${data.get('subject')}: ${data.get('message')}`,
      email: data.get('email') as string,
      feedback_type: 'general',
      category: 'general',
    });

    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: 'Could not send message. Please try again.', variant: 'destructive' });
    } else {
      toast({ title: 'Message sent', description: 'We will get back to you within 24 hours.' });
      form.reset();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main id="main-content" className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold font-display mb-2"><T>Contact Us</T></h1>
        <p className="text-muted-foreground mb-8"><T>Have a question, suggestion, or need help? We're here for you.</T></p>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: Mail, title: 'Email', desc: 'support@cybersafe-edu.com' },
            { icon: Clock, title: 'Response Time', desc: 'Within 24 hours' },
            { icon: MessageSquare, title: 'Community', desc: 'Ask in our forum' },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="border-border/50 text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1"><T>{title}</T></h3>
                <p className="text-sm text-muted-foreground"><T>{desc}</T></p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border/50">
          <CardHeader><CardTitle><T>Send a Message</T></CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email"><T>Email</T></Label>
                  <Input id="email" name="email" type="email" required placeholder="you@example.com" />
                </div>
                <div>
                  <Label htmlFor="subject"><T>Subject</T></Label>
                  <Input id="subject" name="subject" required placeholder="How can we help?" />
                </div>
              </div>
              <div>
                <Label htmlFor="message"><T>Message</T></Label>
                <Textarea id="message" name="message" required rows={5} placeholder="Describe your question or issue…" />
              </div>
              <Button type="submit" disabled={loading}>{loading ? <T>Sending…</T> : <T>Send Message</T>}</Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
