'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ClipboardCheck, Star, ArrowRight, Loader2, Mic, FileText } from 'lucide-react';

interface InterviewItem {
  id: string;
  type: string;
  targetRole: string | null;
  experienceLevel: string | null;
  status: string;
  createdAt: string;
  feedback?: { overallScore: number } | null;
}

export default function ReportsPage() {
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/interviews?limit=50', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        const all = (d.data?.data ?? []) as InterviewItem[];
        setInterviews(all.filter(i => i.status === 'COMPLETED' && i.feedback?.overallScore != null));
      })
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  const avgScore = interviews.length > 0
    ? Math.round(interviews.reduce((s, i) => s + (i.feedback?.overallScore ?? 0), 0) / interviews.length)
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {interviews.length > 0
            ? `${interviews.length} completed interview${interviews.length !== 1 ? 's' : ''}${avgScore ? ` · Avg score: ${avgScore}/100` : ''}`
            : 'Your feedback reports will appear here'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : interviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20">
          <ClipboardCheck className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">No reports yet</p>
          <p className="text-xs text-muted-foreground">Complete an interview and generate a report to see it here</p>
          <Button asChild className="mt-6 gap-1.5">
            <Link href="/dashboard/interviews/new"><Mic className="h-4 w-4" /> Start Interview</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((i) => (
            <Link
              key={i.id}
              href={`/dashboard/interviews/${i.id}/report`}
              className="group block rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-center gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/5 transition-colors group-hover:bg-primary/10">
                  {i.type === 'TECHNICAL' ? <FileText className="h-5 w-5 text-primary" /> : <Mic className="h-5 w-5 text-primary" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold capitalize">{i.type?.toLowerCase()}</span>
                    <span className="text-sm text-muted-foreground">·</span>
                    <span className="text-sm text-muted-foreground truncate">{i.targetRole || 'General'}</span>
                    <span className="text-sm text-muted-foreground">·</span>
                    <span className="text-sm capitalize text-muted-foreground">{(i.experienceLevel ?? 'mid').toLowerCase()}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{new Date(i.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold tabular-nums">{i.feedback?.overallScore}</span>
                  <span className="text-muted-foreground">/100</span>
                </div>
                <Badge variant="default">Done</Badge>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
