'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { User, Mail, Lock, Loader2, Check, Mic, Star, TrendingUp } from 'lucide-react';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({ interviews: 0, avgScore: 0, streak: 0 });

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, interviewsRes] = await Promise.all([
          fetch('/api/v1/users/me', { credentials: 'include' }),
          fetch('/api/v1/interviews?limit=100', { credentials: 'include' }),
        ]);
        if (profileRes.ok) {
          const { data } = await profileRes.json();
          setEmail(data.email ?? ''); setName(data.name ?? '');
        }
        if (interviewsRes.ok) {
          const { data } = await interviewsRes.json();
          const sessions = (data?.data ?? data ?? []) as Array<{ status: string; feedback?: { overallScore: number } | null; startedAt?: string }>;
          const completed = sessions.filter(s => s.status === 'COMPLETED' && s.feedback?.overallScore != null);
          const scores = completed.map(s => s.feedback!.overallScore);
          setStats({
            interviews: sessions.length,
            avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
            streak: completed.length,
          });
        }
      } catch { /* non-critical */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false);
    try {
      const res = await fetch('/api/v1/users/me/name', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error((await res.json()).detail ?? 'Failed');
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
    finally { setSaving(false); }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setChangingPw(true);
    try {
      const res = await fetch('/api/v1/users/me/password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (!res.ok) throw new Error((await res.json()).detail ?? 'Failed');
      toast.success('Password changed');
      setCurrentPw(''); setNewPw('');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
    finally { setChangingPw(false); }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted/50" />
        <div className="h-56 animate-pulse rounded-2xl bg-muted/50" />
      </div>
    );
  }

  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : email.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and view your progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Mic, label: 'Interviews', value: stats.interviews },
          { icon: Star, label: 'Avg Score', value: stats.avgScore ? `${stats.avgScore}` : '—' },
          { icon: TrendingUp, label: 'Completed', value: stats.streak },
        ].map(({ icon: I, label, value }) => (
          <Card key={label} className="rounded-xl">
            <CardContent className="flex flex-col items-center py-4">
              <I className="mb-1 h-4 w-4 text-muted-foreground" />
              <span className="text-xl font-bold">{value}</span>
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Avatar + Name */}
      <div className="flex items-center gap-5 rounded-2xl border border-border/40 bg-card p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary ring-4 ring-primary/5">
          {initials}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{name || 'Add your name'}</h2>
          <p className="text-sm text-muted-foreground">{email}</p>
          <form onSubmit={handleSaveName} className="mt-3 flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="h-9 max-w-[220px] text-sm rounded-lg" />
            <Button type="submit" size="sm" disabled={saving} className="gap-1.5 rounded-lg">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : null}
              {saved ? 'Saved' : saving ? 'Saving' : 'Save'}
            </Button>
          </form>
        </div>
      </div>

      {/* Password */}
      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4 text-muted-foreground" /> Change Password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Current password</label>
                <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Enter current" required className="rounded-lg" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">New password</label>
                <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min. 8 characters" required minLength={8} className="rounded-lg" />
              </div>
            </div>
            <Button type="submit" variant="outline" disabled={changingPw || !currentPw || !newPw} className="gap-1.5 rounded-lg">
              {changingPw && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {changingPw ? 'Updating' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
