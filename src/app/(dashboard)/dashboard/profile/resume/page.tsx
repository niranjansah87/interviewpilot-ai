'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FileText, Save, Loader2 } from 'lucide-react';

export default function ResumePage() {
  const [text, setText] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/v1/users/me/resume', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.data) {
          setText(d.data.text ?? '');
          setFullName(d.data.fullName ?? '');
        }
      })
      .catch(() => toast.error('Failed to load resume'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (text.length < 50) {
      toast.error('Please enter at least 50 characters');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/v1/users/me/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text, fullName: fullName || undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).detail ?? 'Failed');
      toast.success('Resume saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted/50" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resume</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste your resume to personalize interview questions
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Your Resume
          </CardTitle>
          <CardDescription>
            Paste your full resume text. The AI interviewer will reference your actual experience during interviews.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name (optional)</Label>
            <Input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alice Chen"
              className="max-w-sm"
            />
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your resume content here..."
            className="min-h-[300px] w-full rounded-xl border border-border bg-muted/30 p-4 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Resume</>}
          </Button>
        </CardContent>
      </Card>

      {text.length > 0 && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans max-h-48 overflow-y-auto">
              {text}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
