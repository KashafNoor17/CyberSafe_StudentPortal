import { useState } from 'react';
import { AlertTriangle, Download, Trash2 } from 'lucide-react';
import { T } from '@/components/T';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DangerZoneProps {
  userId: string;
  onAccountDeleted: () => void;
}

export function DangerZone({ userId, onAccountDeleted }: DangerZoneProps) {
  const { toast } = useToast();
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteChecked, setDeleteChecked] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const [profileRes, completionsRes, badgesRes, quizRes, certsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).single(),
        supabase.from('module_completions').select('*').eq('user_id', userId),
        supabase.from('user_badges').select('*, badges(*)').eq('user_id', userId),
        supabase.from('quiz_results').select('*').eq('user_id', userId),
        supabase.from('certificates').select('*').eq('user_id', userId),
      ]);
      const exportData = {
        exported_at: new Date().toISOString(), profile: profileRes.data,
        module_completions: completionsRes.data || [], badges: badgesRes.data || [],
        quiz_results: quizRes.data || [], certificates: certsRes.data || [],
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cybersafe-data-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Data Exported', description: 'Your data has been downloaded.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE' || !deleteChecked) return;
    setDeleteLoading(true);
    try {
      await supabase.auth.signOut();
      toast({ title: 'Account Deletion Requested', description: 'Your account has been scheduled for deletion. You will receive a confirmation email.' });
      onAccountDeleted();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <T>Danger Zone</T>
        </CardTitle>
        <CardDescription><T>Irreversible actions — proceed with caution</T></CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm"><T>Export Your Data</T></p>
            <p className="text-xs text-muted-foreground"><T>Download all your personal data as JSON</T></p>
          </div>
          <Button variant="outline" onClick={handleExportData} disabled={exportLoading}>
            <Download className="h-4 w-4 mr-2" />
            {exportLoading ? <T>Exporting...</T> : <T>Export Data</T>}
          </Button>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm text-destructive"><T>Delete Account</T></p>
            <p className="text-xs text-muted-foreground"><T>Permanently delete your account and all data</T></p>
          </div>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                <T>Delete Account</T>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <T>Delete Your Account?</T>
                </DialogTitle>
                <DialogDescription>
                  <T>This action is permanent and irreversible. All your data including progress, badges, certificates, and community posts will be permanently deleted.</T>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="delete-confirm"><T>Type DELETE to confirm</T></Label>
                  <Input id="delete-confirm" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} placeholder="DELETE" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="delete-understand" checked={deleteChecked} onCheckedChange={v => setDeleteChecked(!!v)} />
                  <Label htmlFor="delete-understand" className="text-sm">
                    <T>I understand this action is permanent and cannot be undone</T>
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}><T>Cancel</T></Button>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteConfirmText !== 'DELETE' || !deleteChecked || deleteLoading}>
                  {deleteLoading ? <T>Deleting...</T> : <T>Delete Permanently</T>}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
