'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
const INTERVIEW_TYPES = [
  { id: 'BEHAVIORAL', label: 'Behavioral', desc: 'Leadership, teamwork, conflict resolution' },
  { id: 'TECHNICAL', label: 'Technical', desc: 'System design, architecture, problem-solving' },
  { id: 'MIXED', label: 'Mixed', desc: 'Combination of behavioral and technical' },
];

const LEVELS = [
  { id: 'JUNIOR', label: 'Junior', desc: '0–2 years experience' },
  { id: 'MID', label: 'Mid-Level', desc: '2–5 years experience' },
  { id: 'SENIOR', label: 'Senior', desc: '5+ years experience' },
];

export default function NewInterviewPage() {
  const router = useRouter();
  const [type, setType] = useState('BEHAVIORAL');
  const [level, setLevel] = useState('MID');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, experienceLevel: level, targetRole: role || undefined }),
        credentials: 'include',
      });
      if (res.ok) {
        const { data } = await res.json();
        router.push(`/interviews/${data.id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Interview</h1>
        <p className="mt-2 text-muted-foreground">Configure your practice session</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Interview Type</CardTitle>
            <CardDescription>What kind of interview do you want to practice?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {INTERVIEW_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`rounded-lg border p-4 text-left transition-colors ${
                    type === t.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">{t.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{t.desc}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experience Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLevel(l.id)}
                  className={`rounded-lg border p-4 text-left transition-colors ${
                    level === l.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">{l.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{l.desc}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Target Role</CardTitle>
            <CardDescription>Optional — helps the AI tailor questions</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Start Interview'}
        </Button>
      </form>
    </div>
  );
}
