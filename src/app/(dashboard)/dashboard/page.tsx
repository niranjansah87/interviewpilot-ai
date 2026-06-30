'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, History, TrendingUp, ArrowRight, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface InterviewItem {
  id: string;
  type: string;
  targetRole: string | null;
  status: string;
  createdAt: string;
  feedback?: { overallScore: number } | null;
}

export default function DashboardPage() {
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/interviews?limit=10', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setInterviews(d.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completed = interviews.filter(i => i.status === 'COMPLETED');
  const total = interviews.length;
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((s, i) => s + (i.feedback?.overallScore ?? 0), 0) / completed.length)
    : null;

  const recent = interviews.slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-muted-foreground">Ready for your next practice session?</p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/dashboard/interviews/new">Start Interview <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="py-8 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Interviews</CardTitle>
                <Mic className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{total}</div>
                <p className="mt-1 text-xs text-muted-foreground">{completed.length} completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Score</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgScore ?? '—'}</div>
                <p className="mt-1 text-xs text-muted-foreground">{completed.length > 0 ? `From ${completed.length} reports` : 'No reports yet'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Practice Streak</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">—</div>
                <p className="mt-1 text-xs text-muted-foreground">Coming soon</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Reports</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completed.length}</div>
                <p className="mt-1 text-xs text-muted-foreground">Feedback reports</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Interviews */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Interviews</CardTitle>
              <CardDescription>Your latest practice sessions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/interviews">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No interviews yet. Start your first practice session.
              </p>
            ) : (
              <div className="space-y-3">
                {recent.map((i) => (
                  <Link
                    key={i.id}
                    href={`/dashboard/interviews/${i.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{i.type?.toLowerCase()}</span>
                        {i.targetRole && <Badge variant="outline" className="text-xs">{i.targetRole}</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {new Date(i.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={i.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {i.status === 'COMPLETED' ? 'Done' : i.status}
                      </Badge>
                      {i.feedback?.overallScore != null && (
                        <div className="text-right">
                          <div className="text-lg font-bold">{i.feedback.overallScore}</div>
                          <div className="text-xs text-muted-foreground">/100</div>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
