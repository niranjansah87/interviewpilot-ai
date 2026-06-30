'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const INTERVIEW_TYPES = ['BEHAVIORAL', 'TECHNICAL', 'MIXED'] as const;
const EXPERIENCE_LEVELS = ['JUNIOR', 'MID', 'SENIOR'] as const;

export default function NewInterviewPage() {
  const router = useRouter();
  const [type, setType] = useState<string>('BEHAVIORAL');
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<string>('MID');
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const body: Record<string, unknown> = { type, targetRole, experienceLevel };
      if (scheduledAt) body.scheduledAt = scheduledAt;

      const res = await fetch('/api/v1/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? 'Failed to create interview');
      }

      const { data } = await res.json();
      toast.success('Interview session created');
      router.push(`/dashboard/interviews/${data.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">New Interview</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Interview Type</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            {INTERVIEW_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                  type === t
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Target Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="role">What role are you preparing for?</Label>
              <Input
                id="role"
                placeholder="e.g. Senior Frontend Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experience Level</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setExperienceLevel(level)}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                  experienceLevel === level
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {level.charAt(0) + level.slice(1).toLowerCase()}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Schedule (optional) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Schedule (optional)</span>
              <span className="text-xs font-normal text-muted-foreground">Start now or pick a later time</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="timing"
                  defaultChecked
                  onChange={() => setScheduledAt('')}
                  className="text-primary"
                />
                <span className="text-sm">Start now</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="timing"
                  onChange={() => setScheduledAt(new Date(Date.now() + 3600000).toISOString().slice(0, 16))}
                  className="text-primary"
                />
                <span className="text-sm">Schedule for later</span>
              </label>
              {scheduledAt && (
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : scheduledAt ? 'Schedule Interview' : 'Start Interview Now'}
        </Button>
      </form>
    </div>
  );
}
