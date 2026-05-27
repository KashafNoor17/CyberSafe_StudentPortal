import { useState } from 'react';
import { User, Mail, MapPin, Phone, CheckCircle } from 'lucide-react';
import { T } from '@/components/T';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  display_name: z.string().trim().max(100).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  location: z.string().max(100).optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional().or(z.literal('')),
});

interface PersonalInfoTabProps {
  userId: string;
  email: string;
  initialData: { name: string; display_name: string; phone: string; location: string; bio: string };
  onSaved: () => void;
}

export function PersonalInfoTab({ userId, email, initialData, onSaved }: PersonalInfoTabProps) {
  const { toast } = useToast();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = profileSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => { fieldErrors[String(err.path[0])] = err.message; });
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({
        name: data.name.trim(), display_name: data.display_name?.trim() || null,
        phone: data.phone?.trim() || null, location: data.location?.trim() || null, bio: data.bio?.trim() || '',
      } as any).eq('user_id', userId);
      if (error) throw error;
      toast({ title: 'Profile Updated', description: 'Your information has been saved.' });
      onSaved();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle><T>Personal Information</T></CardTitle>
        <CardDescription><T>Update your personal details</T></CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name"><T>Full Name</T> *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" className="pl-10" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} />
              </div>
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name"><T>Display Name</T></Label>
              <Input id="display_name" placeholder="How you appear publicly" value={data.display_name} onChange={e => setData({ ...data, display_name: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email"><T>Email</T></Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" className="pl-10" value={email} disabled />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-green-400">✓</span> <T>Verified email address</T>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone"><T>Phone (optional)</T></Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phone" className="pl-10" placeholder="+1 (555) 123-4567" value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location"><T>Location (optional)</T></Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="location" className="pl-10" placeholder="City, Country" value={data.location} onChange={e => setData({ ...data, location: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio"><T>Bio</T></Label>
            <Textarea id="bio" placeholder="Tell us about yourself..." rows={4} value={data.bio} onChange={e => setData({ ...data, bio: e.target.value })} maxLength={500} />
            <p className="text-xs text-muted-foreground">{data.bio.length}/500 <T>characters</T></p>
            {errors.bio && <p className="text-sm text-destructive">{errors.bio}</p>}
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setData(initialData)}><T>Cancel</T></Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <T>Saving...</T>
              ) : saved ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <T>Saved!</T>
                </span>
              ) : (
                <T>Save Changes</T>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
