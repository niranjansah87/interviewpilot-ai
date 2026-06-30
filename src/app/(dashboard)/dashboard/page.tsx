'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, ArrowRight, Star, Loader2, FileText, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted/50 ${className ?? ''}`} />;
}

export default function DashboardPage() {
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/users/me', { credentials: 'include' }).then(r => r.ok ? r.json() : null),
      fetch('/api/v1/interviews?limit=10', { credentials: 'include' }).then(r => r.ok ? r.json() : null),
    ]).then(([profile, intData]) => {
      if (profile?.data) setUserName(profile.data.name ?? '');
      if (intData?.data) setInterviews(intData.data.data ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const completed = interviews.filter(i => i.status === 'COMPLETED' && i.feedback?.overallScore != null);
  const total = interviews.length;
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((s, i) => s + (i.feedback?.overallScore ?? 0), 0) / completed.length)
    : null;
  const recent = interviews.slice(0, 3);

  const greeting = userName ? `Welcome back, ${userName.split(' ')[0]}` : 'Welcome back';

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Hero */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <Image src="/illustrations/interview-hero.svg" alt="" width={100} height={75} className="hidden dark:opacity-70 sm:block shrink-0" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{greeting}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {total > 0
                ? `You've completed ${completed.length} of ${total} interviews${avgScore ? ` with an average score of ${avgScore}` : ''}.`
                : 'Ready for your first practice session?'}
            </p>
          </div>
        </div>
        <Button asChild className="gap-1.5 rounded-xl shrink-0">
          <Link href="/dashboard/interviews/new"><Mic className="h-4 w-4" /> Start Interview</Link>
        </Button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Interviews</CardTitle>
              <Mic className="h-4 w-4 text-muted-foreground/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{total}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">{completed.length} with feedback</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Score</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{avgScore ?? '—'}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">{avgScore ? `Across ${completed.length} reports` : 'No reports yet'}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{completed.length}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">Detailed feedback</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completion</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{total > 0 ? Math.round((completed.length / total) * 100) : 0}%</div>
              <p className="mt-0.5 text-xs text-muted-foreground">Interview completion rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Interviews */}
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Interviews</CardTitle>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link href="/dashboard/interviews">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                <Mic className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">No interviews yet</p>
              <Button asChild variant="link" size="sm" className="mt-1"><Link href="/dashboard/interviews/new">Start your first</Link></Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((i) => (
                <Link key={i.id} href={`/dashboard/interviews/${i.id}`}
                  className="flex items-center justify-between rounded-xl border border-border/40 p-4 transition-all hover:border-border hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${i.type === 'TECHNICAL' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {i.type === 'TECHNICAL' ? <FileText className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium capitalize">{i.type?.toLowerCase()}</span>
                        {i.targetRole && <span className="text-xs text-muted-foreground">{i.targetRole}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(i.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {i.feedback?.overallScore != null && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold tabular-nums">{i.feedback.overallScore}</span>
                      </div>
                    )}
                    <Badge variant={i.status === 'COMPLETED' ? 'default' : 'secondary'} className="text-[10px]">
                      {i.status === 'COMPLETED' ? 'Done' : i.status.toLowerCase()}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
