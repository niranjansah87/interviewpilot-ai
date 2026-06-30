'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Sun, Moon, Monitor, Trash2, Loader2, Palette, Mic, FileText } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [defaultType, setDefaultType] = useState('BEHAVIORAL');
  const [defaultLevel, setDefaultLevel] = useState('MID');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setDefaultType(localStorage.getItem('pref_type') || 'BEHAVIORAL');
    setDefaultLevel(localStorage.getItem('pref_level') || 'MID');
  }, []);

  const savePref = (key: string, value: string) => {
    localStorage.setItem(key, value);
    toast.success('Saved');
  };

  async function handleDelete() {
    if (!confirm('Permanently delete your account and all data?')) return;
    if (!confirm('This cannot be undone. Are you absolutely sure?')) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/v1/users/me', { method: 'DELETE', credentials: 'include' });
      if (res.ok) { toast.success('Account deleted'); router.push('/'); }
      else toast.error('Failed');
    } catch { toast.error('Network error'); }
    finally { setDeleting(false); }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Customize your experience</p>
      </div>

      {/* Appearance */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Palette className="h-4 w-4 text-muted-foreground" /> Appearance</CardTitle>
          <CardDescription>Choose how InterviewPilot looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[
              { value: 'light', icon: Sun, label: 'Light' },
              { value: 'dark', icon: Moon, label: 'Dark' },
              { value: 'system', icon: Monitor, label: 'System' },
            ].map(({ value, icon: Icon, label }) => (
              <button key={value} onClick={() => setTheme(value as 'light' | 'dark' | 'system')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-all ${
                  theme === value ? 'border-primary bg-primary/[0.04] text-primary' : 'border-border/40 text-muted-foreground hover:border-border'}`}>
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interview Defaults */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Mic className="h-4 w-4 text-muted-foreground" /> Interview Defaults</CardTitle>
          <CardDescription>Pre-selected options for new interviews</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Default Type</Label>
            <select value={defaultType} onChange={(e) => { setDefaultType(e.target.value); savePref('pref_type', e.target.value); }}
              className="rounded-lg border border-border/40 bg-background px-3 py-2 text-sm">
              <option value="BEHAVIORAL">Behavioral</option>
              <option value="TECHNICAL">Technical</option>
              <option value="MIXED">Mixed</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Default Level</Label>
            <select value={defaultLevel} onChange={(e) => { setDefaultLevel(e.target.value); savePref('pref_level', e.target.value); }}
              className="rounded-lg border border-border/40 bg-background px-3 py-2 text-sm">
              <option value="JUNIOR">Junior</option>
              <option value="MID">Mid</option>
              <option value="SENIOR">Senior</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Danger */}
      <Card className="rounded-2xl border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive"><Trash2 className="h-4 w-4" /> Danger Zone</CardTitle>
          <CardDescription>Permanently delete your account and all data</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="gap-1.5 rounded-lg">
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            {deleting ? 'Deleting' : 'Delete account'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
