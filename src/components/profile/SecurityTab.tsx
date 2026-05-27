import { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, LogOut } from 'lucide-react';
import { T } from '@/components/T';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const passwordSchema = z.object({
  newPassword: z.string().min(8, 'Minimum 8 characters').regex(/[A-Z]/, 'Must include an uppercase letter').regex(/[a-z]/, 'Must include a lowercase letter').regex(/[0-9]/, 'Must include a number'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ chars', met: password.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(password) },
    { label: 'Lowercase', met: /[a-z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special', met: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.met).length;
  const color = score <= 2 ? 'bg-destructive' : score <= 3 ? 'bg-warning' : 'bg-green-500';

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= score ? color : 'bg-muted'}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {checks.map(c => (
          <span key={c.label} className={`text-xs ${c.met ? 'text-green-400' : 'text-muted-foreground'}`}>
            {c.met ? '✓' : '○'} <T>{c.label}</T>
          </span>
        ))}
      </div>
    </div>
  );
}

export function SecurityTab() {
  const { toast } = useToast();
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = passwordSchema.safeParse(passwords);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => { fieldErrors[String(err.path[0])] = err.message; });
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.newPassword });
      if (error) throw error;
      setPasswords({ newPassword: '', confirmPassword: '' });
      toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutAll = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'others' });
      if (error) throw error;
      toast({ title: 'Sessions Revoked', description: 'All other sessions have been signed out.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <T>Password Management</T>
          </CardTitle>
          <CardDescription><T>Update your password to keep your account secure</T></CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword"><T>New Password</T></Label>
              <div className="relative">
                <Input id="newPassword" type={showNew ? 'text' : 'password'} placeholder="Enter new password" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowNew(!showNew)}>
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword}</p>}
              {passwords.newPassword && <PasswordStrength password={passwords.newPassword} />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword"><T>Confirm New Password</T></Label>
              <div className="relative">
                <Input id="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Confirm new password" value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>
            <Button type="submit" disabled={loading}>
              <Lock className="h-4 w-4 mr-2" />
              {loading ? <T>Updating...</T> : <T>Update Password</T>}
            </Button>
          </form>
        </CardContent>
      </Card>



      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            <T>Active Sessions</T>
          </CardTitle>
          <CardDescription><T>Manage your active sessions across devices</T></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            <div className="flex-1">
              <p className="text-sm font-medium"><T>Current Session</T></p>
              <p className="text-xs text-muted-foreground"><T>Active now</T></p>
            </div>
          </div>
          <Separator />
          <Button variant="outline" onClick={handleSignOutAll} className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            <T>Sign Out All Other Devices</T>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
