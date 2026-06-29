'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { User, Mail, Lock, Loader2, Check, Shield } from 'lucide-react';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    fetch('/api/v1/users/me', { credentials: 'include' })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then(({ data }) => {
        setEmail(data.email ?? '');
        setName(data.name ?? '');
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/v1/users/me/name', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error((await res.json()).detail ?? 'Failed');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setChangingPw(true);
    try {
      const res = await fetch('/api/v1/users/me/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (!res.ok) throw new Error((await res.json()).detail ?? 'Failed');
      toast.success('Password changed');
      setCurrentPw('');
      setNewPw('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-6">
          <div className="h-48 animate-pulse rounded-2xl bg-muted/50" />
          <div className="h-56 animate-pulse rounded-2xl bg-muted/50" />
        </div>
      </div>
    );
  }

  // Generate avatar initials
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : email.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and password</p>
      </div>

      {/* Avatar + Identity card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col items-center gap-6 px-6 py-10 sm:flex-row sm:px-8">
          {/* Avatar */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary ring-4 ring-primary/5">
            {initials}
          </div>

          {/* Info + edit */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-semibold">{name || 'Add your name'}</h2>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
              <Mail className="h-3.5 w-3.5" />
              {email}
            </p>
            <div className="mt-3 flex items-center justify-center gap-3 sm:justify-start">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="h-9 max-w-[240px] text-sm"
              />
              <Button size="sm" onClick={handleSaveName} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : null}
                {saved ? 'Saved' : saving ? 'Saving' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Password */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-muted-foreground" />
            Change Password
          </CardTitle>
          <CardDescription>Use a strong password you don't use elsewhere</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cpw" className="text-sm">Current password</Label>
                <Input
                  id="cpw"
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="Enter current"
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="npw" className="text-sm">New password</Label>
                <Input
                  id="npw"
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="h-10"
                />
              </div>
            </div>
            <Button type="submit" variant="outline" disabled={changingPw || !currentPw || !newPw} className="gap-1.5">
              {changingPw && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {changingPw ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
