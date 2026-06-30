'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useDialog } from '@/components/ui/dialog';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [defaultType, setDefaultType] = useState('BEHAVIORAL');
  const [defaultLevel, setDefaultLevel] = useState('MID');
  const [deleting, setDeleting] = useState(false);
  const deleteDialog = useDialog();

  useEffect(() => {
    setDefaultType(localStorage.getItem('pref_type') || 'BEHAVIORAL');
    setDefaultLevel(localStorage.getItem('pref_level') || 'MID');
  }, []);

  const savePref = (key: string, value: string) => {
    localStorage.setItem(key, value);
    toast.success('Preference saved');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Customize your experience</p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how InterviewPilot looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Theme</Label>
              <p className="text-sm text-muted-foreground">
                {theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System'}
              </p>
            </div>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Interview Defaults</CardTitle>
          <CardDescription>Default settings for new interviews</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Default Type</Label>
              <p className="text-sm text-muted-foreground">Pre-selected interview type</p>
            </div>
            <select
              value={defaultType}
              onChange={(e) => { setDefaultType(e.target.value); savePref('pref_type', e.target.value); }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="BEHAVIORAL">Behavioral</option>
              <option value="TECHNICAL">Technical</option>
              <option value="MIXED">Mixed</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Default Level</Label>
              <p className="text-sm text-muted-foreground">Pre-selected experience level</p>
            </div>
            <select
              value={defaultLevel}
              onChange={(e) => { setDefaultLevel(e.target.value); savePref('pref_level', e.target.value); }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="JUNIOR">Junior</option>
              <option value="MID">Mid</option>
              <option value="SENIOR">Senior</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <button
            className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90"
            onClick={deleteDialog.show}
          >
            Delete account
          </button>

          <deleteDialog.DialogComponent
            title="Delete your account?"
            description="This action is irreversible. All your data including interviews, transcripts, and reports will be permanently deleted."
          >
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={deleteDialog.hide} disabled={deleting}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    const res = await fetch('/api/v1/users/me', { method: 'DELETE', credentials: 'include' });
                    if (res.ok) {
                      toast.success('Account deleted');
                      router.push('/');
                    } else {
                      toast.error('Failed to delete account');
                      deleteDialog.hide();
                    }
                  } catch {
                    toast.error('Network error');
                    deleteDialog.hide();
                  } finally {
                    setDeleting(false);
                  }
                }}
              >
                {deleting ? 'Deleting...' : 'Yes, delete my account'}
              </Button>
            </div>
          </deleteDialog.DialogComponent>
        </CardContent>
      </Card>
    </div>
  );
}
